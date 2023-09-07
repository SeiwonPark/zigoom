import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'

dotenv.config()

const PORT = process.env.PORT || 5001
const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())

const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGIN || 'http://127.0.0.1:5173',
    methods: ['GET', 'POST'],
  },
})

io.on('connection', (socket: Socket) => {
  socket.on('join', (payload) => {
    const roomId = payload.roomId
    const roomClients = io.sockets.adapter.rooms.get(roomId) || { size: 0 }
    const numOfClients = roomClients.size

    if (numOfClients == 0) {
      socket.join(roomId)
      socket.emit('room_created', {
        roomId: roomId,
        peerId: socket.id,
      })
    } else {
      socket.join(roomId)
      socket.emit('room_joined', {
        roomId: roomId,
        peerId: socket.id,
      })
    }
  })

  socket.on('call', (event) => {
    socket.broadcast.to(event.roomId).emit('call', {
      senderId: event.senderId,
    })
  })

  socket.on('peer_offer', (event) => {
    socket.broadcast.to(event.receiverId).emit('peer_offer', {
      sdp: event.sdp,
      senderId: event.senderId,
    })
  })

  socket.on('peer_answer', (event) => {
    socket.broadcast.to(event.receiverId).emit('peer_answer', {
      sdp: event.sdp,
      senderId: event.senderId,
    })
  })

  socket.on('peer_ice_candidate', (event) => {
    socket.broadcast.to(event.receiverId).emit('peer_ice_candidate', event)
  })

  socket.on('disconnect', () => {
    console.log(`Peer ${socket.id} has been disconnected`)
    socket.broadcast.emit('peer_disconnected', { peerId: socket.id })
  })
})

server.listen(PORT, () => {
  console.log(`Server is listening on PORT ${PORT}...`)
})
