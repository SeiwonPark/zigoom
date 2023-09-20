import { z } from 'zod'

/**
 * =========================================
 * objects
 * =========================================
 */
export const JoinPayload = z.object({
  roomId: z.string().uuid(),
})

export const CallPayload = z.object({
  roomId: z.string().uuid(),
  senderId: z.string(),
})

export const PeerOfferPayload = z.object({
  type: z.string(),
  sdp: z.string(),
  senderId: z.string(),
  receiverId: z.string(),
})

export const PeerAnswerPayload = z.object({
  type: z.string(),
  sdp: z.string(),
  senderId: z.string(),
  receiverId: z.string(),
})

export const PeerIceCandidatePayload = z.object({
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

export const SendChatPayload = z.object({
  roomId: z.string().uuid(),
  senderId: z.string(),
  message: z.string(),
})

/**
 * =========================================
 * types
 * =========================================
 */
export type JoinSchema = z.infer<typeof JoinPayload>

export type CallSchema = z.infer<typeof CallPayload>

export type PeerOfferSchema = z.infer<typeof PeerOfferPayload>

export type PeerAnswerSchema = z.infer<typeof PeerAnswerPayload>

export type PeerIceCandidateSchema = z.infer<typeof PeerIceCandidatePayload>

export type SendChatSchema = z.infer<typeof SendChatPayload>

/**
 * =========================================
 * validators
 * =========================================
 */
export const isJoinSchema = (obj: any): obj is JoinSchema => {
  return JoinPayload.safeParse(obj).success
}

export const isCallSchema = (obj: any): obj is CallSchema => {
  return CallPayload.safeParse(obj).success
}

export const isPeerOfferSchema = (obj: any): obj is PeerOfferSchema => {
  return PeerOfferPayload.safeParse(obj).success
}

export const isPeerAnswerSchema = (obj: any): obj is PeerAnswerSchema => {
  return PeerAnswerPayload.safeParse(obj).success
}

export const isPeerIceCandidateSchema = (obj: any): obj is PeerIceCandidateSchema => {
  return PeerIceCandidatePayload.safeParse(obj).success
}

export const isSendChatSchema = (obj: any): obj is SendChatSchema => {
  return SendChatPayload.safeParse(obj).success
}
