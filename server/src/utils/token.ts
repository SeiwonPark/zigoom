import { logger } from '@configs/logger.config'

import { OAuth2Client, TokenPayload } from 'google-auth-library'

export const decodeToken = async (token: string): Promise<TokenPayload | undefined> => {
  const client = new OAuth2Client()

  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    })
    return ticket.getPayload()
  } catch (e) {
    logger.error((e as Error).message)
    return undefined
  }
}
