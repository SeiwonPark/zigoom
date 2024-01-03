import type { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { container } from 'tsyringe'

import { PRODUCTION } from '@configs/env.config'
import { logger } from '@configs/logger.config'
import { redisClient } from '@configs/redis.config'
import { signToken } from '@utils/token'

import AuthService from '../services/AuthService'
import { AuthTokenSchema } from '../validations/auth.validation'

/**
 * Controller for registering user in `guest mode`.
 */
export default class AuthController {
  /**
   * Verifies auth provider's token NOT the server's access/refresh token.
   */
  public async verifyAuthProvider(req: Request, res: Response): Promise<Response | undefined> {
    logger.debug('AuthController.verifyAuthProvider invoked')
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
        secure: PRODUCTION,
        maxAge: 60000, // 1 minute
      })
      return res.sendStatus(303)
    }

    const { accessToken, refreshToken } = req.cookies

    /**
     * Since accessToken and refreshToken would already been validated from authHandler, these SHOULD be valid.
     */
    if (accessToken && refreshToken) {
      return res.sendStatus(200)
    }
    /**
     * This access/refresh token will be issued on INITIAL login where there's no token exists for some reasons:
     * i.e. user has been logged out or new user has just registered.
     */
    const newAccessToken = signToken(validatedPayload, 3600) // 1 hour
    const newRefreshToken = signToken(validatedPayload, 604800) // 7 days
    redisClient.set(validatedPayload.providerId, newRefreshToken, { EX: 604800 }) // 7 days

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: PRODUCTION,
      maxAge: 3600000, // 1 hour
    })

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: PRODUCTION,
      maxAge: 604800000, // 7 days
    })

    return res.sendStatus(200)
  }

  public logout(req: Request, res: Response): void {
    const { accessToken } = req.cookies
    const decodedAccessToken = jwt.decode(accessToken) as AuthTokenSchema

    /**
     * Set blacklist for logged out users.
     */
    redisClient.set(`blacklist:${decodedAccessToken.providerId}`, decodedAccessToken.providerId, {
      EX: decodedAccessToken.exp! - decodedAccessToken.iat!,
    })
    redisClient.del(decodedAccessToken.providerId)

    res.clearCookie('confirmed')
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')
    res.sendStatus(200)
  }
}
