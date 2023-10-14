import { logger } from '@configs/logger.config'
import { Session } from '@db/mysql/generated/mysql'
import { CustomError, ErrorCode } from '@shared/errors'
import { Token } from '@shared/types/common'

import { inject, injectable } from 'tsyringe'

import SessionRepository from '../repositories/SessionRepository'

interface RequestPayload {
  payload: Token
  sessionId: string
}

@injectable()
export default class GetSessionService {
  constructor(
    @inject('SessionRepository')
    private sessionRepository: SessionRepository
  ) {}

  public async execute({ payload, sessionId }: RequestPayload): Promise<Session | null> {
    const session = await this.ensureSessionExists(sessionId)
    this.handlePrivateSession(payload.isGuest, session.isPrivate)

    return await this.sessionRepository.findById(sessionId)
  }

  private async ensureSessionExists(sessionId: string): Promise<Session> {
    const session = await this.sessionRepository.findById(sessionId)
    if (!session) {
      logger.error(`Session doesn't exist by id '${sessionId}'`)
      throw new CustomError(`Session doesn't exist by id '${sessionId}'`, ErrorCode.NotFound)
    }
    return session
  }

  private handlePrivateSession(isGuest: boolean, isPrivate: boolean): void {
    if (isGuest && isPrivate) {
      logger.error('Authentication is required to get private session')
      throw new CustomError('Authentication is required to get private session', ErrorCode.Unauthorized)
    }
  }
}
