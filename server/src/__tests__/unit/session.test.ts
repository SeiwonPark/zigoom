import { Session } from '@prisma/mysql/generated/mysql'
import { MockContext, Context, createMockContext } from '../context'
import { isCreateSessionSchema } from '@modules/sessions/validations/session.validation'

let mockCtx: MockContext
let ctx: Context

const GOOGLE_ID = '000000000000000000000'

beforeEach(() => {
  mockCtx = createMockContext()
  ctx = mockCtx as unknown as Context
})

const createSession = async (sessionData: any, ctx: Context): Promise<Session> => {
  try {
    return await ctx.prisma.session.create(sessionData)
  } catch (e) {
    console.error('Error creating session, e')
    throw e
  }
}

describe('Session Unit Tests', () => {
  const createSessionData = () => ({
    id: '123e4567-e89b-12d3-a456-426614174000',
    isPrivate: false,
    host: GOOGLE_ID,
    title: 'Session title',
    createdAt: new Date(),
    modifiedAt: new Date(),
    endedAt: new Date(),
    users: [],
  })

  test('should create a new session', async () => {
    const sessionData = createSessionData()

    const createSessionPayload = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      isPrivate: false,
      title: 'Session title',
      users: {
        connect: {
          google_id: GOOGLE_ID,
        },
      },
    }

    if (!isCreateSessionSchema(createSessionPayload)) {
      throw Error('CreateSessionPayload does not match the expected schema.')
    }

    mockCtx.prisma.session.create.mockResolvedValue(sessionData)
    await expect(createSession(createSessionPayload, ctx)).resolves.toEqual(sessionData)
  })
})
