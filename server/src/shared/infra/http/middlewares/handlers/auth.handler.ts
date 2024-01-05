import { NextFunction, Request, Response } from 'express'

import { PRODUCTION } from '@configs/env.config'
import { logger } from '@configs/logger.config'
import { redisClient } from '@configs/redis.config'
import { ErrorCode, RequestError } from '@shared/errors'
import { Guest } from '@shared/types/common'
import { verifyToken } from '@utils/token'

/**
 * Validates access/refresh token to distinguish guest or user mode on every single HTTP request.
 * This middleware works like a wrapper function for each `Request` object.
 */
export const authHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.debug('authHandler invoked')
  const { accessToken } = req.cookies

  if (!accessToken) {
    return await handleGuestMode(req, res, next)
  } else {
    return await handleUserMode(req, res, next)
  }
}

/**
 * With this handler, the request is regarded as `guest mode`. Guest information is required when joining
 * the session. It'll be used to count the total number of participants and to prevent duplicates when
 * refreshed the browser. Guest's id is stored for an hour after joining the session as `guest mode`.
 */
const handleGuestMode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.debug('guest mode invoked')
  const { guestId } = req.cookies
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

/**
 * With this handler, the request is regarded as `user mode`. This will discriminate the request from
 * guest's by the value of `isGuest`. This can't be manipulated by client so can guarantee it's user's
 * request.
 */
const handleUserMode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.debug('user mode invoked')
  const { accessToken, refreshToken } = req.cookies
  /**
   * Handles authentication logic for authenticated user.
   */
  const { renewalToken, payload } = await verifyToken(accessToken, refreshToken)

  if (renewalToken) {
    res.cookie('accessToken', renewalToken, {
      httpOnly: true,
      secure: PRODUCTION,
      maxAge: 3600000, // 1 hour
    })
  }

  req.ctx = { user: { ...payload, isGuest: false } }
  logger.info(`Request from user '${payload.providerId}'`)
  next()
}

/**
 * Wraps controller as router-level middleware to ensure authentication.
 */
export const requireAuthentication = (req: Request, res: Response, next: NextFunction): void => {
  const { accessToken } = req.cookies

  if (!accessToken || req.ctx.user.isGuest) {
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
