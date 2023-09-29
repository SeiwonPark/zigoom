import { injectable, inject } from 'tsyringe'
import { Prisma, Session } from '@prisma/mysql/generated/mysql'
import { isCreateSessionSchema } from '../validations/session.validation'
import SessionRepository from '../repositories/SessionRepository'
import UserRepository from '@modules/users/repositories/UserRepository'
import { CustomError } from '@shared/errors/CustomError'
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
    @inject('SessionRepository')
    private sessionRepository: SessionRepository,
    @inject('UserRepository')
    private userRepository: UserRepository,
  ) {}

  public async execute({ id, title, isPrivate = false, jwt }: RequestPayload): Promise<Session> {
    const payload = await decodeToken(jwt)

    if (!payload) {
      throw new CustomError('Failed to get payload from token', 401)
    }

    if (Date.now() >= payload.exp * 1000) {
      throw new CustomError('The token has been expired', 401)
    }

    const googleId = payload.sub
    const existingUser = await this.userRepository.findUserByGoogleId(googleId)

    if (!existingUser) {
      throw new CustomError(`No user has been found by google id '${googleId}'`, 404)
    }

    const sessionData: Prisma.SessionCreateInput = {
      id: id,
      host: googleId,
      title: title,
      isPrivate: isPrivate,
      users: { connect: { google_id: googleId } },
    }

    if (!isCreateSessionSchema(sessionData)) {
      throw new CustomError('Invalid payload type for CreateSessionSchema.', 400)
    }

    return await this.sessionRepository.save(sessionData)
  }
}
