import { Role, User } from '@db/mysql/generated/mysql'
import SessionRepository from '@modules/sessions/repositories/SessionRepository'
import SessionRepositoryImpl from '@modules/sessions/repositories/implementations/SessionRepositoryImpl'
import GetSessionService from '@modules/sessions/services/GetSessionService'
import JoinSessionService from '@modules/sessions/services/JoinSessionService'
import UpdateSessionService from '@modules/sessions/services/UpdateSessionService'
import UserRepository from '@modules/users/repositories/UserRepository'
import UserRepositoryImpl from '@modules/users/repositories/implementations/UserRepositoryImpl'
import { ErrorCode, RequestError } from '@shared/errors'

describe('Session Service Unit Tests', () => {
  let joinSessionService: JoinSessionService
  let getSessionService: GetSessionService
  let updateSessionService: UpdateSessionService
  let userRepository: UserRepository
  let sessionRepository: SessionRepository

  const validToken = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Seiwon Park',
    familyName: 'Park',
    givenName: 'Seiwon',
    locale: 'ko',
    exp: ~~(Date.now() / 1000) + 60,
    picture: 'https://zigoom-public-assets.s3.ap-northeast-2.amazonaws.com/profile.png',
    email: 'psw7347@gmail.com',
    providerId: '000000000000000000000',
    provider: 'google',
    isGuest: false,
  }
  const user: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Seiwon Park',
    profileThumbnail: 'https://zigoom-public-assets.s3.ap-northeast-2.amazonaws.com/profile.png',
    sessionId: null,
    createdAt: new Date(),
    modifiedAt: new Date(),
    role: Role.USER,
  }
  const anotherUser: User = {
    id: 'fedcba98-7654-3210-fedc-ba9876543210',
    name: 'Tony Park',
    profileThumbnail: 'https://zigoom-public-assets.s3.ap-northeast-2.amazonaws.com/profile.png',
    sessionId: null,
    createdAt: new Date(),
    modifiedAt: new Date(),
    role: Role.USER,
  }
  const session = {
    id: '123e4567-e89b-12d3-a456-111111111111',
    isPrivate: false,
    host: '000000000000000000000',
    title: 'Session title',
    createdAt: new Date(),
    modifiedAt: new Date(),
    endedAt: new Date(),
    users: [user],
  }

  beforeEach(() => {
    userRepository = new UserRepositoryImpl()
    sessionRepository = new SessionRepositoryImpl()
    joinSessionService = new JoinSessionService(userRepository, sessionRepository)
    updateSessionService = new UpdateSessionService(sessionRepository)
    getSessionService = new GetSessionService(sessionRepository)
  })

  describe('JoinSessionService Tests', () => {
    test('should create a new session if all payloads are valid', async () => {
      expect.assertions(1)

      userRepository.findByProviderId = jest.fn().mockReturnValue(user)
      sessionRepository.save = jest.fn().mockReturnValue(session)

      await expect(
        joinSessionService.execute({
          payload: validToken,
          sessionId: '123e4567-e89b-12d3-a456-111111111111',
          title: 'Session title',
          isPrivate: false,
        })
      ).resolves.toEqual(session)
    })
  })

  describe('GetSessionService Tests', () => {
    test('should fail to get an existing session by invalid sessionId', async () => {
      expect.assertions(1)

      userRepository.findByProviderId = jest.fn().mockReturnValue(user)
      sessionRepository.findById = jest.fn().mockReturnValue(null)
      const wrongSessionId = '123e4567-e89b-12d3-a456-999999999999'

      await expect(getSessionService.execute({ payload: validToken, sessionId: wrongSessionId })).rejects.toEqual(
        new RequestError(`Session doesn't exist by id '${wrongSessionId}'`, ErrorCode.NotFound)
      )
    })

    test('should get an existing session by sessionId', async () => {
      expect.assertions(1)

      userRepository.findByProviderId = jest.fn().mockReturnValue(user)
      sessionRepository.findById = jest.fn().mockReturnValue(session)

      await expect(
        getSessionService.execute({ payload: validToken, sessionId: '123e4567-e89b-12d3-a456-111111111111' })
      ).resolves.toEqual(session)
    })
  })

  describe('UpdateSessionService Tests', () => {
    test('should update an existing session if all payloads are valid', async () => {
      expect.assertions(1)

      const updateSessionData = {
        title: 'Updated session title',
        users: [anotherUser],
      }
      const updatedSession = {
        ...session,
        ...updateSessionData,
      }
      sessionRepository.findById = jest.fn().mockResolvedValue(session)
      sessionRepository.update = jest.fn().mockReturnValue(updatedSession)

      await expect(
        updateSessionService.execute({ payload: validToken, sessionId: '123', data: updateSessionData })
      ).resolves.toEqual(updatedSession)
    })
  })
})
