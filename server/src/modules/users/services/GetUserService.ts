import { inject, injectable } from 'tsyringe'

import { logger } from '@configs/logger.config'
import { User } from '@db/mysql/generated/mysql'
import { ErrorCode, RequestError } from '@shared/errors'
import { Token } from '@shared/types/common'

import UserRepository, { JoinedUser } from '../repositories/UserRepository'

interface RequestPayload {
  readonly payload: Token
  include: boolean
}

@injectable()
export default class GetUserService {
  constructor(
    @inject('UserRepository')
    private userRepository: UserRepository
  ) {}

  public async execute({ payload, include }: RequestPayload): Promise<User | JoinedUser> {
    return await this.findUserByProviderId(payload.provider, payload.providerId, include)
  }

  private async findUserByProviderId(
    provider: string,
    providerId: string,
    includeProfile: boolean
  ): Promise<User | JoinedUser> {
    const user = await this.userRepository.findByProviderId(providerId, includeProfile)

    if (!user) {
      logger.error(`User doesn't exist by ${provider} id '${providerId}'`)
      throw new RequestError(`User doesn't exist by ${provider} id '${providerId}'`, ErrorCode.NotFound)
    }

    return user
  }
}
