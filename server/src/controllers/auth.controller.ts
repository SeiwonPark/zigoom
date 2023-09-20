import { Request, Response } from 'express'
import { verifyTokenService } from '../services/auth.service'

export const checkAuthenticatedController = (req: Request, res: Response) => {
  if (req.cookies && req.cookies.jwt) {
    res.sendStatus(200)
  } else {
    res.sendStatus(400)
  }
}

export const verifyTokenController = async (req: Request, res: Response) => {
  const { token } = req.body
  const payload = await verifyTokenService(token)

  res.cookie('jwt', payload, {
    httpOnly: true,
    // secure: true,
    maxAge: 1 * 60 * 60 * 1000, // 1 hour
  })
  res.sendStatus(200)
  // TODO: error handling for middlewares
  // TODO: add error handling routers
}

export const logoutController = async (req: Request, res: Response) => {
  res.clearCookie('jwt')
  res.sendStatus(200)
}
