import type { NextFunction, Request, Response } from 'express'

import { ErrorCode, RequestError } from '@shared/errors'
import { authHandler, requireAuthentication } from '@shared/infra/http/middlewares/handlers'
import { verifyToken } from '@utils/token'

const validToken = {
  exp: Date.now() / 1000 + 60,
}
const expiredToken = {
  exp: Date.now() / 1000 - 60,
}

describe('Auth Middleware Unit Tests', () => {
  let req: Request, res: Response, next: NextFunction

  const mockDecodeToken = (value: any): void => {
    ;(verifyToken as jest.MockedFunction<typeof verifyToken>).mockResolvedValue(value)
  }

  beforeEach(() => {
    req = {
      cookies: {
        jwt: 'json-web-token',
      },
      ctx: {
        user: null,
      },
    } as Request
    res = {
      cookie: jest.fn().mockReturnThis(),
    } as unknown as Response

    next = jest.fn()
  })

  // FIXME:
  // describe('authHandler Tests', () => {
  //   test('should call next() with guest user when no jwt in cookies', async () => {
  //     expect.assertions(2)

  //     req.cookies = {}
  //     await authHandler(req, res, next)

  //     expect(req.ctx.user.isGuest).toBe(true)
  //     expect(next).toHaveBeenCalled()
  //   })

  //   test('should throw error when decodeToken returns null', async () => {
  //     expect.assertions(2)

  //     mockDecodeToken(undefined)
  //     await expect(authHandler(req, res, next)).rejects.toEqual(
  //       new RequestError('Failed to get payload from token', ErrorCode.Unauthorized)
  //     )
  //     expect(next).not.toHaveBeenCalled()
  //   })

  //   test('should throw error when token is expired', async () => {
  //     expect.assertions(2)

  //     mockDecodeToken(expiredToken)
  //     await expect(authHandler(req, res, next)).rejects.toEqual(
  //       new RequestError('The token has been expired', ErrorCode.Unauthorized)
  //     )
  //     expect(next).not.toHaveBeenCalled()
  //   })

  //   test('should call next() with decoded token when token is valid', async () => {
  //     expect.assertions(2)

  //     mockDecodeToken(validToken)
  //     await authHandler(req, res, next)

  //     expect(req.ctx.user.isGuest).toBe(false)
  //     expect(next).toHaveBeenCalled()
  //   })
  // })

  describe('requireAuthentication Tests', () => {
    test('should throw error when user is guest', () => {
      expect.assertions(2)

      req.ctx.user = { isGuest: true }

      expect(() => requireAuthentication(req, res, next)).toThrow('Authentication required')
      expect(next).not.toHaveBeenCalled()
    })

    test('should call next() when user is authenticated', () => {
      expect.assertions(1)

      req.ctx.user = { isGuest: false }
      requireAuthentication(req, res, next)

      expect(next).toHaveBeenCalled()
    })
  })
})
