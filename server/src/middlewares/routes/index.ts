import { Router } from 'express'
import { authRouter } from './auth.route'

export const router = Router()

router.use('/auth', authRouter)
