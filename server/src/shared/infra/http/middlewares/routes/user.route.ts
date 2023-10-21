import UserController from '@modules/users/controllers/UserController'

import { Router } from 'express'

import { requireAuthentication } from '../handlers'

const userController = new UserController()

export const userRouter = Router()

userRouter.post('/', requireAuthentication, userController.create)
userRouter.get('/', requireAuthentication, userController.get)
userRouter.patch('/', requireAuthentication, userController.update)
