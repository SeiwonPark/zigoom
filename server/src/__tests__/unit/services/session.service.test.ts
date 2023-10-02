import 'reflect-metadata'
import CreateSessionService from '@modules/sessions/services/CreateSessionService'
import GetSessionService from '@modules/sessions/services/GetSessionService'
import UpdateSessionService from '@modules/sessions/services/UpdateSessionService'
import UserRepositoryImpl from '@modules/users/repositories/implementations/UserRepositoryImpl'
import UserRepository from '@modules/users/repositories/UserRepository'
import SessionRepositoryImpl from '@modules/sessions/repositories/implementations/SessionRepositoryImpl'
import SessionRepository from '@modules/sessions/repositories/SessionRepository'
import { CustomError, ErrorCode } from '@shared/errors'
import { Role, User } from '@db/mysql/generated/mysql'

jest.mock('@utils/token')

describe('Session Service Unit Tests', () => {
  let createSessionService: CreateSessionService
  let getSessionService: GetSessionService
  let updateSessionService: UpdateSessionService
  let userRepository: UserRepository
  let sessionRepository: SessionRepository

  const expiredToken = {
    name: 'Seiwon Park',
    family_name: 'Park',
    given_name: 'Seiwon',
    exp: ~~(Date.now() / 1000) - 60, // expired
    picture: 'https://avatars.githubusercontent.com/u/63793178?v=4',
    email: 'psw7347@gmail.com',
    sub: '000000000000000000000',
  }
  const validToken = {
    name: 'Seiwon Park',
    family_name: 'Park',
    given_name: 'Seiwon',
    exp: ~~(Date.now() / 1000) + 60,
    picture: 'https://avatars.githubusercontent.com/u/63793178?v=4',
    email: 'psw7347@gmail.com',
    sub: '000000000000000000000',
  }
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
    createSessionService = new CreateSessionService(userRepository, sessionRepository)
    updateSessionService = new UpdateSessionService(userRepository, sessionRepository)
    getSessionService = new GetSessionService(sessionRepository)
  })

  describe('CreateSessionService Tests', () => {
    test('should throw an error if jwt is invalid', async () => {
      expect.assertions(1)

      require('@utils/token').decodeToken = jest.fn().mockReturnValue(undefined)

      await expect(
        createSessionService.execute({
          id: '123e4567-e89b-12d3-a456-111111111111',
          title: 'Session title',
          isPrivate: false,
          jwt: 'invalid-token',
        }),
      ).rejects.toEqual(new CustomError('Failed to get payload from token', ErrorCode.Unauthorized))
    })

    test('should throw an error if token is expired', async () => {
      expect.assertions(1)

      require('@utils/token').decodeToken = jest.fn().mockReturnValue(expiredToken)

      await expect(
        createSessionService.execute({
          id: '123e4567-e89b-12d3-a456-111111111111',
          title: 'Session title',
          isPrivate: false,
          jwt: 'expired-token',
        }),
      ).rejects.toEqual(new CustomError('The token has been expired', ErrorCode.Unauthorized))
    })

    test('should create a new session if all payloads are valid', async () => {
      expect.assertions(1)

      require('@utils/token').decodeToken = jest.fn().mockReturnValue(validToken)
      userRepository.findUserByGoogleId = jest.fn().mockReturnValue(user)
      sessionRepository.save = jest.fn().mockReturnValue(session)

      await expect(
        createSessionService.execute({
          id: '123e4567-e89b-12d3-a456-111111111111',
          title: 'Session title',
          isPrivate: false,
          jwt: 'valid-token',
        }),
      ).resolves.toEqual(session)
    })
  })

  describe('GetSessionService Tests', () => {
    test('should throw an error if jwt is invalid', async () => {
      expect.assertions(1)

      require('@utils/token').decodeToken = jest.fn().mockReturnValue(undefined)

      await expect(getSessionService.execute({ jwt: 'invalid-token', sessionId: '123' })).rejects.toEqual(
        new CustomError('Failed to get payload from token', ErrorCode.Unauthorized),
      )
    })

    test('should throw an error if token is expired', async () => {
      expect.assertions(1)

      require('@utils/token').decodeToken = jest.fn().mockReturnValue(expiredToken)

      await expect(getSessionService.execute({ jwt: 'expired-token', sessionId: '123' })).rejects.toEqual(
        new CustomError('The token has been expired', ErrorCode.Unauthorized),
      )
    })

    test('should fail to get an existing session by invalid sessionId', async () => {
      expect.assertions(1)

      require('@utils/token').decodeToken = jest.fn().mockReturnValue(validToken)

      userRepository.findUserByGoogleId = jest.fn().mockReturnValue(user)
      sessionRepository.findById = jest.fn().mockReturnValue(null)

      const wrongSessionId = '123e4567-e89b-12d3-a456-999999999999'

      await expect(getSessionService.execute({ jwt: 'valid-token', sessionId: wrongSessionId })).rejects.toEqual(
        new CustomError(`Session doesn't exist by id '${wrongSessionId}'`, ErrorCode.NotFound),
      )
    })

    test('should get an existing session by sessionId', async () => {
      expect.assertions(1)

      require('@utils/token').decodeToken = jest.fn().mockReturnValue(validToken)

      userRepository.findUserByGoogleId = jest.fn().mockReturnValue(user)
      sessionRepository.findById = jest.fn().mockReturnValue(session)

      await expect(
        getSessionService.execute({ jwt: 'valid-token', sessionId: '123e4567-e89b-12d3-a456-111111111111' }),
      ).resolves.toEqual(session)
    })
  })

  describe('UpdateSessionService Tests', () => {
    test('should throw an error if jwt is invalid', async () => {
      expect.assertions(1)

      require('@utils/token').decodeToken = jest.fn().mockReturnValue(undefined)

      await expect(updateSessionService.execute({ jwt: 'invalid-token', sessionId: '123', data: {} })).rejects.toEqual(
        new CustomError('Failed to get payload from token', ErrorCode.Unauthorized),
      )
    })

    test('should throw an error if token is expired', async () => {
      expect.assertions(1)

      require('@utils/token').decodeToken = jest.fn().mockReturnValue(expiredToken)

      await expect(updateSessionService.execute({ jwt: 'expired-token', sessionId: '123', data: {} })).rejects.toEqual(
        new CustomError('The token has been expired', ErrorCode.Unauthorized),
      )
    })

    test('should update an existing session if all payloads are valid', async () => {
      expect.assertions(1)

      require('@utils/token').decodeToken = jest.fn().mockReturnValue(validToken)

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
        updateSessionService.execute({ jwt: 'valid-token', sessionId: '123', data: updateSessionData }),
      ).resolves.toEqual(updatedSession)
    })
  })
})
