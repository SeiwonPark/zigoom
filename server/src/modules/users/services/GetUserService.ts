import { logger } from '@configs/logger.config'
import { User } from '@db/mysql/generated/mysql'
import { CustomError, ErrorCode } from '@shared/errors'
import { Token } from '@shared/types/common'

import { inject, injectable } from 'tsyringe'

import UserRepository, { JoinedUser } from '../repositories/UserRepository'

interface RequestPayload {
  payload: Token
  include: boolean
}

@injectable()
export default class GetUserService {
  constructor(
    @inject('UserRepository')
    private userRepository: UserRepository
  ) {}

  public async execute({ payload, include }: RequestPayload): Promise<User | JoinedUser | null> {
    const user = await this.userRepository.findUserByGoogleId(payload.sub, include)
    if (!user) {
      logger.error(`User doesn't exist by id '${payload.sub}'`)
      throw new CustomError(`User doesn't exist by id '${payload.sub}'`, ErrorCode.NotFound)
    }
    return user
  }
}
