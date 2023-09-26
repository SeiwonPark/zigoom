import { verifyTokenService } from '../services/auth.service'
import { mysql } from '../configs/prisma.config'
import { User } from '../../prisma/mysql/generated/mysql'
import { CustomRequest, CustomResponse } from '../interfaces/common.interface'
import { createSessionService } from '../services/session.service'

export const createSessionController = async (req: CustomRequest, res: CustomResponse) => {
  try {
    if (!req.cookies || !req.cookies.jwt) {
      return res.sendStatus(401)
    }

    const payload = await verifyTokenService(req.cookies.jwt)

    if (!payload) {
      throw Error('Failed to get payload from token')
    }

    const googleId = payload.sub
    const existingUser = await getUserByGoogleId(googleId)

    if (!existingUser) {
      throw Error(`No user has been found by google id '${googleId}'`)
    }

    const { id, title } = req.body
    const createdSession = await createSessionService(id, googleId, title)

    console.log('Created a new session: ', createdSession)
    res.sendStatus(200)
  } catch (e) {
    console.error('[createRoomController] ERR: ', e)
    // FIXME: error code
    res.status(500).send('Internal Server Error')
  }
}

const getUserByGoogleId = async (googleId: string): Promise<User | null> => {
  return await mysql.user.findUnique({ where: { google_id: googleId } })
}
