import { Router } from 'express'
import AuthController from '../../modules/users/controllers/AuthController'

const authController = new AuthController()

export const authRouter = Router()

authRouter.post('/verify', authController.verifyToken)
authRouter.post('/logout', authController.logout)
