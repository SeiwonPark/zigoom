import type { TokenPayload } from 'google-auth-library'
import { injectable, inject } from 'tsyringe'
import { Prisma, User } from '@db/mysql/generated/mysql'
import { isCreateUserSchema } from '../validations/user.validation'
import UserRepository, { JoinedUser } from '../repositories/UserRepository'
import { CustomError, ErrorCode } from '@shared/errors'

type Token = TokenPayload & { isGuest: boolean }

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
    const googleId = payload.sub
    const existingUser = await this.getUserByGoogleId(googleId)

    if (existingUser) {
      throw new CustomError(`User already exists by google id '${googleId}'`, ErrorCode.Conflict)
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
      throw new CustomError('Invalid payload type for CreateUserSchema.', ErrorCode.BadRequest)
    }

    return await this.userRepository.save(userData, true)
  }

  async getUserByGoogleId(googleId: string): Promise<User | null> {
    return await this.userRepository.findUserByGoogleId(googleId)
  }
}
