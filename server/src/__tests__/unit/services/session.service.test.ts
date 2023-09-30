import 'reflect-metadata'
import CreateSessionService from '@modules/sessions/services/CreateSessionService'
import GetSessionService from '@modules/sessions/services/GetSessionService'
import SessionRepository from '@modules/sessions/repositories/implementations/SessionRepositoryImpl'
import UserRepository from '@modules/users/repositories/implementations/UserRepositoryImpl'
import { CustomError } from '@shared/errors/CustomError'
import { Role, Session, User } from '@prisma/mysql/generated/mysql'

jest.mock('@utils/token')

describe('Session Service Unit Tests', () => {
  let createSessionService: CreateSessionService
  let getSessionService: GetSessionService

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
  const session: Session = {
    id: '123e4567-e89b-12d3-a456-111111111111',
    isPrivate: false,
    host: '000000000000000000000',
    title: 'Session title',
    createdAt: new Date(),
    modifiedAt: new Date(),
    endedAt: new Date(),
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

  const userRepository = new UserRepository() as jest.Mocked<UserRepository>
  const sessionRepository = new SessionRepository() as jest.Mocked<SessionRepository>

  beforeEach(() => {
    createSessionService = new CreateSessionService(sessionRepository, userRepository)
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
      ).rejects.toEqual(new CustomError('Failed to get payload from token', 401))
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
      ).rejects.toEqual(new CustomError('The token has been expired', 401))
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
        new CustomError('Failed to get payload from token', 401),
      )
    })

    test('should throw an error if token is expired', async () => {
      expect.assertions(1)

      require('@utils/token').decodeToken = jest.fn().mockReturnValue(expiredToken)

      await expect(getSessionService.execute({ jwt: 'expired-token', sessionId: '123' })).rejects.toEqual(
        new CustomError('The token has been expired', 401),
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
})
