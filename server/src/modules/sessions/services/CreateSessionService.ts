import type { TokenPayload } from 'google-auth-library'
import { injectable, inject } from 'tsyringe'
import { Prisma, Session } from '@db/mysql/generated/mysql'
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

    const googleId = payload.sub
    const existingUser = await this.userRepository.findUserByGoogleId(googleId)

    if (!existingUser) {
      throw new CustomError(`No user has been found by google id '${googleId}'`, ErrorCode.BadRequest)
    }

    const existingSession = await this.getSessionById(id)

    // attempts to join the existing room
    if (existingSession) {
      const sessionUpdateData: Prisma.SessionUpdateInput = {
        users: {
          connect: [{ id: existingUser.id }],
        },
      }
      return await this.sessionRepository.update(id, sessionUpdateData, true)
    }

    // attempts to create a new room
    const sessionData: Prisma.SessionCreateInput = {
      id: id,
      host: googleId,
      title: title,
      isPrivate: isPrivate,
      users: {
        connect: { id: existingUser.id },
      },
    }

    if (!isCreateSessionSchema(sessionData)) {
      throw new CustomError('Invalid payload type for CreateSessionSchema.', ErrorCode.BadRequest)
    }

    return await this.sessionRepository.save(sessionData, true)
  }

  async getSessionById(sessionId: string): Promise<Session | null> {
    return await this.sessionRepository.findById(sessionId)
  }
}
