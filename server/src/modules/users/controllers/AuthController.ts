import { CustomRequest, CustomResponse } from '@interfaces/common.interface'
import { decodeToken } from '@utils/token'

export default class AuthController {
  public async verifyToken(req: CustomRequest, res: CustomResponse): Promise<CustomResponse | undefined> {
    const { token } = req.body

    if (!token) {
      return res.sendStatus(401)
    }

    const payload = await decodeToken(token)

    if (!payload) {
      return res.sendStatus(401)
    }

    res.cookie('jwt', token, {
      httpOnly: true,
      // secure: true,
      maxAge: 1 * 60 * 60 * 1000, // 1 hour
    })
    return res.sendStatus(200)
    // TODO: error handling for middlewares
    // TODO: add error handling routers
  }

  public logout(req: CustomRequest, res: CustomResponse): CustomResponse {
    res.clearCookie('jwt')
    return res.sendStatus(200)
  }
}
