import { Request, Response } from 'express'
import { container } from 'tsyringe'
import CreateSessionService from '../services/CreateSessionService'

export default class SessionController {
  public async create(req: Request, res: Response): Promise<Response> {
    const { jwt } = req.cookies
    const { id, title } = req.body

    const createSession = container.resolve(CreateSessionService)
    const createdSession = await createSession.execute({ id, title, jwt })

    console.log('Created a new session: ', createdSession)
    return res.sendStatus(200)
  }
}
