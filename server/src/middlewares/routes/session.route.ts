import { Router } from 'express'
import SessionController from '../../modules/sessions/controllers/SessionController'

const sessionController = new SessionController()

export const sessionRouter = Router()

sessionRouter.post('/create', sessionController.create)
