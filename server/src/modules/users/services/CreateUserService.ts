import { injectable, inject } from 'tsyringe'
import { Prisma, User } from '@prisma/mysql/generated/mysql'
import { isCreateUserSchema } from '../validations/user.validation'
import UserRepository from '../repositories/UserRepository'
import { CustomError } from '@shared/errors/CustomError'
import { decodeToken } from '@utils/token'

interface RequestPayload {
  jwt: string
}

@injectable()
export default class CreateUserService {
  constructor(
    @inject('UserRepository')
    private userRepository: UserRepository,
  ) {}

  public async execute({ jwt }: RequestPayload): Promise<User> {
    const payload = await decodeToken(jwt)

    if (!payload) {
      throw new CustomError('Failed to get payload from token', 401)
    }

    if (Date.now() >= payload.exp * 1000) {
      throw new CustomError('The token has been expired', 401)
    }

    const googleId = payload.sub
    const existingUser = await this.getUserByGoogleId(googleId)

    if (existingUser) {
      throw new CustomError(`User already exists by google id '${googleId}'`, 409)
    }

    const userData: Prisma.UserCreateInput = {
      google_id: googleId,
      name: payload.name || 'Anonymous User',
      profileThumbnail: '', // FIXME: bucket url
      profile: {
        create: {
          family_name: payload.family_name,
          given_name: payload.given_name,
          profileImage: payload.picture || '', // FIXME: bucket url
          email: payload.email,
        },
      },
    }

    if (!isCreateUserSchema(userData)) {
      throw new CustomError('Invalid payload type for CreateUserSchema.', 400)
    }

    return await this.userRepository.save(userData)
  }

  async getUserByGoogleId(googleId: string): Promise<User | null> {
    return await this.userRepository.findUserByGoogleId(googleId)
  }
}
