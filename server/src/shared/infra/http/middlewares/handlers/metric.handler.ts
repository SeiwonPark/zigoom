import { Request, Response } from 'express'
import { register } from 'prom-client'

export const metricHandler = async (req: Request, res: Response) => {
  res.set('Content-Type', register.contentType)
  res.end(await register.metrics())
}
