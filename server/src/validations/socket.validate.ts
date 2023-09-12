import z from 'zod'

import {
  JoinSchema,
  CallSchema,
  PeerOfferSchema,
  PeerAnswerSchema,
  PeerIceCandidateSchema,
  SendChatSchema,
} from '../typings/socket'

export const joinPayload = z.object({
  roomId: z.string().uuid(),
})

export const callPayload = z.object({
  roomId: z.string().uuid(),
  senderId: z.string(),
})

export const peerOfferPayload = z.object({
  type: z.string(),
  sdp: z.string(),
  senderId: z.string(),
  receiverId: z.string(),
})

export const peerAnswerPayload = z.object({
  type: z.string(),
  sdp: z.string(),
  senderId: z.string(),
  receiverId: z.string(),
})

export const peerIceCandidatePayload = z.object({
  senderId: z.string(),
  receiverId: z.string(),
  roomId: z.string().uuid(),
  candidate: z.object({
    candidate: z.string(),
    sdpMid: z.string(),
    sdpMLineIndex: z.number(),
    usernameFragment: z.string(),
  }),
})

export const sendChatPayload = z.object({
  roomId: z.string().uuid(),
  senderId: z.string(),
  message: z.string(),
})

export const isJoinSchema = (obj: any): obj is JoinSchema => {
  return joinPayload.safeParse(obj).success
}

export const isCallSchema = (obj: any): obj is CallSchema => {
  return callPayload.safeParse(obj).success
}

export const isPeerOfferSchema = (obj: any): obj is PeerOfferSchema => {
  return peerOfferPayload.safeParse(obj).success
}

export const isPeerAnswerSchema = (obj: any): obj is PeerAnswerSchema => {
  return peerAnswerPayload.safeParse(obj).success
}

export const isPeerIceCandidateSchema = (obj: any): obj is PeerIceCandidateSchema => {
  return peerIceCandidatePayload.safeParse(obj).success
}

export const isSendChatSchema = (obj: any): obj is SendChatSchema => {
  return sendChatPayload.safeParse(obj).success
}
