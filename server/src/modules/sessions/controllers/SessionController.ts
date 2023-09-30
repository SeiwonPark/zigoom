import { Request, Response } from 'express'
import { container } from 'tsyringe'
import CreateSessionService from '../services/CreateSessionService'
import GetSessionService from '../services/GetSessionService'
import { CustomError, ErrorCode } from '@shared/errors'

export default class SessionController {
  public async create(req: Request, res: Response): Promise<Response> {
    const { jwt } = req.cookies
    const { id, title, isPrivate } = req.body

    const createSession = container.resolve(CreateSessionService)
    const createdSession = await createSession.execute({ id, title, isPrivate, jwt })

    console.log('Created a new session: ', createdSession)
    return res.sendStatus(200)
  }

  public async get(req: Request, res: Response): Promise<Response> {
    const { jwt } = req.cookies
    const { sessionId } = req.query

    if (typeof sessionId !== 'string') {
      throw new CustomError('Parameter type not matching', ErrorCode.BadRequest)
    }

    const getSession = container.resolve(GetSessionService)
    const fetchedSession = await getSession.execute({ jwt, sessionId })

    console.log('Fetched a session: ', fetchedSession)
    return res.status(200).send(fetchedSession)
  }
}
