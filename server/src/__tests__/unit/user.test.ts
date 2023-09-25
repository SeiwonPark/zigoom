import { MockContext, Context, createMockContext } from '../context'
import { createUser } from './functions/user'
import { isCreateUserSchema } from '../../validations/user.validation'

let mockCtx: MockContext
let ctx: Context

enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

beforeEach(() => {
  mockCtx = createMockContext()
  ctx = mockCtx as unknown as Context
})

describe('User Unit Tests', () => {
  test('should create a new user ', async () => {
    const createUserPayload = {
      google_id: '000000000000000000000',
      family_name: 'Park',
      given_name: 'Seiwon',
      name: 'Seiwon Park',
    }

    const userData = {
      ...createUserPayload,
      id: '123e4567-e89b-12d3-a456-426614174000',
      profileThumbnail: '',
      createdAt: new Date(),
      modifiedAt: new Date(),
      videoRoomId: null,
      profile: null,
      role: Role.USER,
    }

    if (!isCreateUserSchema(createUserPayload)) {
      throw new Error('createUserPayload does not match the expected schema.')
    }

    mockCtx.prisma.user.create.mockResolvedValue(userData)

    await expect(createUser(userData, ctx)).resolves.toEqual(userData)
  })
})
