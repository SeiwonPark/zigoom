import { logger } from '@configs/logger.config'
import { Prisma, User } from '@db/mysql/generated/mysql'
import { ErrorCode, RequestError } from '@shared/errors'
import { Token } from '@shared/types/common'

import { inject, injectable } from 'tsyringe'

import UserRepository, { JoinedUser } from '../repositories/UserRepository'
import { isUpdateUserSchema } from '../validations/user.validation'

interface RequestPayload {
  payload: Token
  include: boolean
  data: any
}

@injectable()
export default class UpdateUserService {
  constructor(
    @inject('UserRepository')
    private userRepository: UserRepository
  ) {}

  public async execute({ payload, include, data }: RequestPayload): Promise<User | JoinedUser> {
    const validatedData = this.getValidatedData(data)
    await this.ensureUserExists(payload.sub)

    return await this.userRepository.update(payload.sub, validatedData, include)
  }

  private getValidatedData(data: any): Prisma.UserUpdateInput {
    if (!isUpdateUserSchema(data)) {
      logger.error('Invalid payload type for UpdateUserSchema.')
      throw new RequestError('Invalid payload type for UpdateUserSchema.', ErrorCode.BadRequest)
    }
    return data
  }

  private async ensureUserExists(googleId: string): Promise<void> {
    const user = await this.userRepository.findUserByGoogleId(googleId)
    if (!user) {
      logger.error(`User doesn't exist by id '${googleId}'`)
      throw new RequestError(`User doesn't exist by id '${googleId}'`, ErrorCode.NotFound)
    }
  }
}
