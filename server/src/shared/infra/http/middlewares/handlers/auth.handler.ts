import { CustomError, ErrorCode } from '@shared/errors'
import { decodeToken } from '@utils/token'
import { Request, Response, NextFunction } from 'express'

/**
 * Captures request object and parses authentication-related properties to check authentication.
 * Proceed to next middleware with user's token payload if authenticated or else guest token payload.
 */
export const authHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { jwt } = req.cookies

  if (!jwt) {
    req.ctx.user = {
      id: randomId(),
      name: randomId(),
      isGuest: true,
    }
    next()
    return
  }

  const payload = await decodeToken(jwt)

  if (!payload) {
    throw new CustomError('Failed to get payload from token', ErrorCode.Unauthorized)
  }

  if (Date.now() >= payload.exp * 1000) {
    throw new CustomError('The token has been expired', ErrorCode.Unauthorized)
  }

  req.ctx.user = { ...payload, isGuest: false }
  next()
}

/**
 * Wraps controller as router-level middleware to ensure authentication.
 */
export const requireAuthentication = (req: Request, res: Response, next: NextFunction): void => {
  if (req.ctx.user.isGuest) {
    throw new CustomError('Authentication required', ErrorCode.Unauthorized)
  }
  next()
}

const randomId = (): string => {
  return 'guest_' + Date.now()
}
