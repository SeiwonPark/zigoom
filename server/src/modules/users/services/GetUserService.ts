import { injectable, inject } from 'tsyringe'
import UserRepository from '../repositories/UserRepository'
import { User } from '@prisma/mysql/generated/mysql'

@injectable()
export default class GetUserService {
  constructor(
    @inject('UserRepository')
    private userRepository: UserRepository,
  ) {}

  public async execute(googleId: string, profile = false): Promise<User | undefined> {
    try {
      const user = await this.getUserByGoogleId(googleId, profile)

      if (!user) {
        throw new Error(`User doesn't exist by id '${googleId}'`)
      }

      return user
    } catch (e) {
      console.error('[updateUserService] ERR: ', e)
      throw e
    }
  }

  async getUserByGoogleId(googleId: string, profile: boolean): Promise<User | null> {
    return await this.userRepository.findUserByGoogleId(googleId, profile)
  }
}
