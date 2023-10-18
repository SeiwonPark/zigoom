import { logger } from '@configs/logger.config'
import { redisClient } from '@configs/redis.config'
import { Prisma, Session } from '@db/mysql/generated/mysql'
import { ErrorCode, RequestError } from '@shared/errors'
import { Token } from '@shared/types/common'

import { inject, injectable } from 'tsyringe'

import SessionRepository, { JoinedSession } from '../repositories/SessionRepository'
import { isUpdateSessionSchema } from '../validations/session.validation'

interface RequestPayload {
  payload: Token
  sessionId: string
  data: any
}

@injectable()
export default class UpdateSessionService {
  constructor(
    @inject('SessionRepository')
    private sessionRepository: SessionRepository
  ) {}

  public async execute({ payload, sessionId, data }: RequestPayload): Promise<Session | JoinedSession> {
    const validatedData = this.getValidatedData(data)
    const [existingSession, numOfGuests] = await Promise.all([
      this.ensureSessionExists(sessionId),
      this.countParticipantsInSession(sessionId),
    ])

    const requestedUserId = payload.sub || payload.id
    this.ensureSessionOwner(requestedUserId, existingSession)

    if (payload.isGuest) {
      return await this.handleGuestUser(requestedUserId, existingSession, numOfGuests)
    } else {
      return await this.handleAuthenticatedUser(requestedUserId, existingSession, validatedData, numOfGuests)
    }
  }

  private async handleGuestUser(
    guestId: string,
    session: JoinedSession,
    numOfGuests: number
  ): Promise<Session | JoinedSession> {
    if (session.users.length === 0 && numOfGuests === 1) {
      const [_, deletedSession] = await Promise.all([
        redisClient.del(`session:${session.id}:participants`),
        this.sessionRepository.deleteById(session.id),
      ])
      logger.info(`Guest '${guestId}' has deleted the session '${session.id}'`)
      return deletedSession
    }

    await redisClient.del(`session:${session.id}:participants`)
    logger.info(`Deleted a redis key 'session:${session.id}:participants'`)
    return session
  }

  private async handleAuthenticatedUser(
    userId: string,
    session: JoinedSession,
    data: any,
    numOfGuests: number
  ): Promise<Session | JoinedSession> {
    if (session?.users.length === 1 && numOfGuests === 0) {
      const deletedSession = await this.sessionRepository.deleteById(session.id)
      logger.info(`User '${userId}' has deleted the session '${session.id}'`)
      return deletedSession
    }

    return await this.sessionRepository.update(session.id, data, true)
  }

  private getValidatedData(data: any): Prisma.SessionUpdateInput {
    if (!isUpdateSessionSchema(data)) {
      logger.error('Invalid payload type for UpdateSessionSchema')
      throw new RequestError('Invalid payload type for UpdateSessionSchema', ErrorCode.BadRequest)
    }

    const updatedUsersInSession = {
      // FIXME: do I need connect?
      connect: data.users?.filter((user: any) => user.connect).map((user: any) => ({ id: user.connect.id })) || [],
      disconnect:
        data.users?.filter((user: any) => user.disconnect).map((user: any) => ({ id: user.disconnect.id })) || [],
    }

    const sessionUpdateData = {
      ...data,
      users: updatedUsersInSession,
    }

    return sessionUpdateData
  }

  private async ensureSessionExists(sessionId: string): Promise<JoinedSession> {
    const session = await this.sessionRepository.findById(sessionId, true)
    if (!session) {
      logger.error(`Session doesn't exist by id '${sessionId}'`)
      throw new RequestError(`Session doesn't exist by id '${sessionId}'`, ErrorCode.NotFound)
    }
    return session
  }

  private ensureSessionOwner(userId: string, existingSession: Session): void {
    if (userId !== existingSession.host) {
      logger.error('Only the session host can perform this action')
      throw new RequestError('Only the session host can perform this action', ErrorCode.Unauthorized)
    }
  }

  private async countParticipantsInSession(sessionId: string): Promise<number> {
    return await redisClient.sCard(`session:${sessionId}:participants`)
  }
}
