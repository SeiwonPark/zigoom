import express from 'express'
import cors from 'cors'

export const setupMiddlewares = (app: express.Express) => {
  app.use(express.urlencoded({ extended: true }))
  app.use(express.json())
  app.use(cors())
}
