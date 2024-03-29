import { inject, injectable } from 'tsyringe'

import { AWS_BUCKET } from '@configs/env.config'
import { logger } from '@configs/logger.config'
import { Prisma, User } from '@db/mysql/generated/mysql'
import { ErrorCode, RequestError } from '@shared/errors'
import { AuthProviderType } from '@shared/types'

import { AuthProvider } from '../adapters'
import UserRepository, { JoinedUser } from '../repositories/UserRepository'
import { AuthTokenSchema, isAuthTokenSchema } from '../validations/auth.validation'
import { isCreateUserSchema } from '../validations/user.validation'
import SingleUploadService from './SingleUploadService'

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
    private googleAuthProvider: AuthProvider,
    @inject('SingleUploadService')
    private singleUploadService: SingleUploadService
  ) {}

  public async execute({ token, provider }: RequestPayload): Promise<User | JoinedUser> {
    this.ensureProviderType(provider)
    const payload = await this.validateToken(token, provider)
    await this.ensureUserNotExists(provider, payload.providerId)
    const userCreateInput = await this.getValidatedData(payload)

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
        break
      }
    }

    if (!isAuthTokenSchema(payload)) {
      logger.error('Invalid token type for AuthTokenSchema.')
      throw new RequestError('Invalid token type for AuthTokenSchema.', ErrorCode.BadRequest)
    }

    return payload
  }

  private async getValidatedData(data: AuthTokenSchema): Promise<Prisma.UserCreateInput> {
    let publicImageUrl = 'https://zigoom-public-assets.s3.ap-northeast-2.amazonaws.com/profile.png'

    if (data.picture && data.picture !== publicImageUrl) {
      const uploadedUrl = await this.singleUploadService.uploadImageFromUrl(
        data.picture,
        `${AWS_BUCKET}/profiles/${data.providerId}.png`
      )

      if (uploadedUrl) {
        publicImageUrl = uploadedUrl
      }
    }

    const userData = {
      name: data.name,
      profileThumbnail: publicImageUrl, // FIXME: minimize image size for thumbnail
      profile: {
        create: {
          familyName: data.familyName,
          givenName: data.givenName,
          profileImage: publicImageUrl,
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
