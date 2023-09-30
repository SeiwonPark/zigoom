import { Request, Response } from 'express'
import { container } from 'tsyringe'
import { CustomError } from '@shared/errors/CustomError'
import CreateUserService from '../services/CreateUserService'
import UpdateUserService from '../services/UpdateUserService'
import GetUserService from '../services/GetUserService'

export default class UserController {
  public async create(req: Request, res: Response): Promise<Response> {
    const { jwt } = req.cookies

    const createUser = container.resolve(CreateUserService)
    const createdUser = await createUser.execute({ jwt })

    console.log('Created a new user: ', createdUser)
    return res.sendStatus(200)
  }

  public async get(req: Request, res: Response): Promise<Response> {
    const { jwt } = req.cookies
    const { googleId, profile } = req.query

    if (typeof googleId !== 'string' || typeof profile !== 'boolean') {
      throw new CustomError('Parameter type not matching', 400)
    }

    const getUser = container.resolve(GetUserService)
    const fetchedUser = await getUser.execute({ jwt, googleId, profile })

    console.log('Fetched a user: ', fetchedUser)
    return res.status(200).send(fetchedUser)
  }

  public async update(req: Request, res: Response): Promise<Response> {
    const { jwt } = req.cookies
    const { googleId } = req.query
    const data = req.body

    if (typeof googleId !== 'string') {
      throw new CustomError('Parameter type not matching', 400)
    }

    const updateUser = container.resolve(UpdateUserService)
    const updatedUser = await updateUser.execute({ jwt, googleId, data })

    console.log('Updated a user: ', updatedUser)
    return res.sendStatus(200)
  }
}
