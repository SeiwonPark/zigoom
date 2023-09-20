import express from 'express'
import cors from 'cors'
import { router } from './routes'
import cookieParser from 'cookie-parser'

export const setupExpress = (app: express.Express) => {
  app.use(express.urlencoded({ extended: true }))
  app.use(express.json())
  app.use(cookieParser())
  app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
  /**
   * This SHOULD be the last middleware to handle exceptions on requests.
   */
  app.use('/v1', router)
}
