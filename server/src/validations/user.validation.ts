import { z } from 'zod'

/**
 * =========================================
 * objects
 * =========================================
 */
const CreateUserPayload = z.object({
  google_id: z.string(),
  name: z.string(),
  profileThumbnail: z.string(),
  profile: z.object({
    create: z.object({
      family_name: z.string(),
      given_name: z.string(),
      profileImage: z.string(),
      email: z.string().email(),
    }),
  }),
})

const UpdateUserPayload = z.object({
  name: z.string().optional(),
  profileThumbnail: z.string().optional(),
  profile: z.object({
    update: z.object({
      family_name: z.string().optional(),
      given_name: z.string().optional(),
      profileImage: z.string().optional(),
    }),
  }),
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
