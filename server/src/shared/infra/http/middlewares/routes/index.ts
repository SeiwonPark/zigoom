import { Router } from 'express'

import { authRouter } from './auth.route'
import { sessionRouter } from './session.route'
import { userRouter } from './user.route'

export const router = Router()

router.use('/auth', authRouter)
router.use('/user', userRouter)
router.use('/session', sessionRouter)
