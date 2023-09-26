import { container } from 'tsyringe'
import CreateUserService from '../services/CreateUserService'
import UpdateUserService from '../services/UpdateUserService'
import { CustomRequest, CustomResponse } from '../../../interfaces/common.interface'
import GetUserService from '../services/GetUserService'
import { decodeToken } from '../../../utils/token'

export default class UserController {
  public async create(req: CustomRequest, res: CustomResponse): Promise<CustomResponse | undefined> {
    try {
      if (!req.cookies || !req.cookies.jwt) {
        return res.sendStatus(401)
      }

      const payload = await decodeToken(req.cookies.jwt)

      if (!payload) {
        throw new Error('Failed to get payload from token')
      }

      const createUser = container.resolve(CreateUserService)

      const googleId = payload.sub
      const createdUser = await createUser.execute(googleId, payload)

      console.log('Created a new user: ', createdUser)
      res.sendStatus(200)
    } catch (e) {
      console.error('[createUserController] ERR: ', e)
      // FIXME: error code
      res.status(500).send('Internal Server Error')
    }
  }

  public async get(req: CustomRequest, res: CustomResponse): Promise<CustomResponse | undefined> {
    try {
      if (!req.cookies || !req.cookies.jwt) {
        return res.sendStatus(401)
      }

      const payload = await decodeToken(req.cookies.jwt)

      if (!payload) {
        throw new Error('Failed to get payload from token')
      }

      if (!req.query || !req.query.googleId) {
        return res.sendStatus(400)
      }

      const { googleId, profile } = req.query

      const getUser = container.resolve(GetUserService)
      const fetchedUser = await getUser.execute(googleId, profile)

      console.log('Fetched a user: ', fetchedUser)
      res.sendStatus(200)
    } catch (e) {
      console.error('[getUserController] ERR: ', e)
      // FIXME: error code
      res.status(500).send('Internal Server Error')
    }
  }

  public async update(req: CustomRequest, res: CustomResponse): Promise<CustomResponse | undefined> {
    try {
      if (!req.cookies || !req.cookies.jwt) {
        return res.sendStatus(401)
      }

      const payload = await decodeToken(req.cookies.jwt)

      if (!payload) {
        throw new Error('Failed to get payload from token')
      }

      if (!req.query || !req.query.googleId || !req.body) {
        return res.sendStatus(400)
      }

      const { googleId } = req.query

      const updateUser = container.resolve(UpdateUserService)
      const updatedUser = await updateUser.execute(googleId, req.body)

      console.log('Updated a user: ', updatedUser)
      res.sendStatus(200)
    } catch (e) {
      console.error('[createUserController] ERR: ', e)
      // FIXME: error code
      res.status(500).send('Internal Server Error')
    }
  }
}
