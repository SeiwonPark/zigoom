import { MockContext, Context, createMockContext } from '../context'
import { createUser, updateUser } from './functions/user'
import { isCreateUserSchema, isUpdateUserSchema } from '../../modules/users/validations/user.validation'
import { Role } from '../../../prisma/mysql/generated/mysql'

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

beforeEach(() => {
  mockCtx = createMockContext()
  ctx = mockCtx as unknown as Context
})

describe('User Unit Tests', () => {
  const createUserData = () => ({
    google_id: GOOGLE_ID,
    name: 'Seiwon Park',
    profileThumbnail: PROFILE_IMAGE,
    id: USER_ID,
    createdAt: getToday(),
    modifiedAt: getToday(),
    sessionId: null,
    role: Role.USER,
    profile: {
      create: {
        family_name: 'Park',
        given_name: 'Seiwon',
        profileImage: PROFILE_IMAGE,
        email: EMAIL,
      },
    },
  })

  test('should create a new user', async () => {
    const userData = createUserData()

    if (!isCreateUserSchema(userData)) {
      throw new Error('CreateUserPayload does not match the expected schema.')
    }

    mockCtx.prisma.user.create.mockResolvedValue(userData)
    await expect(createUser(GOOGLE_ID, userData, ctx)).resolves.toEqual(userData)
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
})
