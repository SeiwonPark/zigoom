import { Router } from 'express'

import AuthController from '@modules/users/controllers/AuthController'

import { requireAuthentication } from '../handlers'

const authController = new AuthController()

export const authRouter = Router()

authRouter.post('/verify', authController.verify)
authRouter.post('/logout', requireAuthentication, authController.logout)
