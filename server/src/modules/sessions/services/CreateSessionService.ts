import { injectable, inject } from 'tsyringe'
import { Prisma, Session } from '@db/mysql/generated/mysql'
import { isCreateSessionSchema } from '../validations/session.validation'
import SessionRepository from '../repositories/SessionRepository'
import UserRepository from '@modules/users/repositories/UserRepository'
import { CustomError, ErrorCode } from '@shared/errors'
import { decodeToken } from '@utils/token'

interface RequestPayload {
  id: string
  title: string
  isPrivate?: boolean
  jwt: string
}

@injectable()
export default class CreateSessionService {
  constructor(
    @inject('UserRepository')
    private userRepository: UserRepository,
    @inject('SessionRepository')
    private sessionRepository: SessionRepository,
  ) {}

  public async execute({ id, title, isPrivate = false, jwt }: RequestPayload): Promise<Session> {
    // FIXME: authentication by middleware - consider GUEST
    const payload = await decodeToken(jwt)

    if (!payload) {
      throw new CustomError('Failed to get payload from token', ErrorCode.Unauthorized)
    }

    if (Date.now() >= payload.exp * 1000) {
      throw new CustomError('The token has been expired', ErrorCode.Unauthorized)
    }

    const googleId = payload.sub
    const existingUser = await this.userRepository.findUserByGoogleId(googleId)

    if (!existingUser) {
      throw new CustomError(`No user has been found by google id '${googleId}'`, ErrorCode.BadRequest)
    }

    const existingSession = await this.sessionRepository.findById(id, true)

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
}
