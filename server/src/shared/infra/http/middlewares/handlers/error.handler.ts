import { logger } from '@configs/logger.config'
import { RequestError } from '@shared/errors/RequestError'

import { NextFunction, Request, Response } from 'express'

const isDevelopment = process.env.NODE_ENV === 'development'

export const errorHandler = async (e: Error, req: Request, res: Response, next: NextFunction): Promise<Response> => {
  logger.error(`Error on ${req.method} request to ${req.url}. Error: ${e.message}`)

  if (e instanceof RequestError) {
    return res.status(e.code).send({
      error: e.message,
      timestamp: new Date().toISOString(),
    })
  }

  isDevelopment
    ? logger.error(`Unexpected error on ${req.method} request to ${req.url}. Stack trace: ${e.stack}`)
    : undefined

  return res.status(500).send({
    error: 'Internal Server Error.',
    trace: isDevelopment ? e.stack : undefined,
    timestamp: new Date().toISOString(),
  })
}
