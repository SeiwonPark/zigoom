import { injectable, inject } from 'tsyringe'
import SessionRepository, { JoinedSession } from '../repositories/SessionRepository'
import { Prisma, Session } from '@db/mysql/generated/mysql'
import { CustomError, ErrorCode } from '@shared/errors'
import { isUpdateSessionSchema } from '../validations/session.validation'
import { Token } from '@shared/types/common'

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
    if (payload.isGuest) {
      // TODO: handle guest
    }

    const validatedData = this.getValidatedData(data)
    await this.ensureSessionExists(sessionId)

    return await this.sessionRepository.update(sessionId, validatedData, true)
  }

  private getValidatedData(data: any): Prisma.SessionUpdateInput {
    if (!isUpdateSessionSchema(data)) {
      throw new CustomError('Invalid payload type for UpdateSessionSchema', ErrorCode.BadRequest)
    }

    const updatedUsersInSession = {
      connect: data.users?.map((user: any) => ({ id: user.connect?.id })),
      disconnect: data.users?.map((user: any) => ({ id: user.disconnect?.id })),
    }
    const sessionUpdateData = {
      ...data,
      users: updatedUsersInSession,
    }

    return sessionUpdateData
  }

  private async ensureSessionExists(sessionId: string): Promise<void> {
    const session = await this.sessionRepository.findById(sessionId)
    if (!session) {
      throw new CustomError(`Session doesn't exist by id '${sessionId}'`, ErrorCode.NotFound)
    }
  }
}
