import { logger } from '@configs/logger.config'
import { redisClient } from '@configs/redis.config'
import { ErrorCode, RequestError } from '@shared/errors'
import { decodeToken } from '@utils/token'

import { NextFunction, Request, Response } from 'express'

export interface Guest {
  id: string
  name: string
  isGuest: boolean
}

/**
 * Captures request object and parses authentication-related properties to check authentication.
 * Proceed to next middleware with user's token payload if authenticated or else guest token payload.
 */
export const authHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.debug('authHandler invoked')
  const { jwt, guestId } = req.cookies

  // handle when it's a guest or not signed in
  if (!jwt) {
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

  // handle when it's a user
  const payload = await decodeToken(jwt)

  if (!payload) {
    logger.error('Failed to get payload from token')
    throw new RequestError('Failed to get payload from token', ErrorCode.Unauthorized)
  }

  if (Date.now() >= payload.exp * 1000) {
    logger.error('The token has been expired')
    throw new RequestError('The token has been expired', ErrorCode.Unauthorized)
  }

  req.ctx = { user: { ...payload, isGuest: false } }
  logger.info(`Request from user '${payload.sub}'`)
  next()
}

/**
 * Wraps controller as router-level middleware to ensure authentication.
 */
export const requireAuthentication = (req: Request, res: Response, next: NextFunction): void => {
  if (req.ctx.user.isGuest) {
    logger.warn('Authentication required - guest user attempting to access protected resource')
    throw new RequestError('Authentication required', ErrorCode.Unauthorized)
  }
  next()
}

const randomId = (): string => {
  return 'guest_' + Date.now()
}
