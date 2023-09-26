import { CustomRequest, CustomResponse } from '../interfaces/common.interface'
import { verifyTokenService } from '../services/auth.service'

export const decodeTokenController = async (req: CustomRequest, res: CustomResponse) => {
  const { token } = req.body

  if (!token) {
    return res.sendStatus(401)
  }

  const payload = await verifyTokenService(token)

  if (!payload) {
    return res.sendStatus(401)
  }

  res.cookie('jwt', token, {
    httpOnly: true,
    // secure: true,
    maxAge: 1 * 60 * 60 * 1000, // 1 hour
  })
  res.sendStatus(200)
  // TODO: error handling for middlewares
  // TODO: add error handling routers
}

export const logoutController = async (req: CustomRequest, res: CustomResponse) => {
  res.clearCookie('jwt')
  res.sendStatus(200)
}
