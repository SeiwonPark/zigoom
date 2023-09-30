import 'reflect-metadata'
import CreateUserService from '@modules/users/services/CreateUserService'
import GetUserService from '@modules/users/services/GetUserService'
import UpdateUserService from '@modules/users/services/UpdateUserService'
import UserRepository from '@modules/users/repositories/implementations/UserRepositoryImpl'
import { CustomError, ErrorCode } from '@shared/errors'
import { Role, User } from '@prisma/mysql/generated/mysql'

jest.mock('@utils/token')

describe('User Service Unit Tests', () => {
  let createUserService: CreateUserService
  let getUserService: GetUserService
  let updateUserService: UpdateUserService

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

  const userRepository = new UserRepository() as jest.Mocked<UserRepository>

  beforeEach(() => {
    createUserService = new CreateUserService(userRepository)
    getUserService = new GetUserService(userRepository)
    updateUserService = new UpdateUserService(userRepository)
  })

  describe('CreateUserService Tests', () => {
    test('should throw an error if jwt is invalid', async () => {
      expect.assertions(1)

      require('@utils/token').decodeToken = jest.fn().mockReturnValue(undefined)

      await expect(createUserService.execute({ jwt: 'invalid-token' })).rejects.toEqual(
        new CustomError('Failed to get payload from token', ErrorCode.Unauthorized),
      )
    })

    test('should throw an error if token is expired', async () => {
      expect.assertions(1)

      require('@utils/token').decodeToken = jest.fn().mockReturnValue(expiredToken)

      await expect(createUserService.execute({ jwt: 'expired-token' })).rejects.toEqual(
        new CustomError('The token has been expired', ErrorCode.Unauthorized),
      )
    })

    test('should create a new user if all payloads are valid', async () => {
      expect.assertions(1)

      require('@utils/token').decodeToken = jest.fn().mockReturnValue(validToken)

      userRepository.findUserByGoogleId = jest.fn().mockReturnValue(null)
      userRepository.save = jest.fn().mockReturnValue(user)

      await expect(createUserService.execute({ jwt: 'valid-token' })).resolves.toEqual(user)
    })
  })

  describe('GetUserService Tests', () => {
    test('should throw an error if jwt is invalid', async () => {
      expect.assertions(1)

      require('@utils/token').decodeToken = jest.fn().mockReturnValue(undefined)

      await expect(getUserService.execute({ jwt: 'invalid-token', googleId: '123', profile: true })).rejects.toEqual(
        new CustomError('Failed to get payload from token', ErrorCode.Unauthorized),
      )
    })

    test('should throw an error if token is expired', async () => {
      expect.assertions(1)

      require('@utils/token').decodeToken = jest.fn().mockReturnValue(expiredToken)

      await expect(getUserService.execute({ jwt: 'expired-token', googleId: '123', profile: true })).rejects.toEqual(
        new CustomError('The token has been expired', ErrorCode.Unauthorized),
      )
    })

    test('should fail to get an existing user if googleId is invalid', async () => {
      expect.assertions(1)

      require('@utils/token').decodeToken = jest.fn().mockReturnValue(validToken)
      userRepository.findUserByGoogleId = jest.fn().mockResolvedValue(null)

      const wrongGoogleId = '999999999999999999999'

      await expect(
        getUserService.execute({ jwt: 'valid-token', googleId: wrongGoogleId, profile: true }),
      ).rejects.toEqual(new CustomError(`User doesn't exist by id '${wrongGoogleId}'`, ErrorCode.NotFound))
    })

    test('should get an existing user if all payloads are valid', async () => {
      expect.assertions(1)

      require('@utils/token').decodeToken = jest.fn().mockReturnValue(validToken)
      userRepository.findUserByGoogleId = jest.fn().mockResolvedValue(user)

      await expect(
        getUserService.execute({ jwt: 'valid-token', googleId: '000000000000000000000', profile: true }),
      ).resolves.toEqual(user)
    })
  })

  describe('UpdateUserService Tests', () => {
    test('should throw an error if jwt is invalid', async () => {
      expect.assertions(1)

      require('@utils/token').decodeToken = jest.fn().mockReturnValue(undefined)

      await expect(updateUserService.execute({ jwt: 'invalid-token', googleId: '123', data: {} })).rejects.toEqual(
        new CustomError('Failed to get payload from token', ErrorCode.Unauthorized),
      )
    })

    test('should throw an error if token is expired', async () => {
      expect.assertions(1)

      require('@utils/token').decodeToken = jest.fn().mockReturnValue(expiredToken)

      await expect(updateUserService.execute({ jwt: 'expired-token', googleId: '123', data: {} })).rejects.toEqual(
        new CustomError('The token has been expired', ErrorCode.Unauthorized),
      )
    })

    test('should fail to update a user if some payloads are invalid', async () => {
      expect.assertions(1)

      require('@utils/token').decodeToken = jest.fn().mockReturnValue(validToken)

      const updateUserData = {
        name: 'Updated name',
        profileThumbnail: 'https://avatars.githubusercontent.com/u/63793178?v=1',
        profile: {
          family_name: 1234,
          given_name: 4567,
        },
      }

      const updatedUser: User = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        google_id: '000000000000000000000',
        name: 'Updated name',
        profileThumbnail: 'https://avatars.githubusercontent.com/u/63793178?v=1',
        sessionId: null,
        createdAt: new Date(),
        modifiedAt: new Date(),
        role: Role.USER,
      }

      userRepository.findUserByGoogleId = jest.fn().mockResolvedValue(user)
      userRepository.update = jest.fn().mockReturnValue(updatedUser)

      await expect(
        updateUserService.execute({ jwt: 'valid-token', googleId: '000000000000000000000', data: updateUserData }),
      ).rejects.toEqual(new CustomError('Invalid payload type for UpdateUserSchema.'))
    })

    test('should update a user if all payloads are valid', async () => {
      expect.assertions(1)

      require('@utils/token').decodeToken = jest.fn().mockReturnValue(validToken)

      const updateUserData = {
        name: 'Updated name',
        profileThumbnail: 'https://avatars.githubusercontent.com/u/63793178?v=1',
      }

      const updatedUser: User = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        google_id: '000000000000000000000',
        name: 'Updated name',
        profileThumbnail: 'https://avatars.githubusercontent.com/u/63793178?v=1',
        sessionId: null,
        createdAt: new Date(),
        modifiedAt: new Date(),
        role: Role.USER,
      }

      userRepository.findUserByGoogleId = jest.fn().mockResolvedValue(user)
      userRepository.update = jest.fn().mockReturnValue(updatedUser)

      await expect(
        updateUserService.execute({ jwt: 'valid-token', googleId: '000000000000000000000', data: updateUserData }),
      ).resolves.toEqual(updatedUser)
    })
  })
})
