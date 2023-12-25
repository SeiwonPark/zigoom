import { TURN_SECRET_KEY } from '@configs/env.config'
import { logger } from '@configs/logger.config'
import { createTURNCredentials } from '@utils/math'

import type { Server, Socket } from 'socket.io'

import {
  isCallSchema,
  isJoinSchema,
  isPeerAnswerSchema,
  isPeerIceCandidateSchema,
  isPeerOfferSchema,
  isSendChatSchema,
  isToggleAudioSchema,
  isToggleVideoSchema,
} from '../validations/socket.validation'

/**
 * Configures signaling server with all the necessary event listeners for peer-to-peer connection.
 * This handles following events:
 *
 * - **Events**
 *   - `join` - joins or creates a room
 *   - `call` - emits `call` event to all peers in the room
 *   - `peer_offer` - triggers peer connection
 *   - `peer_answer` - accepts peer connection
 *   - `peer_ice_candidate` - adds ice candidates so to relay connection
 *   - `send_chat` - sends chat message to the room
 *   - `disconnect` - disconnects peer connection from the room
 *   - `cancel` - disconnects socket client
 *   - `toggle_video` - sends video component toggle status
 *   - `toggle_audio` - sends audio component toggle status
 *
 * @param {Server} io - Socket.io Server
 */
export const setupSocketHandlers = (io: Server) => {
  const { username, password } = createTURNCredentials(TURN_SECRET_KEY)

  io.on('connection', (socket: Socket) => {
    const onJoin = (payload: any) => {
      if (!isJoinSchema(payload)) {
        logger.error('Invalid payload type for JoinSchema.')
        socket.emit('error', 'Invalid payload type for JoinSchema.')
        return
      }

      const { roomId } = payload
      const roomClients = io.sockets.adapter.rooms.get(roomId) || { size: 0 }
      const numOfClients = roomClients.size

      if (numOfClients) {
        socket.join(roomId)
        socket.emit('room_joined', {
          roomId: roomId,
          peerId: socket.id,
        })
      } else {
        socket.join(roomId)
        socket.emit('room_created', {
          roomId: roomId,
          peerId: socket.id,
        })
      }
    }

    const onCall = (payload: any) => {
      if (!isCallSchema(payload)) {
        logger.error('Invalid payload type for CallSchema.')
        socket.emit('error', 'Invalid payload type for CallSchema.')
        return
      }

      socket.broadcast.to(payload.roomId).emit('call', {
        senderId: payload.senderId,
        username: username,
        credential: password,
      })
    }

    const onPeerOffer = (payload: any) => {
      if (!isPeerOfferSchema(payload)) {
        logger.error('Invalid payload type for PeerOfferSchema.')
        socket.emit('error', 'Invalid payload type for PeerOfferSchema.')
        return
      }

      socket.broadcast.to(payload.receiverId).emit('peer_offer', {
        type: payload.type,
        sdp: payload.sdp,
        senderId: payload.senderId,
        username: username,
        credential: password,
      })
    }

    const onPeerAnswer = (payload: any) => {
      if (!isPeerAnswerSchema(payload)) {
        logger.error('Invalid payload type for PeerAnswerSchema.')
        socket.emit('error', 'Invalid payload type for PeerAnswerSchema.')
        return
      }

      socket.broadcast.to(payload.receiverId).emit('peer_answer', {
        type: payload.type,
        sdp: payload.sdp,
        senderId: payload.senderId,
      })
    }

    const onPeerIceCandidate = (payload: any) => {
      if (!isPeerIceCandidateSchema(payload)) {
        logger.error('Invalid payload type for PeerIceCandidateSchema.')
        socket.emit('error', 'Invalid payload type for PeerIceCandidateSchema.')
        return
      }

      socket.broadcast.to(payload.receiverId).emit('peer_ice_candidate', payload)
    }

    const onSendChat = (payload: any) => {
      if (!isSendChatSchema(payload)) {
        logger.error('Invalid payload type for SendChatSchema.')
        socket.emit('error', 'Invalid payload type for SendChatSchema.')
        return
      }

      socket.to(payload.roomId).emit('receive_chat', {
        senderId: payload.senderId,
        message: payload.message,
      })
    }

    const onDisconnect = () => {
      logger.info(`Peer ${socket.id} has been disconnected`)
      socket.broadcast.emit('peer_disconnected', { peerId: socket.id })
    }

    const onCancel = () => {
      logger.info(`Peer ${socket.id} has cancelled the call`)
      socket.disconnect()
    }

    const onToggleVideo = (payload: any) => {
      if (!isToggleVideoSchema(payload)) {
        logger.error('Invalid payload type for ToggleVideoSchema.')
        socket.emit('error', 'Invalid payload type for ToggleVideoSchema.')
        return
      }

      socket.to(payload.roomId).emit('video_status', {
        senderId: payload.senderId,
        video: payload.video,
      })
    }

    const onToggleAudio = (payload: any) => {
      if (!isToggleAudioSchema(payload)) {
        logger.error('Invalid payload type for ToggleAudioSchema.')
        socket.emit('error', 'Invalid payload type for ToggleAudioSchema.')
        return
      }

      socket.to(payload.roomId).emit('audio_status', {
        senderId: payload.senderId,
        audio: payload.audio,
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
    socket.on('toggle_video', onToggleVideo)
    socket.on('toggle_audio', onToggleAudio)
  })
}
