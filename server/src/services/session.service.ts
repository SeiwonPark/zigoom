import { Prisma } from '../../prisma/mysql/generated/mysql'
import { mysql } from '../configs/prisma.config'
import { isCreateSessionSchema } from '../validations/session.validation'

export const createSessionService = async (id: string, googleId: string, title: string) => {
  try {
    const sessionData: Prisma.SessionCreateInput = {
      id: id,
      host: googleId,
      title: title,
      users: { connect: { google_id: googleId } },
    }

    if (!isCreateSessionSchema(sessionData)) {
      throw new Error('Invalid payload type for CreateSessionSchema.')
    }

    return await mysql.session.create({
      data: sessionData,
      include: { users: true },
    })
  } catch (e) {
    console.error('[createSessionService] ERR: ', e)
    throw e
  }
}
