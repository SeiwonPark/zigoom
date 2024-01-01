import { z } from 'zod'

/**
 * =========================================
 * objects
 * =========================================
 */
export const AuthToken = z.object({
  email: z.string().email(),
  familyName: z.string(),
  givenName: z.string(),
  locale: z.string(),
  name: z.string(),
  picture: z.string(),
  providerId: z.string(),
  provider: z.string(),
  // provider: z.union([z.literal('google'), z.literal('')]),
})

/**
 * =========================================
 * types
 * =========================================
 */
export type AuthTokenSchema = z.infer<typeof AuthToken>

/**
 * =========================================
 * validators
 * =========================================
 */
export const isAuthTokenSchema = (obj: any): obj is AuthTokenSchema => {
  return AuthToken.safeParse(obj).success
}
