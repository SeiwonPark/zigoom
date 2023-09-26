import { injectable, inject } from 'tsyringe'
import { Prisma, User } from '@prisma/mysql/generated/mysql'
import { isUpdateUserSchema } from '../validations/user.validation'
import UserRepository from '../repositories/UserRepository'

@injectable()
export default class UpdateUserService {
  constructor(
    @inject('UserRepository')
    private userRepository: UserRepository,
  ) {}

  public async execute(googleId: string, payload: any): Promise<User> {
    try {
      const user = await this.getUserByGoogleId(googleId)

      if (!user) {
        throw new Error(`User doesn't exist by id '${googleId}'`)
      }

      const userUpdateData: Prisma.UserUpdateInput = {
        ...payload,
      }

      if (!isUpdateUserSchema(userUpdateData)) {
        throw new Error('Invalid payload type for UpdateUserSchema.')
      }

      return await this.userRepository.update(googleId, userUpdateData)
    } catch (e) {
      console.error('[updateUserService] ERR: ', e)
      throw e
    }
  }

  async getUserByGoogleId(googleId: string): Promise<User | null> {
    return await this.userRepository.findUserByGoogleId(googleId)
  }
}
