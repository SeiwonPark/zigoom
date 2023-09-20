import { OAuth2Client } from 'google-auth-library'

const client = new OAuth2Client()

export const verifyTokenService = async (token: string) => {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    })

    return ticket.getPayload()
  } catch (e) {
    // FIXME: fix accordingly
    console.log((e as Error).message)
  }
}
