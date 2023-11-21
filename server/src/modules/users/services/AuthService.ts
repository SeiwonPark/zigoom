import { logger } from '@configs/logger.config'
import { Prisma, User } from '@db/mysql/generated/mysql'
import { ErrorCode, RequestError } from '@shared/errors'

import { TokenPayload } from 'google-auth-library'
import { inject, injectable } from 'tsyringe'

import UserRepository, { JoinedUser } from '../repositories/UserRepository'
import { isCreateUserSchema } from '../validations/user.validation'

interface RequestPayload {
  payload: TokenPayload
}

@injectable()
export default class AuthService {
  constructor(
    @inject('UserRepository')
    private userRepository: UserRepository
  ) {}

  public async execute({ payload }: RequestPayload): Promise<User | JoinedUser | null> {
    const user = await this.userRepository.findUserByGoogleId(payload.sub, true)

    if (user) {
      return user
    }

    const userData = this.getValidatedData(payload)
    return await this.userRepository.save(userData, true)
  }

  private getValidatedData(data: any): Prisma.UserCreateInput {
    const userData = {
      google_id: data.sub,
      name: data.name || 'Anonymous User',
      profileThumbnail: data.picture || '', // FIXME: bucket url
      profile: {
        create: {
          family_name: data.family_name,
          given_name: data.given_name,
          profileImage: data.picture || '', // FIXME: bucket url
          email: data.email,
        },
      },
    }

    if (!isCreateUserSchema(userData)) {
      logger.error('Invalid payload type for CreateUserSchema.')
      throw new RequestError('Invalid payload type for CreateUserSchema.', ErrorCode.BadRequest)
    }

    return userData
  }
}
