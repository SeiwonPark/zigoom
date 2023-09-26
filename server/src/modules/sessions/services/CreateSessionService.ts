import { injectable, inject } from 'tsyringe'
import { Prisma, Session } from '../../../../prisma/mysql/generated/mysql'
import { isCreateSessionSchema } from '../../../validations/session.validation'
import { TokenPayload } from 'google-auth-library'
import SessionRepository from '../repositories/SessionRepository'
import UserRepository from '../../users/repositories/UserRepository'

@injectable()
export default class CreateSessionService {
  constructor(
    @inject('SessionRepository')
    private sessionRepository: SessionRepository,
    @inject('UserRepository')
    private userRepository: UserRepository,
  ) {}

  public async execute(id: string, title: string, tokenPayload: TokenPayload): Promise<Session> {
    try {
      const googleId = tokenPayload.sub
      const existingUser = await this.userRepository.findUserByGoogleId(googleId)

      if (!existingUser) {
        throw new Error(`No user has been found by google id '${googleId}'`)
      }

      const sessionData: Prisma.SessionCreateInput = {
        id: id,
        host: googleId,
        title: title,
        users: { connect: { google_id: googleId } },
      }

      if (!isCreateSessionSchema(sessionData)) {
        throw new Error('Invalid payload type for CreateSessionSchema.')
      }

      return await this.sessionRepository.save(sessionData)
    } catch (e) {
      console.error('[createSessionService] ERR: ', e)
      throw e
    }
  }
}
