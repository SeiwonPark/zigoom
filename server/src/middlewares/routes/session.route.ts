import { Router } from 'express'
import { createSessionController } from '../../controllers/session.controller'

export const sessionRouter = Router()

sessionRouter.post('/create', createSessionController)
