import { logger } from '@configs/logger.config'
import { RequestError } from '@shared/errors/RequestError'

import { NextFunction, Request, Response } from 'express'

export const errorHandler = async (e: Error, req: Request, res: Response, next: NextFunction): Promise<Response> => {
  logger.error(`Error on ${req.method} request to ${req.url}. Error: ${e.message}`)

  if (e instanceof RequestError) {
    return res.status(e.code).send({
      error: e.message,
      timestamp: new Date().toISOString(),
    })
  }

  logger.error(`Unexpected error on ${req.method} request to ${req.url}. Stack trace: ${e.stack}`)

  return res.status(500).send({
    error: 'Internal Server Error.',
    trace: process.env.NODE_ENV === 'production' ? undefined : e.stack,
    timestamp: new Date().toISOString(),
  })
}
