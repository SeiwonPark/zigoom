import type { Request, Response } from 'express'
import { container } from 'tsyringe'

import { logger } from '@configs/logger.config'
import { ErrorCode, RequestError } from '@shared/errors'

import GetSessionService from '../services/GetSessionService'
import CreateSessionService from '../services/JoinSessionService'
import UpdateSessionService from '../services/UpdateSessionService'

export default class SessionController {
  public async join(req: Request, res: Response): Promise<Response> {
    logger.debug('SessionController.join invoked')
    const { sessionId, title, isPrivate } = req.body

    const joinSession = container.resolve(CreateSessionService)
    const payload = req.ctx.user
    const joinedSession = await joinSession.execute({
      payload: payload,
      sessionId: sessionId,
      title: title,
      isPrivate: isPrivate,
    })

    return res.status(200).send({ ...joinedSession, isHost: (payload.sub || payload.id) === joinedSession.host })
  }

  public async get(req: Request, res: Response): Promise<Response> {
    logger.debug('SessionController.get invoked')
    const { sessionId } = req.query

    if (typeof sessionId !== 'string') {
      logger.error("Parameter type not matching for 'sessionId'")
      throw new RequestError("Parameter type not matching for 'sessionId'", ErrorCode.BadRequest)
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
    logger.debug('SessionController.update invoked')
    const { sessionId } = req.query
    const data = req.body

    if (typeof sessionId !== 'string') {
      logger.error("Parameter type not matching for 'sessionId'")
      throw new RequestError("Parameter type not matching for 'sessionId'", ErrorCode.BadRequest)
    }

    const updateSession = container.resolve(UpdateSessionService)
    const updatedSession = await updateSession.execute({ payload: req.ctx.user, sessionId, data })

    return res.status(200).send(updatedSession)
  }
}
