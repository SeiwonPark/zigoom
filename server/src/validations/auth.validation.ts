import { z } from 'zod'

/**
 * =========================================
 * objects
 * =========================================
 */
export const AuthToken = z.object({
  token: z.string(),
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
