import { Role } from '@db/mysql/generated/mysql'
import { AuthProvider } from '@modules/users/adapters'
import GoogleAuth from '@modules/users/adapters/GoogleAuth/GoogleAuth'
import GoogleAuthProvider from '@modules/users/adapters/GoogleAuth/GoogleAuthProvider'
import UserRepository, { JoinedUser } from '@modules/users/repositories/UserRepository'
import UserRepositoryImpl from '@modules/users/repositories/implementations/UserRepositoryImpl'
import CreateUserService from '@modules/users/services/CreateUserService'
import GetUserService from '@modules/users/services/GetUserService'
import SingleUploadService from '@modules/users/services/SingleUploadService'
import UpdateUserService from '@modules/users/services/UpdateUserService'
import { ErrorCode, RequestError } from '@shared/errors'

describe('User Service Unit Tests', () => {
  let createUserService: CreateUserService
  let getUserService: GetUserService
  let updateUserService: UpdateUserService
  let singleUploadService: SingleUploadService
  let googleAuth: GoogleAuth
  let googleAuthProvider: AuthProvider
  let userRepository: UserRepository

  const payload = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Seiwon Park',
    familyName: 'Park',
    givenName: 'Seiwon',
    picture: 'https://zigoom-public-assets.s3.ap-northeast-2.amazonaws.com/profile.png',
    email: 'psw7347@gmail.com',
    aud: 'client-id',
    providerId: '000000000000000000000',
    provider: 'google',
    locale: 'ko',
    isGuest: false,
  }

  const validJWT =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InBzdzczNDdAZ21haWwuY29tIiwiZmFtaWx5TmFtZSI6IlBhcmsiLCJnaXZlbk5hbWUiOiJTZWl3b24iLCJsb2NhbGUiOiJrbyIsIm5hbWUiOiJTZWl3b24gUGFyayIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NMcU9oWlVOWnhRN0NQQURmSDQza1Q0NHlYdm5kdTNmOC0xZkRMdFNSRGduQzNmPXM5Ni1jIiwicHJvdmlkZXJJZCI6IjExMzQyNDEzODkzNzg2Njg0ODgyOSIsInByb3ZpZGVyIjoiZ29vZ2xlIiwiaXNVc2VyRXhpc3RzIjp0cnVlLCJleHAiOjE4MDAwMDAwMDAsImlhdCI6MTcwMDAwMDAwMH0.geayiUiCm9V9m_b10vbZ4prl4U8F3kyjVT4elhXCa-o'

  const joinedUser: JoinedUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Seiwon Park',
    profileThumbnail: 'https://zigoom-public-assets.s3.ap-northeast-2.amazonaws.com/profile.png',
    sessionId: null,
    createdAt: new Date(),
    modifiedAt: new Date(),
    role: Role.USER,
    profile: {
      id: '123e4567-e89b-12d3-a456-436614174000',
      familyName: 'Park',
      givenName: 'Seiwon',
      profileImage: 'https://zigoom-public-assets.s3.ap-northeast-2.amazonaws.com/profile.png',
      email: 'psw7347@gmail.com',
      userId: '123e4567-e89b-12d3-a456-426614174000',
    },
    authProvider: {
      id: '123e4567-e89b-12d3-a456-446614174000',
      provider: 'google',
      providerId: '000000000000000000000',
      userId: '123e4567-e89b-12d3-a456-426614174000',
    },
  }

  beforeEach(() => {
    userRepository = new UserRepositoryImpl()
    googleAuth = new GoogleAuth()
    googleAuthProvider = new GoogleAuthProvider(googleAuth)
    singleUploadService = new SingleUploadService()
    createUserService = new CreateUserService(userRepository, googleAuthProvider, singleUploadService)
    getUserService = new GetUserService(userRepository)
    updateUserService = new UpdateUserService(userRepository)
  })

  describe('CreateUserService Tests', () => {
    test('should create a new user with google auth if all payloads are valid', async () => {
      expect.assertions(3)

      userRepository.findByProviderId = jest.fn().mockReturnValue(null)
      userRepository.save = jest.fn().mockReturnValue(joinedUser)

      jest.spyOn(googleAuthProvider, 'authenticate').mockResolvedValue(payload)
      jest.spyOn(singleUploadService, 'execute').mockResolvedValue(joinedUser.profileThumbnail)
      const result = await createUserService.execute({ token: validJWT, provider: 'google' })

      expect(result).toEqual(joinedUser)
      expect(userRepository.findByProviderId).toHaveBeenCalledWith(payload.providerId)
      expect(googleAuthProvider.authenticate).toHaveBeenCalledWith(validJWT)
    })
  })

  describe('GetUserService Tests', () => {
    test('should fail to get a user if no user found with the google id', async () => {
      expect.assertions(1)

      userRepository.findByProviderId = jest.fn().mockResolvedValue(null)
      const invalidGoogleIdToken = { ...payload, providerId: '999999999999999999999' }

      await expect(getUserService.execute({ payload: invalidGoogleIdToken, include: false })).rejects.toEqual(
        new RequestError(
          `User doesn't exist by ${invalidGoogleIdToken.provider} id '999999999999999999999'`,
          ErrorCode.NotFound
        )
      )
    })

    test('should get an existing user if all payloads are valid', async () => {
      expect.assertions(1)

      userRepository.findByProviderId = jest.fn().mockResolvedValue(joinedUser)

      await expect(getUserService.execute({ payload: payload, include: false })).resolves.toEqual(joinedUser)
    })
  })

  describe('UpdateUserService Tests', () => {
    test('should fail to update a user if data is invalid type', async () => {
      expect.assertions(1)

      const updateUserData = {
        name: 'Updated name',
        profileThumbnail: 'https://avatars.githubusercontent.com/u/63793178?v=1',
        profile: {
          familyName: 1234, // should be string
          givenName: 4567, // should be string
        },
      }

      const updatedUser: JoinedUser = {
        ...joinedUser,
        name: 'Updated name', // updated
      }

      userRepository.findByProviderId = jest.fn().mockResolvedValue(joinedUser)
      userRepository.update = jest.fn().mockReturnValue(updatedUser)

      await expect(
        updateUserService.execute({ payload: payload, include: true, data: updateUserData })
      ).rejects.toEqual(new RequestError('Invalid payload type for UpdateUserSchema.'))
    })

    test('should update a user if all payloads are valid', async () => {
      expect.assertions(1)

      const updateUserData = {
        name: 'Updated name',
        profileThumbnail: 'https://avatars.githubusercontent.com/u/63793178?v=1',
      }
      const updatedUser: JoinedUser = {
        ...joinedUser,
        ...updateUserData,
      }
      userRepository.findByProviderId = jest.fn().mockResolvedValue(joinedUser)
      userRepository.update = jest.fn().mockReturnValue(updatedUser)

      await expect(
        updateUserService.execute({ payload: payload, include: true, data: updateUserData })
      ).resolves.toEqual(updatedUser)
    })
  })
})
