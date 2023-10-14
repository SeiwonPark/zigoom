import { ALLOWED_ORIGIN, PORT } from '@configs/env.config'
import { logger } from '@configs/logger.config'
import '@shared/container'

import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import 'express-async-errors'
import { createServer } from 'http'
import 'reflect-metadata'
import { Server } from 'socket.io'

import { setupSocketHandlers } from '../../../handlers/socket.handler'
import { authHandler, errorHandler } from './middlewares/handlers'
import { router } from './middlewares/routes'

const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())
// FIXME: origin domain
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(authHandler)
app.use('/v1', router)
app.use(errorHandler)

const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGIN,
    methods: ['GET', 'POST', 'PATCH'],
  },
})

setupSocketHandlers(io)

server.listen(PORT, () => {
  logger.info(`Server is listening on PORT ${PORT}...`)
})
