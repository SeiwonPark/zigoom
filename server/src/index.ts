import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import { SocketEvent } from './typings/types'

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
  const onJoin = (event: SocketEvent) => {
    const roomId = event.roomId
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
  }

  const onCall = (event: SocketEvent) => {
    socket.broadcast.to(event.roomId).emit('call', {
      senderId: event.senderId,
    })
  }

  const onPeerOffer = (event: SocketEvent) => {
    socket.broadcast.to(event.receiverId).emit('peer_offer', {
      type: event.type,
      sdp: event.sdp,
      senderId: event.senderId,
    })
  }

  const onPeerAnswer = (event: SocketEvent) => {
    socket.broadcast.to(event.receiverId).emit('peer_answer', {
      type: event.type,
      sdp: event.sdp,
      senderId: event.senderId,
    })
  }

  const onPeerIceCandidate = (event: SocketEvent) => {
    socket.broadcast.to(event.receiverId).emit('peer_ice_candidate', event)
  }

  const onDisconnect = () => {
    console.log(`Peer ${socket.id} has been disconnected`)
    socket.broadcast.emit('peer_disconnected', { peerId: socket.id })
  }

  const onSendChat = (event: SocketEvent) => {
    socket.to(event.roomId).emit('receive_chat', {
      senderId: event.senderId,
      message: event.message,
    })
  }

  socket.on('join', onJoin)
  socket.on('call', onCall)
  socket.on('peer_offer', onPeerOffer)
  socket.on('peer_answer', onPeerAnswer)
  socket.on('peer_ice_candidate', onPeerIceCandidate)
  socket.on('disconnect', onDisconnect)
  socket.on('send_chat', onSendChat)
})

server.listen(PORT, () => {
  console.log(`Server is listening on PORT ${PORT}...`)
})
