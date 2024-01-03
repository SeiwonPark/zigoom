import { NextFunction, Request, Response } from 'express'

import { PRODUCTION } from '@configs/env.config'
import { logger } from '@configs/logger.config'
import { RequestError } from '@shared/errors/RequestError'

export const errorHandler = async (e: Error, req: Request, res: Response, next: NextFunction): Promise<Response> => {
  logger.error(`Error on ${req.method} request to ${req.url}. Error: ${e.message}`)

  if (e instanceof RequestError) {
    return res.status(e.code).send({
      error: e.message,
      timestamp: new Date().toISOString(),
    })
  }

  PRODUCTION
    ? undefined
    : logger.error(`Unexpected error on ${req.method} request to ${req.url}. Stack trace: ${e.stack}`)

  return res.status(500).send({
    error: 'Internal Server Error.',
    trace: PRODUCTION ? undefined : e.stack,
    timestamp: new Date().toISOString(),
  })
}
