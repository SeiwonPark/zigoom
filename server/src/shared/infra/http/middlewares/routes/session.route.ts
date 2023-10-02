import SessionController from '@modules/sessions/controllers/SessionController'
import { Router } from 'express'

const sessionController = new SessionController()

export const sessionRouter = Router()

sessionRouter.post('/create', sessionController.create)
sessionRouter.get('/get', sessionController.get)
sessionRouter.put('/update', sessionController.update)
