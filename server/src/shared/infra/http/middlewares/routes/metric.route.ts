import { Router } from 'express'

import { metricHandler } from '../handlers'

export const metricRouter = Router()

metricRouter.get('/', metricHandler)
