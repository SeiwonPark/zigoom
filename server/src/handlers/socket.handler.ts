import type { Server, Socket } from 'socket.io'
import {
  isJoinSchema,
  isCallSchema,
  isPeerOfferSchema,
  isPeerAnswerSchema,
  isPeerIceCandidateSchema,
  isSendChatSchema,
  isToggleVideoSchema,
} from '../validations/socket.validation'
import { CustomError, ErrorCode } from '@shared/errors'

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    const onJoin = (payload: any) => {
      if (!isJoinSchema(payload)) {
        throw new CustomError('Invalid payload type for JoinSchema.', ErrorCode.BadRequest)
      }

      const { roomId } = payload
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

    const onCall = (payload: any) => {
      if (!isCallSchema(payload)) {
        throw new CustomError('Invalid payload type for CallSchema.', ErrorCode.BadRequest)
      }

      socket.broadcast.to(payload.roomId).emit('call', {
        senderId: payload.senderId,
      })
    }

    const onPeerOffer = (payload: any) => {
      if (!isPeerOfferSchema(payload)) {
        throw new CustomError('Invalid payload type for PeerOfferSchema.', ErrorCode.BadRequest)
      }

      socket.broadcast.to(payload.receiverId).emit('peer_offer', {
        type: payload.type,
        sdp: payload.sdp,
        senderId: payload.senderId,
      })
    }

    const onPeerAnswer = (payload: any) => {
      if (!isPeerAnswerSchema(payload)) {
        throw new CustomError('Invalid payload type for PeerAnswerSchema.', ErrorCode.BadRequest)
      }

      socket.broadcast.to(payload.receiverId).emit('peer_answer', {
        type: payload.type,
        sdp: payload.sdp,
        senderId: payload.senderId,
      })
    }

    const onPeerIceCandidate = (payload: any) => {
      if (!isPeerIceCandidateSchema(payload)) {
        throw new CustomError('Invalid payload type for PeerIceCandidateSchema.', ErrorCode.BadRequest)
      }

      socket.broadcast.to(payload.receiverId).emit('peer_ice_candidate', payload)
    }

    const onSendChat = (payload: any) => {
      if (!isSendChatSchema(payload)) {
        throw new CustomError('Invalid payload type for SendChatSchema.', ErrorCode.BadRequest)
      }

      socket.to(payload.roomId).emit('receive_chat', {
        senderId: payload.senderId,
        message: payload.message,
      })
    }

    const onDisconnect = () => {
      console.log(`Peer ${socket.id} has been disconnected`)
      socket.broadcast.emit('peer_disconnected', { peerId: socket.id })
    }

    const onCancel = () => {
      console.log(`Peer ${socket.id} has cancelled the call`)
      socket.disconnect()
    }

    const onToggleVideo = (payload: any) => {
      if (!isToggleVideoSchema(payload)) {
        throw new CustomError('Invalid payload type for ToggleVideoSchema.', ErrorCode.BadRequest)
      }

      socket.to(payload.roomId).emit('videoStatus', {
        senderId: payload.senderId,
        video: payload.video,
      })
    }

    socket.on('join', onJoin)
    socket.on('call', onCall)
    socket.on('peer_offer', onPeerOffer)
    socket.on('peer_answer', onPeerAnswer)
    socket.on('peer_ice_candidate', onPeerIceCandidate)
    socket.on('send_chat', onSendChat)
    socket.on('disconnect', onDisconnect)
    socket.on('cancel', onCancel)
    socket.on('toggleVideo', onToggleVideo)
  })
}
