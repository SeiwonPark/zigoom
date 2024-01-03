import type { Request, Response } from 'express'
import { container } from 'tsyringe'

import { logger } from '@configs/logger.config'
import { signToken } from '@utils/token'

import AuthService from '../services/AuthService'

/**
 * Controller for registering user in `guest mode`.
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
      res.cookie('confirmed', true, {
        httpOnly: true,
        secure: true,
        maxAge: 1 * 60 * 1000, // 1 minute
      })
      res.sendStatus(303)
    } else {
      const accessToken = signToken(validatedPayload, 1 * 60 * 60) // 1 hour
      const refreshToken = signToken(validatedPayload, 7 * 24 * 60 * 60) // 7 days

      res.cookie('zigoomjwt', accessToken, {
        httpOnly: true,
        secure: true,
        maxAge: 1 * 60 * 60 * 1000, // 1 hour
      })
      res.sendStatus(200)
    }
  }

  public logout(req: Request, res: Response): void {
    res.clearCookie('zigoomjwt')
    res.clearCookie('confirmed')
    res.sendStatus(200)
  }
}
