import { z } from 'zod'

/**
 * =========================================
 * objects
 * =========================================
 */
export const GetUserResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  profileThumbnail: z.string(),
  sessionId: z.string().uuid().nullable(),
  createdAt: z.string(),
  modifiedAt: z.string(),
  role: z.string(),
  profile: z
    .object({
      id: z.string().uuid(),
      familyName: z.string(),
      givenName: z.string(),
      profileImage: z.string().url(),
      email: z.string().email(),
      userId: z.string().uuid(),
    })
    .nullable(),
  authProvider: z.array(
    z.object({
      id: z.string().uuid(),
      provider: z.string(),
      providerId: z.string(),
      userId: z.string().uuid(),
    })
  ),
})

/**
 * =========================================
 * types
 * =========================================
 */
export type GetUserResponse = z.infer<typeof GetUserResponseSchema>

/**
 * =========================================
 * validators
 * =========================================
 */
export const isGetUserResponse = (obj: any): obj is GetUserResponse => {
  return GetUserResponseSchema.safeParse(obj).success
}
