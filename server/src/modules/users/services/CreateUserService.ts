import { logger } from '@configs/logger.config'
import { Prisma, User } from '@db/mysql/generated/mysql'
import { ErrorCode, RequestError } from '@shared/errors'
import { Token } from '@shared/types/common'

import { inject, injectable } from 'tsyringe'

import UserRepository, { JoinedUser } from '../repositories/UserRepository'
import { isCreateUserSchema } from '../validations/user.validation'

interface RequestPayload {
  readonly payload: Token
}

@injectable()
export default class CreateUserService {
  constructor(
    @inject('UserRepository')
    private userRepository: UserRepository
  ) {}

  public async execute({ payload }: RequestPayload): Promise<User | JoinedUser> {
    const userData = this.getValidatedData(payload)
    await this.ensureUserNotExists(payload.sub)

    return await this.userRepository.save(userData, true)
  }

  private getValidatedData(data: any): Prisma.UserCreateInput {
    const userData = {
      google_id: data.sub,
      name: data.name || 'Anonymous User',
      profileThumbnail: '', // FIXME: bucket url
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

  private async ensureUserNotExists(googleId: string): Promise<void> {
    const user = await this.userRepository.findUserByGoogleId(googleId)
    if (user) {
      logger.error(`User already exists by google id '${googleId}'`)
      throw new RequestError(`User already exists by google id '${googleId}'`, ErrorCode.Conflict)
    }
  }
}
