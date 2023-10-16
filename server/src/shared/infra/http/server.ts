import { ALLOWED_ORIGIN, PORT } from '@configs/env.config'
import { format, logger, stream } from '@configs/logger.config'
import '@shared/container'

import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import 'express-async-errors'
import helmet from 'helmet'
import { createServer } from 'http'
import morgan from 'morgan'
import { collectDefaultMetrics } from 'prom-client'
import { Server } from 'socket.io'

import { setupSocketHandlers } from '../../../handlers/socket.handler'
import { authHandler, errorHandler, limiter } from './middlewares/handlers'
import { router } from './middlewares/routes'
import { metricRouter } from './middlewares/routes/metric.route'

const app = express()

collectDefaultMetrics()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())
app.use(helmet())
app.use(morgan(format, { stream: stream }))
app.set('trust proxy', 1)
// FIXME: origin domain
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
// FIXME: host domain
app.use('/metrics', metricRouter)
app.use('/v1', limiter, router)
app.use(authHandler)
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
