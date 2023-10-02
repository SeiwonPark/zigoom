import { z } from 'zod'

/**
 * =========================================
 * objects
 * =========================================
 */
const CreateSessionPayload = z.object({
  id: z.string().uuid().nonempty(),
  isPrivate: z.boolean().optional(),
  title: z.string().nonempty(),
  users: z.object({
    connect: z.object({
      id: z.string().uuid().nonempty(),
    }),
  }),
})

const UpdateSessionPayload = z.object({
  title: z.string().optional(),
  users: z.array(z.object({})).optional(),
})

/**
 * =========================================
 * types
 * =========================================
 */
export type CreateSessionSchema = z.infer<typeof CreateSessionPayload>

export type UpdateSessionSchema = z.infer<typeof UpdateSessionPayload>

/**
 * =========================================
 * validators
 * =========================================
 */
export const isCreateSessionSchema = (obj: any): obj is CreateSessionSchema => {
  return CreateSessionPayload.safeParse(obj).success
}

export const isUpdateSessionSchema = (obj: any): obj is UpdateSessionSchema => {
  return UpdateSessionPayload.safeParse(obj).success
}
