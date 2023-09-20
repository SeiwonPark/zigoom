import { Router } from 'express'
import {
  checkAuthenticatedController,
  logoutController,
  verifyTokenController,
} from '../../controllers/auth.controller'

export const authRouter = Router()

authRouter.get('/check', checkAuthenticatedController)
authRouter.post('/verify', verifyTokenController)
authRouter.post('/logout', logoutController)
