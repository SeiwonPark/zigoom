import { Router } from 'express'
import { createUserController, updateUserController } from '../../controllers/user.controller'

export const userRouter = Router()

userRouter.post('/create', createUserController)
userRouter.post('/update', updateUserController)
