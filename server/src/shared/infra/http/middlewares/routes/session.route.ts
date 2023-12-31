import { Router } from 'express'

import SessionController from '@modules/sessions/controllers/SessionController'

const sessionController = new SessionController()

export const sessionRouter = Router()

sessionRouter.post('/', sessionController.join)
sessionRouter.get('/', sessionController.get)
sessionRouter.patch('/', sessionController.update)
