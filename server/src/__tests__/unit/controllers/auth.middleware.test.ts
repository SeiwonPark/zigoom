import type { NextFunction, Request, Response } from 'express'

import { ErrorCode, RequestError } from '@shared/errors'
import { authHandler, requireAuthentication } from '@shared/infra/http/middlewares/handlers'

describe('Auth Middleware Unit Tests', () => {
  let req: Request, res: Response, next: NextFunction

  const verifyToken = jest.fn().mockImplementation((result: any) => result)

  beforeEach(() => {
    req = {
      cookies: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      },
      ctx: {
        user: { isGuest: true },
      },
    } as Request
    res = {
      cookie: jest.fn().mockReturnThis(),
    } as unknown as Response

    next = jest.fn()
  })

  describe('authHandler Tests', () => {
    test('should call next() with guest user when no jwt in cookies', async () => {
      expect.assertions(2)

      req.cookies = {}
      await authHandler(req, res, next)

      expect(req.ctx.user.isGuest).toBe(true)
      expect(next).toHaveBeenCalled()
    })

    test('should throw error when verifyToken returns null', async () => {
      expect.assertions(2)

      verifyToken.mockReturnValue(null)

      await expect(authHandler(req, res, next)).rejects.toEqual(
        new RequestError('Failed to verify access token', ErrorCode.Unauthorized)
      )
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('requireAuthentication Tests', () => {
    test('should throw error when user is guest', () => {
      expect.assertions(2)

      req.ctx.user.isGuest = true

      expect(() => requireAuthentication(req, res, next)).toThrow(
        'Authentication required - guest user attempting to access protected resource'
      )
      expect(next).not.toHaveBeenCalled()
    })

    test('should call next() when user is authenticated', () => {
      expect.assertions(1)

      req.ctx.user.isGuest = false
      requireAuthentication(req, res, next)

      expect(next).toHaveBeenCalled()
    })
  })
})
