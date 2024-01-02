import { NextFunction, Request, Response } from 'express'

import { logger } from '@configs/logger.config'
import { redisClient } from '@configs/redis.config'
import { ErrorCode, RequestError } from '@shared/errors'
import { Guest } from '@shared/types/common'
import { verifyToken } from '@utils/token'

/**
 * Captures request object and parses authentication-related properties to check authentication.
 * Proceed to next middleware with user's token payload if authenticated or else guest token payload.
 */
export const authHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.debug('authHandler invoked')
  const { zigoomjwt, guestId } = req.cookies

  // handle when it's a guest or not signed in
  if (!zigoomjwt) {
    logger.debug('guest mode invoked')
    let guest: Guest

    // if it's a successive request from guest
    if (guestId) {
      const guestData = await redisClient.get(guestId)
      if (guestData) {
        guest = JSON.parse(guestData)
        req.ctx = { user: guest }
        logger.info(`Request from guest '${guestId}'`)
        next()
        return
      }
    }

    // if it's a new request from guest
    const newGuestId = randomId()
    guest = {
      id: newGuestId,
      name: newGuestId,
      isGuest: true,
    }

    req.ctx = { user: guest }
    redisClient.set(newGuestId, JSON.stringify({ ...guest, connectedAt: Date.now() }), { EX: 3600 })
    logger.info(`Request from guest '${newGuestId}'`)
    res.cookie('guestId', newGuestId)
    next()
    return
  }

  logger.debug('user mode invoked')
  /**
   * Handles authentication logic for authenticated user.
   */
  const payload = await verifyToken(zigoomjwt)

  if (!payload) {
    logger.error('Authentication required - Failed to verify token.')
    throw new RequestError('Authentication required - Failed to verify token.', ErrorCode.Unauthorized)
  }

  req.ctx = { user: { ...payload, isGuest: false } }
  logger.info(`Request from user '${payload.providerId}'`)
  next()
}

/**
 * Wraps controller as router-level middleware to ensure authentication.
 */
export const requireAuthentication = (req: Request, res: Response, next: NextFunction): void => {
  if (req.ctx.user.isGuest) {
    logger.warn('Authentication required - guest user attempting to access protected resource')
    throw new RequestError(
      'Authentication required - guest user attempting to access protected resource',
      ErrorCode.Unauthorized
    )
  }
  next()
}

const randomId = (): string => {
  return 'guest_' + Date.now()
}
