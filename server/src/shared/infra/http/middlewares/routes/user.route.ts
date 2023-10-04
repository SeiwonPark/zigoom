import UserController from '@modules/users/controllers/UserController'
import { Router } from 'express'
import { requireAuthentication } from '../handlers'

const userController = new UserController()

export const userRouter = Router()

// FIXME: router path
userRouter.post('/create', requireAuthentication, userController.create)
userRouter.get('/get', requireAuthentication, userController.get)
userRouter.put('/update', requireAuthentication, userController.update)
