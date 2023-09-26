import { TokenPayload } from 'google-auth-library'
import { mysql } from '../configs/prisma.config'
import { Prisma, User } from '../../prisma/mysql/generated/mysql'
import { isCreateUserSchema, isUpdateUserSchema } from '../validations/user.validation'

export const createUserService = async (googleId: string, payload: TokenPayload) => {
  try {
    const existingUser = await getUserByGoogleId(googleId)

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

    return await mysql.user.create({
      data: userData,
    })
  } catch (e) {
    console.error('[createUserService] ERR: ', e)
    throw e
  }
}

export const updateUserService = async (googleId: string, payload: any) => {
  try {
    const user = await getUserByGoogleId(googleId)

    if (!user) {
      throw new Error(`User doesn't exist by id '${googleId}'`)
    }

    const userUpdateData: Prisma.UserUpdateInput = {
      ...payload,
    }

    if (!isUpdateUserSchema(userUpdateData)) {
      throw new Error('Invalid payload type for UpdateUserSchema.')
    }

    return await mysql.user.update({
      where: { google_id: googleId },
      data: userUpdateData,
    })
  } catch (e) {
    console.error('[updateUserService] ERR: ', e)
    throw e
  }
}

export const getUserService = async (googleId: string, profile = false) => {
  try {
    const user = await getUserByGoogleId(googleId)

    if (!user) {
      throw new Error(`User doesn't exist by id '${googleId}'`)
    }
  } catch (e) {
    console.error('[updateUserService] ERR: ', e)
    throw e
  }
}

const getUserByGoogleId = async (googleId: string): Promise<User | null> => {
  return await mysql.user.findUnique({ where: { google_id: googleId } })
}
