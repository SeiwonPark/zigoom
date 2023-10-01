import { injectable, inject } from 'tsyringe'
import { Prisma, User } from '@db/mysql/generated/mysql'
import { isUpdateUserSchema } from '../validations/user.validation'
import UserRepository from '../repositories/UserRepository'
import { CustomError, ErrorCode } from '@shared/errors'
import { decodeToken } from '@utils/token'

interface RequestPayload {
  jwt: string
  googleId: string
  data: any
}

@injectable()
export default class UpdateUserService {
  constructor(
    @inject('UserRepository')
    private userRepository: UserRepository,
  ) {}

  public async execute({ jwt, googleId, data }: RequestPayload): Promise<User> {
    const payload = await decodeToken(jwt)

    if (!payload) {
      throw new CustomError('Failed to get payload from token', ErrorCode.Unauthorized)
    }

    if (Date.now() >= payload.exp * 1000) {
      throw new CustomError('The token has been expired', ErrorCode.Unauthorized)
    }

    const user = await this.getUserByGoogleId(googleId)

    if (!user) {
      throw new CustomError(`User doesn't exist by id '${googleId}'`, ErrorCode.NotFound)
    }

    const userUpdateData: Prisma.UserUpdateInput = {
      ...data,
    }

    if (!isUpdateUserSchema(userUpdateData)) {
      throw new CustomError('Invalid payload type for UpdateUserSchema.', ErrorCode.BadRequest)
    }

    return await this.userRepository.update(googleId, userUpdateData)
  }

  async getUserByGoogleId(googleId: string): Promise<User | null> {
    return await this.userRepository.findUserByGoogleId(googleId)
  }
}
