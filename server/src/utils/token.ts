import jwt from 'jsonwebtoken'

import { TOKEN_KEY } from '@configs/env.config'
import { logger } from '@configs/logger.config'
import { redisClient } from '@configs/redis.config'
import { AuthTokenSchema } from '@modules/users/validations/auth.validation'
import { ErrorCode, RequestError } from '@shared/errors'

interface RenewalTokenIncluded {
  payload: AuthTokenSchema
  renewalToken: string | null
}

/**
 * This handles verifying access/refresh token from client's request cookie. If accessToken is expired
 * then validate refreshToken and return renewed accessToken.
 *
 * @param {string} accessToken - Access token from user.
 * @param {string} refreshToken - Refresh token from user.
 * @returns {RenewalTokenIncluded} Decoded JWT payload.
 */
export const verifyToken = async (accessToken: string, refreshToken: string): Promise<RenewalTokenIncluded> => {
  try {
    const decodedAccessToken = jwt.decode(accessToken) as AuthTokenSchema
    const blacklistedId = await redisClient.get(`blacklist:${decodedAccessToken.providerId}`)

    if (decodedAccessToken.providerId === blacklistedId) {
      logger.error('Access token is blacklisted. Please log in again')
      throw new RequestError('Access token is blacklisted. Please log in again', ErrorCode.Unauthorized)
    }

    return {
      payload: jwt.verify(accessToken, TOKEN_KEY) as AuthTokenSchema,
      renewalToken: null,
    }
  } catch (accessTokenError: any) {
    if (accessTokenError.name === 'TokenExpiredError') {
      logger.warn('The access token has been expired')

      try {
        const decodedRefreshToken = jwt.verify(refreshToken, TOKEN_KEY) as AuthTokenSchema
        const refreshTokenFromRedis = await redisClient.get(decodedRefreshToken.providerId)
        const blacklistedId = await redisClient.get(`blacklist:${decodedRefreshToken.providerId}`)

        if (decodedRefreshToken.providerId === blacklistedId) {
          logger.error('Refresh token is blacklisted. Please log in again')
          throw new RequestError('Refresh token is blacklisted. Please log in again', ErrorCode.Unauthorized)
        } else if (refreshTokenFromRedis === refreshToken) {
          const newAccessToken = signToken(decodedRefreshToken, 3600) // 1 hour
          return {
            renewalToken: newAccessToken,
            payload: decodedRefreshToken,
          }
        } else {
          logger.error("Refresh token doesn't match")
          throw new RequestError("Refresh token doesn't match", ErrorCode.Unauthorized)
        }
      } catch (refreshTokenError: any) {
        if (refreshTokenError.name === 'TokenExpiredError') {
          logger.error('Both access and refresh tokens have been expired')
          throw new RequestError('Both access and refresh tokens have been expired', ErrorCode.Unauthorized)
        } else {
          logger.error('Failed to verify refresh token')
          throw new RequestError('Failed to verify refresh token', ErrorCode.Unauthorized)
        }
      }
    } else {
      logger.error('Failed to verify access token')
      throw new RequestError('Failed to verify access token', ErrorCode.Unauthorized)
    }
  }
}

export const signToken = (payload: AuthTokenSchema, exp: number): string => {
  return jwt.sign(
    {
      ...payload,
      exp: Math.floor(Date.now() / 1000) + exp,
    },
    TOKEN_KEY
  )
}
