import { Request, Response } from 'express'
import { decodeToken } from '@utils/token'

export default class AuthController {
  public async verifyToken(req: Request, res: Response): Promise<Response | undefined> {
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
    res.sendStatus(200)
  }

  public logout(req: Request, res: Response): void {
    res.clearCookie('jwt')
    res.sendStatus(200)
  }
}
