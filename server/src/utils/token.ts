import jwt, { JwtPayload } from 'jsonwebtoken'

import { TOKEN_KEY } from '@configs/env.config'
import { logger } from '@configs/logger.config'
import { ErrorCode, RequestError } from '@shared/errors'

export interface TokenPayload extends JwtPayload {
  provider: string
  providerId: string // provider_id
  name: string
  email: string
}

/**
 * This handles verifying JWT from client's request cookie.
 * @param {string} token - JWT from user.
 * @returns {TokenPayload | undefined} Decoded JWT payload.
 */
export const verifyToken = async (token: string): Promise<TokenPayload | undefined> => {
  logger.debug('verifyToken invoked.')

  try {
    const decoded = jwt.verify(token, TOKEN_KEY) as TokenPayload

    if (!decoded) {
      logger.error('Failed to get payload from token')
      throw new RequestError('Failed to get payload from token', ErrorCode.Unauthorized)
    }

    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      logger.error('The token has been expired')
      throw new RequestError('The token has been expired', ErrorCode.Unauthorized)
    }

    return decoded
  } catch (err) {
    logger.error('Token verification failed:', err)
    return
  }
}

export const signToken = (payload: TokenPayload): string => {
  return jwt.sign(
    {
      ...payload,
      exp: Math.floor(Date.now() / 1000) + 1 * 60 * 60, // 1 hour
    },
    TOKEN_KEY
  )
}
