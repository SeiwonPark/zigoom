import type { GoogleJWTHeader, GoogleJWTPayload, GoolgeJWT } from '../validations/auth.validation'

/**
 * Decodes JWT from Google API and return header and payload.
 * @param {string} token - JWT received from Google API.
 * @returns {GoolgeJWT} Decoded result for header and payload from the JWT.
 */
export const decodeGoogleJWT = (token: string): GoolgeJWT => {
  try {
    const [jwtHeader, jwtPayload] = token.split('.')

    return {
      header: decodeBase64ToJson(jwtHeader),
      payload: decodeBase64UriToJson(jwtPayload),
    }
  } catch {
    throw Error(
      'Failed to parse JWT. Received "success" response, but failed to parse credential. Check Google API or GoogleLogin component for more details.'
    )
  }
}

const decodeBase64ToJson = (encodedBase64: string): GoogleJWTHeader => {
  return JSON.parse(decodeBase64(encodedBase64))
}

const decodeBase64UriToJson = (encoded: string): GoogleJWTPayload => {
  const decodedStr = decodeBase64(encoded)
  const uriDecoded = decodeURIComponent(
    decodedStr
      .split('')
      .map((char) => '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  )

  return JSON.parse(uriDecoded)
}

const decodeBase64 = (encoded: string): string => {
  return window.atob(encoded.replace(/-/g, '+').replace(/_/g, '/'))
}
