import { NextFunction, Request, Response } from 'express'
import { Options, rateLimit } from 'express-rate-limit'

import { logger } from '@configs/logger.config'

// FIXME: cluster
export const limiter = rateLimit({
  windowMs: 6000, // 1 minute
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator(req: Request, res: Response): string {
    return (
      req.headers['cf-connecting-ip']?.toString().split(',').shift()?.trim() ||
      req.headers['x-forwarded-for']?.toString().split(',').shift()?.trim() ||
      req.socket.remoteAddress ||
      req.ip
    )
  },
  handler: (req: Request, res: Response, next: NextFunction, options: Options): Response => {
    logger.warn(`Too many requests`)
    return res.status(options.statusCode).send({ message: options.message })
  },
})
