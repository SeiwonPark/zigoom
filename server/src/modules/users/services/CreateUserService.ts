import { inject, injectable } from 'tsyringe'

import { logger } from '@configs/logger.config'
import { Prisma, User } from '@db/mysql/generated/mysql'
import { ErrorCode, RequestError } from '@shared/errors'
import { AuthProviderType } from '@shared/types'

import { AuthProvider } from '../adapters'
import UserRepository, { JoinedUser } from '../repositories/UserRepository'
import { AuthTokenSchema, isAuthTokenSchema } from '../validations/auth.validation'
import { isCreateUserSchema } from '../validations/user.validation'

interface RequestPayload {
  readonly token: string
  readonly provider: string
}

@injectable()
export default class CreateUserService {
  constructor(
    @inject('UserRepository')
    private userRepository: UserRepository,
    @inject('GoogleAuthProvider')
    private googleAuthProvider: AuthProvider
  ) {}

  public async execute({ token, provider }: RequestPayload): Promise<User | JoinedUser> {
    this.ensureProviderType(provider)
    const payload = await this.validateToken(token, provider)
    await this.ensureUserNotExists(provider, payload.providerId)
    const userCreateInput = this.getValidatedData(payload)

    return await this.userRepository.save(userCreateInput, true)
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

  private getValidatedData(data: AuthTokenSchema): Prisma.UserCreateInput {
    const userData = {
      name: data.name || 'Anonymous User',
      profileThumbnail: '', // FIXME: bucket url
      profile: {
        create: {
          familyName: data.familyName,
          givenName: data.givenName,
          profileImage: data.picture || '', // FIXME: bucket url
          email: data.email,
        },
      },
      authProvider: {
        create: {
          provider: data.provider,
          providerId: data.providerId,
        },
      },
    }

    if (!isCreateUserSchema(userData)) {
      logger.error('Invalid payload type for CreateUserSchema.')
      throw new RequestError('Invalid payload type for CreateUserSchema.', ErrorCode.BadRequest)
    }

    return userData
  }

  private async ensureUserNotExists(provider: string, providerId: string): Promise<void> {
    const user = await this.userRepository.findByProviderId(providerId)
    if (user) {
      logger.error(`User already exists by ${provider} id '${providerId}'`)
      throw new RequestError(`User already exists by ${provider} id '${providerId}'`, ErrorCode.Conflict)
    }
  }
}
