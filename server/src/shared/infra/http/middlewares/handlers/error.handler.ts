import { Request, Response, NextFunction } from 'express'
import { CustomError } from '@shared/errors/CustomError'

export const errorHandler = async (e: Error, req: Request, res: Response, next: NextFunction): Promise<Response> => {
  if (e instanceof CustomError) {
    return res.status(e.code).send({
      error: e.message,
    })
  }

  return res.status(500).send({
    error: 'Internal Server error.',
  })
}
