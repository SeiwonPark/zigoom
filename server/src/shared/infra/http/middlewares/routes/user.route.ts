import { Router } from 'express'

import UserController from '@modules/users/controllers/UserController'

// import { requireAuthentication } from '../handlers'

const userController = new UserController()

export const userRouter = Router()

// FIXME: 
// userRouter.post('/', requireAuthentication, userController.create)
// userRouter.get('/', requireAuthentication, userController.get)
// userRouter.patch('/', requireAuthentication, userController.update)

userRouter.post('/', userController.create)
userRouter.get('/', userController.get)
userRouter.patch('/', userController.update)
