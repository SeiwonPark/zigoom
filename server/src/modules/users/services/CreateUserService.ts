import { injectable, inject } from 'tsyringe'
import { Prisma, User } from '@db/mysql/generated/mysql'
import { isCreateUserSchema } from '../validations/user.validation'
import UserRepository, { JoinedUser } from '../repositories/UserRepository'
import { CustomError, ErrorCode } from '@shared/errors'
import { Token } from '@shared/types/common'

interface RequestPayload {
  payload: Token
}

@injectable()
export default class CreateUserService {
  constructor(
    @inject('UserRepository')
    private userRepository: UserRepository,
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
      throw new CustomError('Invalid payload type for CreateUserSchema.', ErrorCode.BadRequest)
    }

    return userData
  }

  private async ensureUserNotExists(googleId: string): Promise<void> {
    const user = await this.userRepository.findUserByGoogleId(googleId)
    if (user) {
      throw new CustomError(`User already exists by google id '${googleId}'`, ErrorCode.Conflict)
    }
  }
}
