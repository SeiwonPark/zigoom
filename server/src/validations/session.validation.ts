import { z } from 'zod'

/**
 * =========================================
 * objects
 * =========================================
 */
const CreateSessionPayload = z.object({
  id: z.string().uuid(),
  private: z.boolean().optional(),
  title: z.string(),
  users: z.object({
    connect: z.object({
      google_id: z.string(),
    }),
  }),
})

/**
 * =========================================
 * types
 * =========================================
 */
export type CreateSessionSchema = z.infer<typeof CreateSessionPayload>

/**
 * =========================================
 * validators
 * =========================================
 */
export const isCreateSessionSchema = (obj: any): obj is CreateSessionSchema => {
  return CreateSessionPayload.safeParse(obj).success
}
