import { TokenPayload } from 'google-auth-library'
import { injectable, inject } from 'tsyringe'
import { Prisma, User } from '../../../../prisma/mysql/generated/mysql'
import { isCreateUserSchema } from '../validations/user.validation'
import UserRepository from '../repositories/UserRepository'

@injectable()
export default class CreateUserService {
  constructor(
    @inject('UserRepository')
    private userRepository: UserRepository,
  ) {}

  // FIXME: input interface
  public async execute(googleId: string, payload: TokenPayload): Promise<User> {
    try {
      const existingUser = await this.getUserByGoogleId(googleId)

      if (existingUser) {
        throw new Error(`User already exists by google id '${googleId}'`)
      }

      const userData: Prisma.UserCreateInput = {
        google_id: googleId,
        name: payload.name || 'Anonymous User',
        profileThumbnail: '', // FIXME: bucket url
        profile: {
          create: {
            family_name: payload.family_name,
            given_name: payload.given_name,
            profileImage: payload.picture || '', // FIXME: bucket url
            email: payload.email,
          },
        },
      }

      if (!isCreateUserSchema(userData)) {
        throw new Error('Invalid payload type for CreateUserSchema.')
      }

      console.log('success')

      return await this.userRepository.save(userData)
    } catch (e) {
      console.error('[createUserService] ERR: ', e)
      throw e
    }
  }

  async getUserByGoogleId(googleId: string): Promise<User | null> {
    return await this.userRepository.findUserByGoogleId(googleId)
  }
}
