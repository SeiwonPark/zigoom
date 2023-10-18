import { logger } from '@configs/logger.config'
import { redisClient } from '@configs/redis.config'
import { Prisma, Session, User } from '@db/mysql/generated/mysql'
import UserRepository from '@modules/users/repositories/UserRepository'
import { ErrorCode, RequestError } from '@shared/errors'
import { Token } from '@shared/types/common'

import { inject, injectable } from 'tsyringe'

import SessionRepository, { JoinedSession } from '../repositories/SessionRepository'
import { isCreateSessionSchema } from '../validations/session.validation'

interface RequestPayload {
  payload: Token
  sessionId: string
  title: string
  isPrivate?: boolean
}

@injectable()
export default class JoinSessionService {
  // FIXME: limit to 9 users for now
  private readonly MAX_USERS = 9

  constructor(
    @inject('UserRepository')
    private userRepository: UserRepository,
    @inject('SessionRepository')
    private sessionRepository: SessionRepository
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
    isPrivate: boolean
  ): Promise<Session | JoinedSession> {
    if (!existingSession) {
      const [createdSession, _] = await Promise.all([
        this.createSession(sessionId, title, payload.id, isPrivate),
        redisClient.sAdd(`session:${sessionId}:participants`, payload.id),
      ])
      logger.info(`Guest '${payload.id}' has created a new session '${sessionId}'`)
      logger.info(`Added redis key session:${sessionId}:participants`)
      return createdSession
    } else {
      await redisClient.sAdd(`session:${sessionId}:participants`, payload.id)
      logger.info(`Guest '${payload.id}' has joined the session '${sessionId}'`)
      logger.info(`Added redis key session:${sessionId}:participants`)
      return existingSession
    }
  }

  private async handleAuthenticatedUser(
    existingSession: JoinedSession | null,
    googleId: string,
    sessionId: string,
    title: string,
    isPrivate: boolean
  ): Promise<Session | JoinedSession> {
    const existingUser = await this.getUserByGoogleId(googleId)

    if (existingSession) {
      const updatedSession = await this.joinSession(sessionId, existingUser.id)
      logger.info(`User '${existingUser.google_id}' has joined the session '${sessionId}'`)
      return updatedSession || existingSession
    } else {
      const createdSession = await this.createSession(sessionId, title, existingUser, isPrivate)
      logger.info(`User '${existingUser.google_id}' has created a new session '${sessionId}'`)
      return createdSession
    }
  }

  // FIXME: handle when the host is guest
  private async ensureSessionAvailability(session: JoinedSession): Promise<void> {
    const numOfGuests = await this.countParticipantsInSession(session.id)
    if (session && session.users.length + numOfGuests === this.MAX_USERS) {
      logger.error(`Session '${session.id}' is now full`)
      throw new RequestError(`Session '${session.id}' is now full`, ErrorCode.Forbidden)
    }
  }

  private async getUserByGoogleId(googleId: string): Promise<User> {
    const user = await this.userRepository.findUserByGoogleId(googleId)
    if (!user) {
      logger.error(`No user has been found by google id '${googleId}'`)
      throw new RequestError(`No user has been found by google id '${googleId}'`, ErrorCode.BadRequest)
    }
    return user
  }

  private async getSessionById(sessionId: string): Promise<JoinedSession | null> {
    return await this.sessionRepository.findById(sessionId, true)
  }

  private async joinSession(sessionId: string, userId: string): Promise<Session | JoinedSession> {
    const sessionUpdateData: Prisma.SessionUpdateInput = {
      users: {
        connect: [{ id: userId }],
      },
    }
    return await this.sessionRepository.update(sessionId, sessionUpdateData, true)
  }

  private async createSession(
    sessionId: string,
    title: string,
    user: User | string,
    isPrivate: boolean
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
      logger.error('Invalid payload type for CreateSessionSchema.')
      throw new RequestError('Invalid payload type for CreateSessionSchema.', ErrorCode.BadRequest)
    }

    return await this.sessionRepository.save(sessionData, true)
  }

  private async countParticipantsInSession(sessionId: string): Promise<number> {
    return await redisClient.sCard(`session:${sessionId}:participants`)
  }
}
