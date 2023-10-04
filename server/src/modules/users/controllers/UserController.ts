import type { Request, Response } from 'express'
import { container } from 'tsyringe'
import { CustomError, ErrorCode } from '@shared/errors'
import CreateUserService from '../services/CreateUserService'
import UpdateUserService from '../services/UpdateUserService'
import GetUserService from '../services/GetUserService'

export default class UserController {
  public async create(req: Request, res: Response): Promise<Response> {
    const createUser = container.resolve(CreateUserService)
    const createdUser = await createUser.execute({ payload: req.ctx.user })

    console.log('Created a new user: ', createdUser)
    return res.send(createUser)
  }

  public async get(req: Request, res: Response): Promise<Response> {
    const { include } = req.query

    if (include !== undefined && typeof include !== 'boolean') {
      throw new CustomError('Parameter type not matching', ErrorCode.BadRequest)
    }

    const getUser = container.resolve(GetUserService)
    const fetchedUser = await getUser.execute({ payload: req.ctx.user, include: include ?? false })

    console.log('Fetched a user: ', fetchedUser)
    return res.send(fetchedUser)
  }

  public async update(req: Request, res: Response): Promise<Response> {
    const { include } = req.query
    const data = req.body

    if (include !== undefined && typeof include !== 'boolean') {
      throw new CustomError('Parameter type not matching', ErrorCode.BadRequest)
    }

    const updateUser = container.resolve(UpdateUserService)
    const updatedUser = await updateUser.execute({ payload: req.ctx.user, include: include ?? false, data: data })

    console.log('Updated a user: ', updatedUser)
    return res.send(updateUser)
  }
}
