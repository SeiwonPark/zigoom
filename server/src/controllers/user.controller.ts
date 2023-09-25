import { Request, Response } from 'express'
import { verifyTokenService } from '../services/auth.service'
import { createUserService, updateUserService } from '../services/user.service'

export const createUserController = async (req: Request, res: Response) => {
  try {
    if (!req.cookies || !req.cookies.jwt) {
      return res.sendStatus(401)
    }

    const payload = await verifyTokenService(req.cookies.jwt)

    if (!payload) {
      throw new Error('Failed to get payload from token')
    }

    const userId = payload.sub
    const createdUser = await createUserService(userId, payload)

    console.log('Created a new user: ', createdUser)
    res.sendStatus(200)
  } catch (e) {
    console.error('[createUserController] ERR: ', e)
    // FIXME: error code
    res.status(500).send('Internal Server Error')
  }
}

export const updateUserController = async (req: Request, res: Response) => {
  try {
    if (!req.cookies || !req.cookies.jwt) {
      return res.sendStatus(401)
    }

    if (!req.query || !req.query.id || !req.body) {
      return res.sendStatus(400)
    }

    const id = req.query.id as string
    const updatedUser = await updateUserService(id, req.body)

    console.log('Update a user: ', updatedUser)
    res.sendStatus(200)
  } catch (e) {
    console.error('[createUserController] ERR: ', e)
    // FIXME: error code
    res.status(500).send('Internal Server Error')
  }
}
