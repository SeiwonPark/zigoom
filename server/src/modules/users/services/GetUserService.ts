import { injectable, inject } from 'tsyringe'
import UserRepository, { JoinedUser } from '../repositories/UserRepository'
import { User } from '@db/mysql/generated/mysql'
import { CustomError, ErrorCode } from '@shared/errors'
import { Token } from '@shared/types/common'

interface RequestPayload {
  payload: Token
  include: boolean
}

@injectable()
export default class GetUserService {
  constructor(
    @inject('UserRepository')
    private userRepository: UserRepository,
  ) {}

  public async execute({ payload, include }: RequestPayload): Promise<User | JoinedUser | null> {
    const user = await this.userRepository.findUserByGoogleId(payload.sub, include)
    if (!user) {
      throw new CustomError(`User doesn't exist by id '${payload.sub}'`, ErrorCode.NotFound)
    }
    return user
  }
}
