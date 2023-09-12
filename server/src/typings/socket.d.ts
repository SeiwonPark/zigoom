import z from 'zod'
import { Socket } from 'socket.io'

declare module 'socket.io' {
  interface Socket {
    sessionId?: string
    userId?: string
  }
}

export type JoinSchema = z.infer<typeof joinPayload>

export type CallSchema = z.infer<typeof callPayload>

export type PeerOfferSchema = z.infer<typeof peerOfferPayload>

export type PeerAnswerSchema = z.infer<typeof peerAnswerPayload>

export type PeerIceCandidateSchema = z.infer<typeof peerIceCandidatePayload>

export type SendChatSchema = z.infer<typeof sendChatPayload>
