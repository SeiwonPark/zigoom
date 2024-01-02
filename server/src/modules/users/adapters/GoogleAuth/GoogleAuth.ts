import { OAuth2Client } from 'google-auth-library'
import { injectable } from 'tsyringe'

import { GOOGLE_CLIENT_ID } from '@configs/env.config'
import { logger } from '@configs/logger.config'
import { AuthTokenSchema } from '@modules/users/validations/auth.validation'
import { ErrorCode, RequestError } from '@shared/errors'

@injectable()
export default class GoogleAuth {
  public async authenticateWithGoogle(token: string): Promise<AuthTokenSchema | undefined> {
    logger.debug('authenticateWithGoogle invoked')
    const client = new OAuth2Client()

    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID,
      })
      const payload = ticket.getPayload()

      if (!payload) {
        logger.error('Failed to get payload from GoogleAuth.')
        throw new RequestError('Failed to get payload from GoogleAuth.', ErrorCode.Unauthorized)
      }

      return {
        provider: 'google',
        providerId: payload.sub,
        name: payload.name || 'Anonymous User',
        email: payload.email || 'no-email@example.com',
        familyName: payload.family_name || '',
        givenName: payload.given_name || '',
        locale: payload.locale || 'ko',
        picture: payload.picture || 'https://zigoom-public-assets.s3.ap-northeast-2.amazonaws.com/profile.png',
      }
    } catch (e) {
      logger.error((e as Error).message)
      return undefined
    }
  }
}
