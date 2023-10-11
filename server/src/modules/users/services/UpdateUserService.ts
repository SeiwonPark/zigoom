import { injectable, inject } from 'tsyringe'
import { Prisma, User } from '@db/mysql/generated/mysql'
import { isUpdateUserSchema } from '../validations/user.validation'
import UserRepository, { JoinedUser } from '../repositories/UserRepository'
import { CustomError, ErrorCode } from '@shared/errors'
import { Token } from '@shared/types/common'
import { logger } from '@configs/logger.config'

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
    const validatedData = this.getValidatedData(data)
    await this.ensureUserExists(payload.sub)

    return await this.userRepository.update(payload.sub, validatedData, include)
  }

  private getValidatedData(data: any): Prisma.UserUpdateInput {
    if (!isUpdateUserSchema(data)) {
      logger.error('Invalid payload type for UpdateUserSchema.')
      throw new CustomError('Invalid payload type for UpdateUserSchema.', ErrorCode.BadRequest)
    }
    return data
  }

  private async ensureUserExists(googleId: string): Promise<void> {
    const user = await this.userRepository.findUserByGoogleId(googleId)
    if (!user) {
      logger.error(`User doesn't exist by id '${googleId}'`)
      throw new CustomError(`User doesn't exist by id '${googleId}'`, ErrorCode.NotFound)
    }
  }
}
