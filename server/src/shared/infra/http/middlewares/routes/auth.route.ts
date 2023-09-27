import AuthController from '@modules/users/controllers/AuthController'
import { Router } from 'express'

const authController = new AuthController()

export const authRouter = Router()

authRouter.post('/verify', authController.verifyToken)
authRouter.post('/logout', authController.logout)
