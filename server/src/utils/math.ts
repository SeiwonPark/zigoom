import Base64 from 'crypto-js/enc-base64'
import hmacSHA512 from 'crypto-js/hmac-sha512'
import sha256 from 'crypto-js/sha256'

/**
 * Creates temporary user credentials for TURN server. TTL for 6 hours.
 */
export const createTURNCredentials = (key: string, ttl: number = 21600) => {
  const timestamp = Math.floor(Date.now() / 1000) + ttl
  const username = timestamp.toString()
  const hashDigest = sha256(username)
  const hmacDigest = Base64.stringify(hmacSHA512(hashDigest, key))
  return { username: username, password: hmacDigest }
}
