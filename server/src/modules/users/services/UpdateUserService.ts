import type { TokenPayload } from 'google-auth-library'
import { injectable, inject } from 'tsyringe'
import { Prisma, User } from '@db/mysql/generated/mysql'
import { isUpdateUserSchema } from '../validations/user.validation'
import UserRepository, { JoinedUser } from '../repositories/UserRepository'
import { CustomError, ErrorCode } from '@shared/errors'

type Token = TokenPayload & { isGuest: boolean }

interface RequestPayload {
  payload: Token
  include: boolean
  data: any
}

@injectable()
export default class UpdateUserService {
  constructor(
    @inject('UserRepository')
    private userRepository: UserRepository,
  ) {}

  public async execute({ payload, include, data }: RequestPayload): Promise<User | JoinedUser> {
    const user = await this.getUserByGoogleId(payload.sub)

    if (!user) {
      throw new CustomError(`User doesn't exist by id '${payload.sub}'`, ErrorCode.NotFound)
    }

    const userUpdateData: Prisma.UserUpdateInput = {
      ...data,
    }

    if (!isUpdateUserSchema(userUpdateData)) {
      throw new CustomError('Invalid payload type for UpdateUserSchema.', ErrorCode.BadRequest)
    }

    return await this.userRepository.update(payload.sub, userUpdateData, include)
  }

  async getUserByGoogleId(googleId: string): Promise<User | null> {
    return await this.userRepository.findUserByGoogleId(googleId)
  }
}
