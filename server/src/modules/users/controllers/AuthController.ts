import { logger } from '@configs/logger.config'
import { decodeToken } from '@utils/token'

import type { Request, Response } from 'express'
import { container } from 'tsyringe'

import AuthService from '../services/AuthService'

export default class AuthController {
  public async verifyToken(req: Request, res: Response): Promise<Response | undefined> {
    logger.debug('AuthController.verifyToken invoked')
    const { token } = req.body

    if (!token) {
      return res.sendStatus(401)
    }

    const payload = await decodeToken(token)

    if (!payload) {
      return res.sendStatus(401)
    }

    const authorizeUser = container.resolve(AuthService)
    const authorizedUser = await authorizeUser.execute({ payload: payload })

    res.cookie('jwt', token, {
      httpOnly: true,
      // secure: true,
      maxAge: 1 * 60 * 60 * 1000, // 1 hour
    })
    res.status(200).send(authorizedUser)
  }

  public logout(req: Request, res: Response): void {
    res.clearCookie('jwt')
    res.sendStatus(200)
  }
}
