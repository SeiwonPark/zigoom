import type { Request, Response } from 'express'
import { container } from 'tsyringe'

import { logger } from '@configs/logger.config'
import { signToken } from '@utils/token'

import AuthService from '../services/AuthService'

/**
 * Controller for registering user in `guest mode` so `authHandler` doesn't do anything in
 * this logic.
 */
export default class AuthController {
  /**
   * Handles registering user
   */
  public async verify(req: Request, res: Response): Promise<Response | undefined> {
    logger.debug('AuthController.verify invoked')
    /**
     * Received token could be from any auth providers.
     */
    const { token, provider } = req.body

    if (!token || !provider) {
      return res.sendStatus(401)
    }

    const getValidatedPayload = container.resolve(AuthService)
    const validatedPayload = await getValidatedPayload.execute({ token: token, provider: provider })

    if (!validatedPayload.isUserExists) {
      res.sendStatus(303)
    } else {
      const encodedToken = signToken(validatedPayload)
      res.cookie('zigoomjwt', encodedToken, {
        httpOnly: true,
        secure: true,
        maxAge: 1 * 60 * 60 * 1000, // 1 hour
      })
      res.sendStatus(200)
    }
  }

  public logout(req: Request, res: Response): void {
    res.clearCookie('zigoomjwt')
    res.sendStatus(200)
  }
}
