import SessionController from '@modules/sessions/controllers/SessionController'

import { Router } from 'express'

const sessionController = new SessionController()

export const sessionRouter = Router()

sessionRouter.post('/', sessionController.join)
sessionRouter.get('/', sessionController.get)
sessionRouter.patch('/', sessionController.update)
