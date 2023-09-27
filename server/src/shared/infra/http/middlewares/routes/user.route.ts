import UserController from '@modules/users/controllers/UserController'
import { Router } from 'express'

const userController = new UserController()

export const userRouter = Router()

// FIXME: router path
userRouter.post('/create', userController.create)
userRouter.get('/get', userController.get)
userRouter.post('/update', userController.update)
