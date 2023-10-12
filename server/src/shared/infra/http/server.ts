import 'reflect-metadata'
import 'express-async-errors'
import '@shared/container'
import express from 'express'
import cors from 'cors'
import { router } from './middlewares/routes'
import cookieParser from 'cookie-parser'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { setupSocketHandlers } from '../../../handlers/socket.handler'
import { PORT, ALLOWED_ORIGIN } from '@configs/env.config'
import { authHandler, errorHandler } from './middlewares/handlers'
import { logger } from '@configs/logger.config'

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
