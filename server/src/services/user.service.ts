import { TokenPayload } from 'google-auth-library'
import { mysql } from '../configs/prisma.config'
import { Prisma, Profile, User } from '../../prisma/mysql/generated/mysql'
import { isCreateUserSchema, isUpdateUserSchema } from '../validations/user.validation'

export const createUserService = async (userId: string, payload: TokenPayload) => {
  try {
    const existingUser = await getUserById(userId)
    const existingProfile = await getProfileByUserId(userId)

    if (existingUser || existingProfile) {
      throw new Error(`User already exists by id '${userId}'`)
    }

    const userData: Prisma.UserCreateInput = {
      google_id: userId,
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

    return await mysql.user.create({
      data: userData,
    })
  } catch (e) {
    console.error('[createUserService] ERR: ', e)
    throw e
  }
}

export const updateUserService = async (userId: string, payload: any) => {
  try {
    const user = await getUserById(userId)

    if (!user) {
      throw new Error(`User not exists by id '${userId}'`)
    }

    const userUpdateData: Prisma.UserUpdateInput = {
      ...payload,
    }

    if (!isUpdateUserSchema(userUpdateData)) {
      throw new Error('Invalid payload type for UpdateUserSchema.')
    }

    return await mysql.user.update({
      where: { id: userId },
      data: userUpdateData,
    })
  } catch (e) {
    console.error('[updateUserService] ERR: ', e)
    throw e
  }
}

const getUserById = async (id: string): Promise<User | null> => {
  return await mysql.user.findUnique({ where: { id: id } })
}

const getProfileByUserId = async (id: string): Promise<Profile | null> => {
  return await mysql.profile.findUnique({ where: { userId: id } })
}
