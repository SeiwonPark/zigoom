import { Router } from 'express'
import { decodeTokenController, logoutController } from '../../controllers/auth.controller'

export const authRouter = Router()

authRouter.post('/verify', decodeTokenController)
authRouter.post('/logout', logoutController)
