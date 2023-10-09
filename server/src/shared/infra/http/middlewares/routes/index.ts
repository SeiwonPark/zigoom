import { Router } from 'express'
import { authRouter } from './auth.route'
import { userRouter } from './user.route'
import { sessionRouter } from './session.route'

export const router = Router()

router.use('/auth', authRouter)
router.use('/user', userRouter)
router.use('/session', sessionRouter)
