import SessionRepository from '@modules/sessions/repositories/SessionRepository'
import { mockMySQL } from '../../setup'
import { Prisma, Session } from '@db/mysql/generated/mysql'
import SessionRepositoryImpl from '@modules/sessions/repositories/implementations/SessionRepositoryImpl'

describe('SessionRepositoryImpl', () => {
  let sessionRepository: SessionRepository

  const session: Session = {
    id: '123e4567-e89b-12d3-a456-111111111111',
    isPrivate: false,
    host: '000000000000000000000',
    title: 'Session title',
    createdAt: new Date(),
    modifiedAt: new Date(),
    endedAt: new Date(),
  }

  beforeEach(() => {
    sessionRepository = new SessionRepositoryImpl()
  })

  test('should save a new session', async () => {
    expect.assertions(2)

    mockMySQL.session.create.mockResolvedValue(session)

    const createSessionData: Prisma.SessionCreateInput = {
      id: '123e4567-e89b-12d3-a456-111111111111',
      host: '000000000000000000000',
      title: 'Session title',
    }

    const result = await sessionRepository.save(createSessionData)
    expect(result).toEqual(session)
    expect(mockMySQL.session.create).toHaveBeenCalledWith({ data: createSessionData, include: { users: true } })
  })

  test('should find an existing session by sessionId', async () => {
    expect.assertions(2)

    mockMySQL.session.findUnique.mockResolvedValue(session)
    const sessionId = '123e4567-e89b-12d3-a456-111111111111'

    const result = await sessionRepository.findById(sessionId)
    expect(result).toEqual(session)
    expect(mockMySQL.session.findUnique).toHaveBeenCalledWith({ where: { id: sessionId } })
  })
})
