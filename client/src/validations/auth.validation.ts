import { z } from 'zod'

/**
 * =========================================
 * objects
 * =========================================
 */
export const CredentialResponseSchema = z.object({
  clientId: z.string(),
  credential: z.string(),
  select_by: z.string(),
})

export const GoogleJWTHeaderSchema = z.object({
  alg: z.string(),
  kid: z.string().optional(),
  type: z.string(),
})

export const GoogleJWTPayloadSchema = z.object({
  aud: z.string(),
  azp: z.string(),
  email: z.string().email(),
  email_verified: z.boolean(),
  exp: z.number(),
  family_name: z.string(),
  given_name: z.string(),
  iat: z.number(),
  iss: z.string(),
  jti: z.string(),
  locale: z.string(),
  name: z.string(),
  nbf: z.number(),
  picture: z.string().url(),
  sub: z.string(),
})

export const GoogleJWTSchema = z.object({
  header: GoogleJWTHeaderSchema,
  payload: GoogleJWTPayloadSchema,
})

/**
 * =========================================
 * types
 * =========================================
 */
export type CredentialResponse = z.infer<typeof CredentialResponseSchema>

export type GoogleJWTHeader = z.infer<typeof GoogleJWTHeaderSchema>

export type GoogleJWTPayload = z.infer<typeof GoogleJWTPayloadSchema>

export type GoolgeJWT = z.infer<typeof GoogleJWTSchema>

/**
 * =========================================
 * validators
 * =========================================
 */
export const isCredentialResponse = (obj: any): obj is CredentialResponse => {
  return CredentialResponseSchema.safeParse(obj).success
}
