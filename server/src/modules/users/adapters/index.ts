import { AuthTokenSchema } from '../validations/auth.validation'

export interface AuthProvider {
  /**
   * This is the main logic for all authenticatiion and verification.
   */
  authenticate(token: string): Promise<AuthTokenSchema | undefined>
}
