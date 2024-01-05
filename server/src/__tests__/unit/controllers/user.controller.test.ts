import { Request, Response } from 'express'
import { container } from 'tsyringe'

import { Role, User } from '@db/mysql/generated/mysql'
import GoogleAuth from '@modules/users/adapters/GoogleAuth/GoogleAuth'
import GoogleAuthProvider from '@modules/users/adapters/GoogleAuth/GoogleAuthProvider'
import UserController from '@modules/users/controllers/UserController'
import UserRepositoryImpl from '@modules/users/repositories/implementations/UserRepositoryImpl'
import CreateUserService from '@modules/users/services/CreateUserService'
import GetUserService from '@modules/users/services/GetUserService'
import SingleUploadService from '@modules/users/services/SingleUploadService'
import UpdateUserService from '@modules/users/services/UpdateUserService'
import { ErrorCode, RequestError } from '@shared/errors'

const mockRequest = () => ({
  query: { include: 'true' },
  body: {
    token: 'json-web-token',
    provider: 'google',
  },
  ctx: { user: {} },
})

describe('User Controller Unit Tests', () => {
  const userRepository = new UserRepositoryImpl()
  const userController = new UserController()
  const googleAuth = new GoogleAuth()
  const googleAuthProvider = new GoogleAuthProvider(googleAuth)
  const singleUploadService = new SingleUploadService()

  const sendMock = jest.fn()

  let req: Partial<Request> = {
    ctx: { user: {} },
  }
  let res = {
    status: jest.fn((code: number) => ({ send: sendMock })),
    send: jest.fn(),
  }

  const user: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Seiwon Park',
    profileThumbnail: 'https://avatars.githubusercontent.com/u/63793178?v=4',
    sessionId: null,
    createdAt: new Date(),
    modifiedAt: new Date(),
    role: Role.USER,
  }

  const createUserService = new CreateUserService(userRepository, googleAuthProvider, singleUploadService)
  const getUserService = new GetUserService(userRepository)
  const updateUserService = new UpdateUserService(userRepository)

  const mockCreateUser = jest.spyOn(createUserService, 'execute')
  const mockGetUser = jest.spyOn(getUserService, 'execute')
  const mockUpdateUser = jest.spyOn(updateUserService, 'execute')

  beforeEach(() => {
    req = mockRequest()
    res = {
      status: jest.fn((code: number) => ({ send: sendMock })),
      send: jest.fn(),
    }

    jest.spyOn(container, 'resolve').mockImplementation((service: any) => {
      switch (service) {
        case CreateUserService:
          return createUserService
        case GetUserService:
          return getUserService
        case UpdateUserService:
          return updateUserService
        default:
          throw new Error('Not supported service')
      }
    })
  })

  test('should throw when payload is invalid', async () => {
    expect.assertions(3)

    mockCreateUser.mockImplementationOnce(() => {
      throw new RequestError('Invalid payload type for CreateUserSchema.', ErrorCode.BadRequest)
    })
    mockGetUser.mockImplementationOnce(() => {
      throw new RequestError("User doesn't exist by id 'undefined'", ErrorCode.NotFound)
    })
    mockUpdateUser.mockImplementationOnce(() => {
      throw new RequestError('Invalid payload type for UpdateUserSchema.', ErrorCode.BadRequest)
    })

    await expect(userController.create(req as Request, res as unknown as Response)).rejects.toEqual(
      new RequestError('Invalid payload type for CreateUserSchema.', ErrorCode.BadRequest)
    )
    await expect(userController.get(req as Request, res as unknown as Response)).rejects.toEqual(
      new RequestError("User doesn't exist by id 'undefined'", ErrorCode.NotFound)
    )
    await expect(userController.update(req as Request, res as unknown as Response)).rejects.toEqual(
      new RequestError('Invalid payload type for UpdateUserSchema.', ErrorCode.BadRequest)
    )
  })

  test('should create a user if payload is valid', async () => {
    expect.assertions(2)

    mockCreateUser.mockResolvedValue(user)
    await userController.create(req as Request, res as unknown as Response)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.status(200).send).toHaveBeenCalledWith(user)
  })

  test('should get a user if payload is valid', async () => {
    expect.assertions(2)

    mockGetUser.mockResolvedValue(user)
    await userController.get(req as Request, res as unknown as Response)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.status(200).send).toHaveBeenCalledWith(user)
  })

  test('should get an updated user if payload is valid', async () => {
    expect.assertions(2)

    mockUpdateUser.mockResolvedValue(user)
    await userController.update(req as Request, res as unknown as Response)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.status(200).send).toHaveBeenCalledWith(user)
  })
})
