import { Request, Response } from 'express'
import { container } from 'tsyringe'

import { Role, User } from '@db/mysql/generated/mysql'
import SessionController from '@modules/sessions/controllers/SessionController'
import SessionRepositoryImpl from '@modules/sessions/repositories/implementations/SessionRepositoryImpl'
import GetSessionService from '@modules/sessions/services/GetSessionService'
import JoinSessionService from '@modules/sessions/services/JoinSessionService'
import UpdateSessionService from '@modules/sessions/services/UpdateSessionService'
import UserRepositoryImpl from '@modules/users/repositories/implementations/UserRepositoryImpl'
import { ErrorCode, RequestError } from '@shared/errors'

describe('Session Controller Unit Tests', () => {
  const sessionRepository = new SessionRepositoryImpl()
  const userRepository = new UserRepositoryImpl()
  const sessionController = new SessionController()

  const sendMock = jest.fn()

  let req: Partial<Request> = {
    ctx: {
      user: {},
    },
    body: { sessionId: '', title: '', isPrivate: false },
    query: { sessionId: '' },
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
  const session = {
    id: '123e4567-e89b-12d3-a456-111111111111',
    isPrivate: false,
    host: '000000000000000000000',
    title: 'Session title',
    createdAt: new Date(),
    modifiedAt: new Date(),
    endedAt: new Date(),
    users: [user],
    isHost: false, // FIXME: how to handle additional properties of Session?
  }

  const joinSessionService = new JoinSessionService(userRepository, sessionRepository)
  const getSessionService = new GetSessionService(sessionRepository)
  const updateSessionService = new UpdateSessionService(sessionRepository)

  const mockCreateSession = jest.spyOn(joinSessionService, 'execute')
  const mockGetSession = jest.spyOn(getSessionService, 'execute')
  const mockUpdateSession = jest.spyOn(updateSessionService, 'execute')

  beforeEach(() => {
    req = {
      ctx: {
        user: {},
      },
      body: { sessionId: '', title: '', isPrivate: false },
      query: { sessionId: '' },
    }
    res = {
      status: jest.fn((code: number) => ({ send: sendMock })),
      send: jest.fn(),
    }

    jest.spyOn(container, 'resolve').mockImplementation((service: any) => {
      switch (service) {
        case JoinSessionService:
          return joinSessionService
        case GetSessionService:
          return getSessionService
        case UpdateSessionService:
          return updateSessionService
        default:
          throw new Error('Not supported service')
      }
    })
  })

  test('should throw when payload is invalid', async () => {
    expect.assertions(3)

    mockCreateSession.mockImplementationOnce(() => {
      throw new RequestError('Invalid payload type for CreateSessionSchema.', ErrorCode.BadRequest)
    })
    mockGetSession.mockImplementationOnce(() => {
      throw new RequestError("Session doesn't exist by id 'undefined'", ErrorCode.NotFound)
    })
    mockUpdateSession.mockImplementationOnce(() => {
      throw new RequestError('Invalid payload type for UpdateSessionSchema', ErrorCode.BadRequest)
    })

    await expect(sessionController.join(req as Request, res as unknown as Response)).rejects.toEqual(
      new RequestError('Invalid payload type for CreateSessionSchema.', ErrorCode.BadRequest)
    )
    await expect(sessionController.get(req as Request, res as unknown as Response)).rejects.toEqual(
      new RequestError("Session doesn't exist by id 'undefined'", ErrorCode.NotFound)
    )
    await expect(sessionController.update(req as Request, res as unknown as Response)).rejects.toEqual(
      new RequestError('Invalid payload type for UpdateSessionSchema', ErrorCode.BadRequest)
    )
  })

  test('should create a new session if payload is valid', async () => {
    expect.assertions(2)

    mockCreateSession.mockResolvedValue(session)
    await sessionController.join(req as Request, res as unknown as Response)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.status(200).send).toHaveBeenCalledWith(session)
  })

  test('should get a session if payload is valid', async () => {
    expect.assertions(2)

    mockGetSession.mockResolvedValue(session)
    await sessionController.get(req as Request, res as unknown as Response)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.status(200).send).toHaveBeenCalledWith(session)
  })

  test('should update a session if payload is valid', async () => {
    expect.assertions(2)

    mockUpdateSession.mockResolvedValue(session)
    await sessionController.update(req as Request, res as unknown as Response)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.status(200).send).toHaveBeenCalledWith(session)
  })
})
