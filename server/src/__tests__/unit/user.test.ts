import { MockContext, Context, createMockContext } from '../context'
import { isCreateUserSchema, isUpdateUserSchema } from '@modules/users/validations/user.validation'
import { Role, User } from '@prisma/mysql/generated/mysql'

let mockCtx: MockContext
let ctx: Context

const GOOGLE_ID = '000000000000000000000'
const USER_ID = '123e4567-e89b-12d3-a456-426614174000'
const PROFILE_IMAGE = 'https://avatars.githubusercontent.com/u/63793178?v=4'
const EMAIL = 'psw7347@gmail.com'

const getToday = (): Date => new Date()

const getYesterday = (): Date => {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  return date
}

const createUser = async (googleId: string, userData: any, ctx: Context): Promise<User> => {
  try {
    return await ctx.prisma.user.create({
      data: { google_id: googleId, ...userData },
    })
  } catch (e) {
    console.error('Error creating user:', e)
    throw e
  }
}

const updateUser = async (googleId: string, updateData: any, ctx: Context): Promise<User> => {
  try {
    const updatedUser = await ctx.prisma.user.update({
      where: { google_id: googleId },
      data: updateData,
    })
    return updatedUser
  } catch (e) {
    console.error('Error updating user:', e)
    throw e
  }
}

const getUser = async (googleId: string, ctx: Context): Promise<User | null> => {
  try {
    const fetchedUser = await ctx.prisma.user.findUnique({ where: { google_id: googleId } })
    return fetchedUser
  } catch (e) {
    console.error('Error getting user:', e)
    throw e
  }
}

beforeEach(() => {
  mockCtx = createMockContext()
  ctx = mockCtx as unknown as Context
})

describe('User Unit Tests', () => {
  const createUserData = () => ({
    id: USER_ID,
    google_id: GOOGLE_ID,
    name: 'Seiwon Park',
    profileThumbnail: PROFILE_IMAGE,
    sessionId: null,
    createdAt: getToday(),
    modifiedAt: getToday(),
    role: Role.USER,
  })

  test('should create a new user', async () => {
    const userData = createUserData()

    const createUserPayload = {
      google_id: GOOGLE_ID,
      name: 'Seiwon Park',
      profileThumbnail: PROFILE_IMAGE,
      profile: {
        create: {
          family_name: 'Park',
          given_name: 'Seiwon',
          profileImage: PROFILE_IMAGE,
          email: EMAIL,
        },
      },
    }

    if (!isCreateUserSchema(createUserPayload)) {
      throw new Error('CreateUserPayload does not match the expected schema.')
    }

    mockCtx.prisma.user.create.mockResolvedValue(userData)
    await expect(createUser(GOOGLE_ID, createUserPayload, ctx)).resolves.toEqual(userData)
  })

  test('should update an existing user', async () => {
    const userUpdatePayload = {
      name: 'Updated Given Updated Family',
      profileThumbnail: PROFILE_IMAGE,
      profile: {
        update: {
          family_name: 'Updated Family',
          given_name: 'Updated Given',
          profileImage: PROFILE_IMAGE,
        },
      },
    }

    if (!isUpdateUserSchema(userUpdatePayload)) {
      throw new Error('UpdateUserPayload does not match the expected schema.')
    }

    const updatedUserData = {
      ...createUserData(),
      ...userUpdatePayload,
      createdAt: getYesterday(),
    }

    mockCtx.prisma.user.update.mockResolvedValue(updatedUserData)
    await expect(updateUser(USER_ID, userUpdatePayload, ctx)).resolves.toEqual(updatedUserData)
  })

  test('should get an sxisting user by Google ID', async () => {
    const userData = createUserData()
    mockCtx.prisma.user.create.mockResolvedValue(userData)

    const createdUser = await createUser(GOOGLE_ID, userData, ctx)
    expect(createdUser).toEqual(userData)

    mockCtx.prisma.user.findUnique.mockResolvedValue(userData)
    const retrievedUser = await getUser(GOOGLE_ID, ctx)
    expect(retrievedUser).toEqual(userData)
  })
})
