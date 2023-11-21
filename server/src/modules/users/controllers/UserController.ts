import { logger } from '@configs/logger.config'
import { ErrorCode, RequestError } from '@shared/errors'

import type { Request, Response } from 'express'
import { container } from 'tsyringe'

import CreateUserService from '../services/CreateUserService'
import GetUserService from '../services/GetUserService'
import UpdateUserService from '../services/UpdateUserService'

export default class UserController {
  public async create(req: Request, res: Response): Promise<Response> {
    logger.debug('UserController.create invoked')
    const createUser = container.resolve(CreateUserService)
    const createdUser = await createUser.execute({ payload: req.ctx.user })

    logger.info(`New user '${createdUser.id}' has been created.`)
    return res.status(200).send(createdUser)
  }

  public async get(req: Request, res: Response): Promise<Response> {
    logger.debug('UserController.get invoked')
    const { include } = req.query

    if (include !== undefined && typeof include !== 'boolean') {
      logger.error("Parameter type not matching for 'include'")
      throw new RequestError("Parameter type not matching for 'include'", ErrorCode.BadRequest)
    }

    const getUser = container.resolve(GetUserService)
    const fetchedUser = await getUser.execute({ payload: req.ctx.user, include: include ?? false })

    logger.info(`Fetched a user '${fetchedUser?.id}'`)
    return res.status(200).send(fetchedUser)
  }

  public async update(req: Request, res: Response): Promise<Response> {
    logger.debug('UserController.update invoked')
    const { include } = req.query
    const data = req.body

    if (include !== undefined && typeof include !== 'boolean') {
      logger.error("Parameter type not matching for 'include'")
      throw new RequestError("Parameter type not matching for 'include'", ErrorCode.BadRequest)
    }

    const updateUser = container.resolve(UpdateUserService)
    const updatedUser = await updateUser.execute({ payload: req.ctx.user, include: include ?? false, data: data })

    logger.info(`User '${updatedUser.id}' has been updated.`)
    return res.status(200).send(updatedUser)
  }
}
