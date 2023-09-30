import { injectable, inject } from 'tsyringe'
import SessionRepository from '../repositories/SessionRepository'
import { decodeToken } from '@utils/token'
import { CustomError, ErrorCode } from '@shared/errors'
import { Session } from '@prisma/mysql/generated/mysql'

interface RequestPayload {
  jwt: string
  sessionId: string
}

@injectable()
export default class GetSessionService {
  constructor(
    @inject('SessionRepository')
    private sessionRepository: SessionRepository,
  ) {}

  public async execute({ jwt, sessionId }: RequestPayload): Promise<Session | null> {
    const payload = await decodeToken(jwt)

    if (!payload) {
      throw new CustomError('Failed to get payload from token', ErrorCode.Unauthorized)
    }

    if (Date.now() >= payload.exp * 1000) {
      throw new CustomError('The token has been expired', ErrorCode.Unauthorized)
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
