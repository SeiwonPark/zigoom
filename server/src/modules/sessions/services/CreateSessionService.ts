import type { TokenPayload } from 'google-auth-library'
import { injectable, inject } from 'tsyringe'
import { Prisma, Session, User } from '@db/mysql/generated/mysql'
import { isCreateSessionSchema } from '../validations/session.validation'
import SessionRepository, { JoinedSession } from '../repositories/SessionRepository'
import UserRepository from '@modules/users/repositories/UserRepository'
import { CustomError, ErrorCode } from '@shared/errors'

type Token = TokenPayload & { isGuest: boolean }

interface RequestPayload {
  payload: Token
  id: string
  title: string
  isPrivate?: boolean
}

@injectable()
export default class CreateSessionService {
  constructor(
    @inject('UserRepository')
    private userRepository: UserRepository,
    @inject('SessionRepository')
    private sessionRepository: SessionRepository,
  ) {}

  public async execute({ payload, id, title, isPrivate = false }: RequestPayload): Promise<Session | JoinedSession> {
    if (payload.isGuest) {
      // TODO: handle guest
    }

    const existingUser = await this.getUserByGoogleId(payload.sub)
    const existingSession = await this.getSessionById(id)

    if (existingSession) {
      return await this.joinRoom(id, existingUser.id)
    } else {
      return await this.createRoom(id, title, existingUser, isPrivate)
    }
  }

  private async getUserByGoogleId(googleId: string): Promise<User> {
    const user = await this.userRepository.findUserByGoogleId(googleId)
    if (!user) {
      throw new CustomError(`No user has been found by google id '${googleId}'`, ErrorCode.BadRequest)
    }
    return user
  }

  private async getSessionById(sessionId: string): Promise<Session | null> {
    return await this.sessionRepository.findById(sessionId)
  }

  private async joinRoom(id: string, userId: string): Promise<Session | JoinedSession> {
    const sessionUpdateData: Prisma.SessionUpdateInput = {
      users: {
        connect: [{ id: userId }],
      },
    }
    return await this.sessionRepository.update(id, sessionUpdateData, true)
  }

  private async createRoom(
    id: string,
    title: string,
    user: User,
    isPrivate: boolean,
  ): Promise<Session | JoinedSession> {
    const sessionData = {
      id: id,
      host: user.google_id,
      title: title,
      isPrivate: isPrivate,
      users: {
        connect: { id: user.id },
      },
    }

    if (!isCreateSessionSchema(sessionData)) {
      throw new CustomError('Invalid payload type for CreateSessionSchema.', ErrorCode.BadRequest)
    }

    return await this.sessionRepository.save(sessionData, true)
  }
}
