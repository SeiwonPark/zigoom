import { z } from 'zod'

/**
 * =========================================
 * objects
 * =========================================
 */
const CreateUserPayload = z.object({
  name: z.string(),
  profileThumbnail: z.string(),
  profile: z.object({
    create: z.object({
      familyName: z.string(),
      givenName: z.string(),
      profileImage: z.string(),
      email: z.string().email(),
    }),
  }),
  authProvider: z.object({
    create: z.object({
      provider: z.string(),
      providerId: z.string(),
    }),
  }),
})

const UpdateUserPayload = z.object({
  name: z.string().optional(),
  profileThumbnail: z.string().optional(),
  profile: z
    .object({
      update: z.object({
        familyName: z.string().optional(),
        givenName: z.string().optional(),
        profileImage: z.string().optional(),
      }),
    })
    .optional(),
})

export const GetUserQuery = z.object({
  googleId: z.string(),
  profile: z.boolean(),
})

/**
 * =========================================
 * types
 * =========================================
 */
export type CreateUserSchema = z.infer<typeof CreateUserPayload>

export type UpdateUserSchema = z.infer<typeof UpdateUserPayload>

export type GetUserQuerySchema = z.infer<typeof GetUserQuery>

/**
 * =========================================
 * validators
 * =========================================
 */
export const isCreateUserSchema = (obj: any): obj is CreateUserSchema => {
  return CreateUserPayload.safeParse(obj).success
}

export const isUpdateUserSchema = (obj: any): obj is UpdateUserSchema => {
  return UpdateUserPayload.safeParse(obj).success
}
