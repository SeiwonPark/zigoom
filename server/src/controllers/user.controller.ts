import { verifyTokenService } from '../services/auth.service'
import { createUserService, getUserService, updateUserService } from '../services/user.service'
import { CustomRequest, CustomResponse } from '../interfaces/common.interface'

export const createUserController = async (req: CustomRequest, res: CustomResponse) => {
  try {
    if (!req.cookies || !req.cookies.jwt) {
      return res.sendStatus(401)
    }

    const payload = await verifyTokenService(req.cookies.jwt)

    if (!payload) {
      throw new Error('Failed to get payload from token')
    }

    const googleId = payload.sub
    const createdUser = await createUserService(googleId, payload)

    console.log('Created a new user: ', createdUser)
    res.sendStatus(200)
  } catch (e) {
    console.error('[createUserController] ERR: ', e)
    // FIXME: error code
    res.status(500).send('Internal Server Error')
  }
}

export const updateUserController = async (req: CustomRequest, res: CustomResponse) => {
  try {
    if (!req.cookies || !req.cookies.jwt) {
      return res.sendStatus(401)
    }

    if (!req.query || !req.query.googleId || !req.body) {
      return res.sendStatus(400)
    }

    const { googleId } = req.query
    const updatedUser = await updateUserService(googleId, req.body)

    console.log('Updated a user: ', updatedUser)
    res.sendStatus(200)
  } catch (e) {
    console.error('[createUserController] ERR: ', e)
    // FIXME: error code
    res.status(500).send('Internal Server Error')
  }
}

export const getUserController = async (req: CustomRequest, res: CustomResponse) => {
  try {
    if (!req.cookies || !req.cookies.jwt) {
      return res.sendStatus(401)
    }

    if (!req.query || !req.query.googleId) {
      return res.sendStatus(400)
    }

    const { googleId, profile } = req.query

    const fetchedUser = await getUserService(googleId)

    console.log('Fetched a user: ', fetchedUser)
    res.sendStatus(200)
  } catch (e) {
    console.error('[getUserController] ERR: ', e)
    // FIXME: error code
    res.status(500).send('Internal Server Error')
  }
}
