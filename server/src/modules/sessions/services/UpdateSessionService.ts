import { injectable, inject } from 'tsyringe'
import SessionRepository, { JoinedSession } from '../repositories/SessionRepository'
import { Prisma, Session } from '@db/mysql/generated/mysql'
import { CustomError, ErrorCode } from '@shared/errors'
import { isUpdateSessionSchema } from '../validations/session.validation'
import { Token } from '@shared/types/common'
import { redisClient } from '@configs/redis.config'

interface RequestPayload {
  payload: Token
  sessionId: string
  data: any
}

@injectable()
export default class UpdateSessionService {
  constructor(
    @inject('SessionRepository')
    private sessionRepository: SessionRepository,
  ) {}

  public async execute({ payload, sessionId, data }: RequestPayload): Promise<Session | JoinedSession> {
    const validatedData = this.getValidatedData(data)
    const [existingSession, numOfGuests] = await Promise.all([
      this.ensureSessionExists(sessionId),
      this.countParticipantsInSession(sessionId),
    ])
    this.ensureSessionOwner(payload.sub || payload.id, existingSession)

    if (payload.isGuest) {
      return await this.handleGuestUser(existingSession, numOfGuests)
    } else {
      return await this.handleAuthenticatedUser(existingSession, validatedData, numOfGuests)
    }
  }

  private async handleGuestUser(session: JoinedSession, numOfGuests: number): Promise<Session | JoinedSession> {
    if (session.users.length === 0 && numOfGuests === 1) {
      const [_, deletedSession] = await Promise.all([
        redisClient.del(`session:${session.id}:participants`),
        this.sessionRepository.deleteById(session.id),
      ])
      return deletedSession
    }

    await redisClient.del(`session:${session.id}:participants`)
    return session
  }

  private async handleAuthenticatedUser(
    session: JoinedSession,
    data: any,
    numOfGuests: number,
  ): Promise<Session | JoinedSession> {
    if (session?.users.length === 1 && numOfGuests === 0) {
      const deletedSession = await this.sessionRepository.deleteById(session.id)
      return deletedSession
    }

    return await this.sessionRepository.update(session.id, data, true)
  }

  private getValidatedData(data: any): Prisma.SessionUpdateInput {
    if (!isUpdateSessionSchema(data)) {
      throw new CustomError('Invalid payload type for UpdateSessionSchema', ErrorCode.BadRequest)
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
      throw new CustomError(`Session doesn't exist by id '${sessionId}'`, ErrorCode.NotFound)
    }
    return session
  }

  private ensureSessionOwner(userId: string, existingSession: Session): void {
    if (userId !== existingSession.host) {
      throw new CustomError('Only the session host can perform this action', ErrorCode.Unauthorized)
    }
  }

  private async countParticipantsInSession(sessionId: string): Promise<number> {
    return await redisClient.sCard(`session:${sessionId}:participants`)
  }
}
