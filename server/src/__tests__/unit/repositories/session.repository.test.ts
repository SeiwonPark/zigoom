import { Prisma, Role, Session, User } from '@db/mysql/generated/mysql'
import SessionRepository from '@modules/sessions/repositories/SessionRepository'
import { JoinedSession } from '@modules/sessions/repositories/SessionRepository'
import SessionRepositoryImpl from '@modules/sessions/repositories/implementations/SessionRepositoryImpl'

import { mockMySQL } from '../../setup'

describe('Session Repository Unit Tests', () => {
  let sessionRepository: SessionRepository

  const user: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    google_id: '000000000000000000000',
    name: 'Seiwon Park',
    profileThumbnail: 'https://avatars.githubusercontent.com/u/63793178?v=4',
    sessionId: null,
    createdAt: new Date(),
    modifiedAt: new Date(),
    role: Role.USER,
  }
  const anotherUser: User = {
    id: 'fedcba98-7654-3210-fedc-ba9876543210',
    google_id: '222222222222222222222',
    name: 'Tony Park',
    profileThumbnail: 'https://avatars.githubusercontent.com/u/63793178?v=4',
    sessionId: null,
    createdAt: new Date(),
    modifiedAt: new Date(),
    role: Role.USER,
  }
  const session: Session = {
    id: '123e4567-e89b-12d3-a456-111111111111',
    isPrivate: false,
    host: '000000000000000000000',
    title: 'Session title',
    createdAt: new Date(),
    modifiedAt: new Date(),
    endedAt: new Date(),
  }
  const joinedSession: JoinedSession = {
    ...session,
    users: [user],
  }

  beforeEach(() => {
    sessionRepository = new SessionRepositoryImpl()
  })

  test('should save a new session', async () => {
    expect.assertions(2)

    mockMySQL.session.create.mockResolvedValue(joinedSession)

    const createSessionData: Prisma.SessionCreateInput = {
      id: '123e4567-e89b-12d3-a456-111111111111',
      host: '000000000000000000000',
      title: 'Session title',
      users: {
        connect: { id: user.id },
      },
    }

    const result = await sessionRepository.save(createSessionData, true)
    expect(result).toEqual(joinedSession)
    expect(mockMySQL.session.create).toHaveBeenCalledWith({ data: createSessionData, include: { users: true } })
  })

  test('should find an existing session by sessionId', async () => {
    expect.assertions(2)

    mockMySQL.session.findUnique.mockResolvedValue(joinedSession)

    const result = await sessionRepository.findById(joinedSession.id, true)
    expect(result).toEqual(joinedSession)
    expect(mockMySQL.session.findUnique).toHaveBeenCalledWith({
      where: { id: joinedSession.id },
      include: { users: true },
    })
  })

  test('should update an existing session with another user', async () => {
    expect.assertions(2)

    const updatedSession = {
      ...joinedSession,
      users: [...joinedSession.users, anotherUser],
    }
    mockMySQL.session.update.mockResolvedValue(updatedSession)
    const updateSessionInput: Prisma.SessionUpdateInput = {
      title: 'Updated title',
      users: {
        connect: [user, anotherUser],
      },
    }

    const result = await sessionRepository.update(joinedSession.id, updateSessionInput, true)
    expect(result).toEqual(updatedSession)
    expect(mockMySQL.session.update).toHaveBeenCalledWith({
      where: { id: joinedSession.id },
      data: updateSessionInput,
      include: { users: true },
    })
  })
})
