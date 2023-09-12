import express from 'express'
import { setupMiddlewares } from './middlewares'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { setupSocketHandlers } from './handlers/socket.handler'
import { PORT, ALLOWED_ORIGIN } from './configs/env.config'

const app = express()

setupMiddlewares(app)

const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGIN,
    methods: ['GET', 'POST'],
  },
})

setupSocketHandlers(io)

server.listen(PORT, () => {
  console.log(`Server is listening on PORT ${PORT}...`)
})
