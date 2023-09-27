import { injectable, inject } from 'tsyringe'
import UserRepository from '../repositories/UserRepository'
import { User } from '@prisma/mysql/generated/mysql'
import { CustomError } from '@shared/errors/CustomError'
import { decodeToken } from '@utils/token'

interface RequestPayload {
  jwt: string
  googleId: string
  profile: boolean
}

@injectable()
export default class GetUserService {
  constructor(
    @inject('UserRepository')
    private userRepository: UserRepository,
  ) {}

  public async execute({ jwt, googleId, profile }: RequestPayload): Promise<User | undefined> {
    const payload = await decodeToken(jwt)

    if (!payload) {
      throw new CustomError('Failed to get payload from token', 401)
    }

    if (Date.now() >= payload.exp * 1000) {
      throw new CustomError('The token has been expired', 401)
    }

    const user = await this.getUserByGoogleId(googleId, profile)

    if (!user) {
      throw new CustomError(`User doesn't exist by id '${googleId}'`, 404)
    }

    return user
  }

  async getUserByGoogleId(googleId: string, profile: boolean): Promise<User | null> {
    return await this.userRepository.findUserByGoogleId(googleId, profile)
  }
}
