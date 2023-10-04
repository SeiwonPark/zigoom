import type { TokenPayload } from 'google-auth-library'
import { injectable, inject } from 'tsyringe'
import SessionRepository from '../repositories/SessionRepository'
import { CustomError, ErrorCode } from '@shared/errors'
import { Session } from '@db/mysql/generated/mysql'

type Token = TokenPayload & { isGuest: boolean }

interface RequestPayload {
  payload: Token
  sessionId: string
}

@injectable()
export default class GetSessionService {
  constructor(
    @inject('SessionRepository')
    private sessionRepository: SessionRepository,
  ) {}

  public async execute({ payload, sessionId }: RequestPayload): Promise<Session | null> {
    if (payload.isGuest) {
      // TODO: handle guest
    }

    const session = await this.getSessionById(sessionId)

    if (!session) {
      throw new CustomError(`Session doesn't exist by id '${sessionId}'`, ErrorCode.NotFound)
    }

    return await this.sessionRepository.findById(sessionId)
  }

  async getSessionById(sessionId: string): Promise<Session | null> {
    return await this.sessionRepository.findById(sessionId)
  }
}
