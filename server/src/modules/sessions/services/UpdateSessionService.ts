import type { TokenPayload } from 'google-auth-library'
import { injectable, inject } from 'tsyringe'
import UserRepository from '@modules/users/repositories/UserRepository'
import SessionRepository, { JoinedSession } from '../repositories/SessionRepository'
import { Prisma, Session } from '@db/mysql/generated/mysql'
import { CustomError, ErrorCode } from '@shared/errors'
import { isUpdateSessionSchema } from '../validations/session.validation'

type Token = TokenPayload & { isGuest: boolean }

interface RequestPayload {
  payload: Token
  sessionId: string
  data: any
}

@injectable()
export default class UpdateSessionService {
  constructor(
    @inject('UserRepository')
    private userRepository: UserRepository,
    @inject('SessionRepository')
    private sessionRepository: SessionRepository,
  ) {}

  public async execute({ payload, sessionId, data }: RequestPayload): Promise<Session | JoinedSession> {
    if (payload.isGuest) {
      // TODO: handle guest
    }

    const session = await this.getSessionById(sessionId)

    if (!session) {
      throw new CustomError(`Session doesn't exist by id '${sessionId}'`, ErrorCode.NotFound)
    }

    const sessionUpdateData: Prisma.SessionUpdateInput = {
      ...data,
    }

    if (!isUpdateSessionSchema(sessionUpdateData)) {
      throw new CustomError('Invalid payload type for UpdateSessionSchema', ErrorCode.BadRequest)
    }

    return await this.sessionRepository.update(sessionId, sessionUpdateData, true)
  }

  async getSessionById(sessionId: string): Promise<Session | null> {
    return await this.sessionRepository.findById(sessionId)
  }
}
