import { inject, injectable } from 'tsyringe'

import type { AuthProvider } from '@modules/users/adapters'
import { AuthTokenSchema } from '@modules/users/validations/auth.validation'

import GoogleAuth from './GoogleAuth'

@injectable()
export default class GoogleAuthProvider implements AuthProvider {
  constructor(
    @inject('GoogleAuth')
    private googleAuth: GoogleAuth
  ) {}

  public async authenticate(token: string): Promise<AuthTokenSchema | undefined> {
    return await this.googleAuth.authenticateWithGoogle(token)
  }
}
