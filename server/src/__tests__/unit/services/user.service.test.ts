import CreateUserService from '@modules/users/services/CreateUserService'
import GetUserService from '@modules/users/services/GetUserService'
import UpdateUserService from '@modules/users/services/UpdateUserService'
import UserRepositoryImpl from '@modules/users/repositories/implementations/UserRepositoryImpl'
import UserRepository from '@modules/users/repositories/UserRepository'
import { CustomError, ErrorCode } from '@shared/errors'
import { Role, User } from '@db/mysql/generated/mysql'

describe('User Service Unit Tests', () => {
  let createUserService: CreateUserService
  let getUserService: GetUserService
  let updateUserService: UpdateUserService
  let userRepository: UserRepository

  const validToken = {
    id: '',
    name: 'Seiwon Park',
    family_name: 'Park',
    given_name: 'Seiwon',
    exp: ~~(Date.now() / 1000) + 60,
    picture: 'https://avatars.githubusercontent.com/u/63793178?v=4',
    email: 'psw7347@gmail.com',
    sub: '000000000000000000000',
    iss: 'https://accounts.google.com',
    aud: 'client-id',
    iat: 123,
    isGuest: false,
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

  beforeEach(() => {
    userRepository = new UserRepositoryImpl()
    createUserService = new CreateUserService(userRepository)
    getUserService = new GetUserService(userRepository)
    updateUserService = new UpdateUserService(userRepository)
  })

  describe('CreateUserService Tests', () => {
    test('should create a new user if all payloads are valid', async () => {
      expect.assertions(1)

      userRepository.findUserByGoogleId = jest.fn().mockReturnValue(null)
      userRepository.save = jest.fn().mockReturnValue(user)

      await expect(createUserService.execute({ payload: validToken })).resolves.toEqual(user)
    })
  })

  describe('GetUserService Tests', () => {
    test('should fail to get a user if no user found with the googleId', async () => {
      expect.assertions(1)

      userRepository.findUserByGoogleId = jest.fn().mockResolvedValue(null)
      const invalidGoogleIdToken = { ...validToken, sub: '999999999999999999999' }

      await expect(getUserService.execute({ payload: invalidGoogleIdToken, include: false })).rejects.toEqual(
        new CustomError(`User doesn't exist by id '${invalidGoogleIdToken.sub}'`, ErrorCode.NotFound),
      )
    })

    test('should get an existing user if all payloads are valid', async () => {
      expect.assertions(1)

      userRepository.findUserByGoogleId = jest.fn().mockResolvedValue(user)

      await expect(getUserService.execute({ payload: validToken, include: false })).resolves.toEqual(user)
    })
  })

  describe('UpdateUserService Tests', () => {
    test('should fail to update a user if data is invalid type', async () => {
      expect.assertions(1)

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
        updateUserService.execute({ payload: validToken, include: true, data: updateUserData }),
      ).rejects.toEqual(new CustomError('Invalid payload type for UpdateUserSchema.'))
    })

    test('should update a user if all payloads are valid', async () => {
      expect.assertions(1)

      const updateUserData = {
        name: 'Updated name',
        profileThumbnail: 'https://avatars.githubusercontent.com/u/63793178?v=1',
      }
      const updatedUser: User = {
        ...user,
        ...updateUserData,
      }
      userRepository.findUserByGoogleId = jest.fn().mockResolvedValue(user)
      userRepository.update = jest.fn().mockReturnValue(updatedUser)

      await expect(
        updateUserService.execute({ payload: validToken, include: true, data: updateUserData }),
      ).resolves.toEqual(updatedUser)
    })
  })
})
