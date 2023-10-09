import AuthController from '@modules/users/controllers/AuthController'
import { Router } from 'express'
import { requireAuthentication } from '../handlers'

const authController = new AuthController()

export const authRouter = Router()

authRouter.post('/verify', authController.verifyToken)
authRouter.post('/logout', requireAuthentication, authController.logout)
