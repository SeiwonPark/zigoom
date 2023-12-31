import { inject, injectable } from 'tsyringe'

import { logger } from '@configs/logger.config'
import { ErrorCode, RequestError } from '@shared/errors'
import { AuthProviderType } from '@shared/types'

import { AuthProvider } from '../adapters'
import UserRepository, { JoinedUser } from '../repositories/UserRepository'
import { AuthTokenSchema, isAuthTokenSchema } from '../validations/auth.validation'

interface RequestPayload {
  readonly token: string
  readonly provider: string
}

/**
 * This is for global auth provider logic from `guest mode`. JWT signed by 'Zigoom' is then parsed.
 */
@injectable()
export default class AuthService {
  constructor(
    @inject('UserRepository')
    private userRepository: UserRepository,
    @inject('GoogleAuthProvider')
    private googleAuthProvider: AuthProvider
  ) {}

  public async execute({ token, provider }: RequestPayload): Promise<JoinedUser | null> {
    this.ensureProviderType(provider)
    const payload = await this.validateToken(token, provider)

    return await this.getUser(payload)
  }

  private ensureProviderType(provider: string): void {
    if (!Object.values(AuthProviderType).includes(provider as AuthProviderType)) {
      logger.error('Missing or invalid auth provider.')
      throw new RequestError('Missing or invalid auth provider.', ErrorCode.BadRequest)
    }
  }

  private async validateToken(token: string, provider: string): Promise<AuthTokenSchema> {
    let payload: AuthTokenSchema | undefined

    switch (provider) {
      default:
      case 'google': {
        payload = await this.googleAuthProvider.authenticate(token)
      }
    }

    const tokenPayload = {
      email: payload?.email,
      familyName: payload?.familyName || '',
      givenName: payload?.givenName || '',
      locale: payload?.locale,
      name: payload?.name,
      picture: payload?.picture,
      providerId: payload?.providerId,
      provider: provider,
    }

    if (!isAuthTokenSchema(tokenPayload)) {
      logger.error('Invalid token type for AuthTokenSchema.')
      throw new RequestError('Invalid token type for AuthTokenSchema.', ErrorCode.BadRequest)
    }

    return tokenPayload
  }

  private async getUser(token: AuthTokenSchema): Promise<JoinedUser | null> {
    return await this.userRepository.findByProviderId(token.providerId, true)
  }
}
