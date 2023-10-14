import { logger } from '@configs/logger.config'
import { CustomError, ErrorCode } from '@shared/errors'

import type { Request, Response } from 'express'
import { container } from 'tsyringe'

import GetSessionService from '../services/GetSessionService'
import CreateSessionService from '../services/JoinSessionService'
import UpdateSessionService from '../services/UpdateSessionService'

export default class SessionController {
  public async create(req: Request, res: Response): Promise<Response> {
    const { sessionId, title, isPrivate } = req.body

    const joinSession = container.resolve(CreateSessionService)
    const joinedSession = await joinSession.execute({
      payload: req.ctx.user,
      sessionId: sessionId,
      title: title,
      isPrivate: isPrivate,
    })

    return res.status(200).send(joinedSession)
  }

  public async get(req: Request, res: Response): Promise<Response> {
    const { sessionId } = req.query

    if (typeof sessionId !== 'string') {
      logger.error("Parameter type not matching for 'sessionId'")
      throw new CustomError("Parameter type not matching for 'sessionId'", ErrorCode.BadRequest)
    }

    const getSession = container.resolve(GetSessionService)
    const fetchedSession = await getSession.execute({ payload: req.ctx.user, sessionId })

    logger.info(
      `${req.ctx.user.id ? `guest '${req.ctx.user.id}'` : `user '${req.ctx.user.sub}'`} fetched a session '${
        fetchedSession?.id
      }'`
    )
    return res.status(200).send(fetchedSession)
  }

  public async update(req: Request, res: Response): Promise<Response> {
    const { sessionId } = req.query
    const data = req.body

    if (typeof sessionId !== 'string') {
      logger.error("Parameter type not matching for 'sessionId'")
      throw new CustomError("Parameter type not matching for 'sessionId'", ErrorCode.BadRequest)
    }

    const updateSession = container.resolve(UpdateSessionService)
    const updatedSession = await updateSession.execute({ payload: req.ctx.user, sessionId, data })

    return res.status(200).send(updatedSession)
  }
}
