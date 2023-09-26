import { container } from 'tsyringe'
import { CustomRequest, CustomResponse } from '../../../interfaces/common.interface'
import CreateSessionService from '../services/CreateSessionService'
import { decodeToken } from '../../../utils/token'

export default class SessionController {
  public async create(req: CustomRequest, res: CustomResponse): Promise<CustomResponse | undefined> {
    try {
      if (!req.cookies || !req.cookies.jwt) {
        return res.sendStatus(401)
      }

      const payload = await decodeToken(req.cookies.jwt)

      if (!payload) {
        throw new Error('Failed to get payload from token')
      }

      const createSession = container.resolve(CreateSessionService)

      const { id, title } = req.body
      const createdSession = await createSession.execute(id, title, payload)

      console.log('Created a new session: ', createdSession)
      res.sendStatus(200)
    } catch (e) {
      console.error('[createRoomController] ERR: ', e)
      // FIXME: error code
      res.status(500).send('Internal Server Error')
    }
  }
}
