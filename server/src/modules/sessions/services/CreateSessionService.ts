import { injectable, inject } from 'tsyringe'
import { Prisma, Session, User } from '@db/mysql/generated/mysql'
import { isCreateSessionSchema } from '../validations/session.validation'
import SessionRepository, { JoinedSession } from '../repositories/SessionRepository'
import UserRepository from '@modules/users/repositories/UserRepository'
import { CustomError, ErrorCode } from '@shared/errors'
import { redisClient } from '@configs/redis.config'
import { Token } from '@shared/types/common'

interface RequestPayload {
  payload: Token
  sessionId: string
  title: string
  isPrivate?: boolean
}

@injectable()
export default class CreateSessionService {
  // FIXME: limit to 9 users for now
  private readonly MAX_USERS = 9

  constructor(
    @inject('UserRepository')
    private userRepository: UserRepository,
    @inject('SessionRepository')
    private sessionRepository: SessionRepository,
  ) {}

  public async execute({
    payload,
    sessionId,
    title,
    isPrivate = false,
  }: RequestPayload): Promise<Session | JoinedSession> {
    const existingSession = await this.getSessionById(sessionId)

    if (existingSession) {
      await this.ensureSessionAvailability(existingSession)
    }

    if (payload.isGuest) {
      return await this.handleGuestUser(existingSession, payload, sessionId, title, isPrivate)
    } else {
      return await this.handleAuthenticatedUser(existingSession, payload.sub, sessionId, title, isPrivate)
    }
  }

  private async handleGuestUser(
    existingSession: JoinedSession | null,
    payload: Token,
    sessionId: string,
    title: string,
    isPrivate: boolean,
  ): Promise<Session | JoinedSession> {
    if (!existingSession) {
      const [createdSession, _] = await Promise.all([
        this.createSession(sessionId, title, payload.id, isPrivate),
        redisClient.sAdd(`session:${sessionId}:participants`, payload.id),
      ])
      return createdSession
    } else {
      await Promise.all([
        this.joinSession(sessionId, payload.id, true),
        redisClient.sAdd(`session:${sessionId}:participants`, payload.id),
      ])
      return existingSession
    }
  }

  private async handleAuthenticatedUser(
    existingSession: JoinedSession | null,
    googleId: string,
    sessionId: string,
    title: string,
    isPrivate: boolean,
  ): Promise<Session | JoinedSession> {
    const existingUser = await this.getUserByGoogleId(googleId)

    if (existingSession) {
      const updatedSession = await this.joinSession(sessionId, existingUser.id, false)
      return updatedSession || existingSession
    } else {
      return await this.createSession(sessionId, title, existingUser, isPrivate)
    }
  }

  // FIXME: handle when the host is guest
  private async ensureSessionAvailability(session: JoinedSession): Promise<void> {
    const numOfGuests = await this.countParticipantsInSession(session.id)
    if (session && session.users.length + numOfGuests === this.MAX_USERS) {
      throw new CustomError(`Session '${session.id}' is now full`, ErrorCode.Forbidden)
    }
  }

  private async getUserByGoogleId(googleId: string): Promise<User> {
    const user = await this.userRepository.findUserByGoogleId(googleId)
    if (!user) {
      throw new CustomError(`No user has been found by google id '${googleId}'`, ErrorCode.BadRequest)
    }
    return user
  }

  private async getSessionById(sessionId: string): Promise<JoinedSession | null> {
    return await this.sessionRepository.findById(sessionId, true)
  }

  private async joinSession(
    sessionId: string,
    userId: string,
    isGuest: boolean,
  ): Promise<Session | JoinedSession | undefined> {
    if (!isGuest) {
      const sessionUpdateData: Prisma.SessionUpdateInput = {
        users: {
          connect: [{ id: userId }],
        },
      }
      return await this.sessionRepository.update(sessionId, sessionUpdateData, true)
    }
  }

  private async createSession(
    sessionId: string,
    title: string,
    user: User | string,
    isPrivate: boolean,
  ): Promise<Session | JoinedSession> {
    let sessionData

    // when it's a guest
    if (typeof user === 'string') {
      sessionData = {
        id: sessionId,
        host: user,
        title: title,
        isPrivate: isPrivate,
      }
    }
    // when it's a user
    else {
      sessionData = {
        id: sessionId,
        host: user.google_id,
        title: title,
        isPrivate: isPrivate,
        users: {
          connect: { id: user.id },
        },
      }
    }

    if (!isCreateSessionSchema(sessionData)) {
      throw new CustomError('Invalid payload type for CreateSessionSchema.', ErrorCode.BadRequest)
    }

    return await this.sessionRepository.save(sessionData, true)
  }

  private async countParticipantsInSession(sessionId: string): Promise<number> {
    return await redisClient.sCard(`session:${sessionId}:participants`)
  }
}
