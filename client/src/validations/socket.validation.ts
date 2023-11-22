import { z } from 'zod'

/**
 * =========================================
 * objects
 * =========================================
 */
export const RoomCreatedPayload = z.object({
  roomId: z.string().uuid(),
  peerId: z.string(),
})

export const RoomJoinedPayload = z.object({
  roomId: z.string().uuid(),
  peerId: z.string(),
})

export const CallPayload = z.object({
  senderId: z.string(),
})

export const PeerOfferPayload = z.object({
  type: z.union([z.literal('answer'), z.literal('offer'), z.literal('pranswer'), z.literal('rollback')]),
  sdp: z.string(),
  senderId: z.string(),
})

export const PeerAnswerPayload = z.object({
  type: z.union([z.literal('answer'), z.literal('offer'), z.literal('pranswer'), z.literal('rollback')]),
  sdp: z.string(),
  senderId: z.string(),
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

export const ReceiveChatPayload = z.object({
  senderId: z.string(),
  message: z.string(),
})

export const VideoStatusPayload = z.object({
  senderId: z.string(),
  video: z.boolean(),
})

/**
 * =========================================
 * types
 * =========================================
 */
export type RoomCreatedSchema = z.infer<typeof RoomCreatedPayload>

export type RoomJoinedSchema = z.infer<typeof RoomJoinedPayload>

export type CallSchema = z.infer<typeof CallPayload>

export type PeerOfferSchema = z.infer<typeof PeerOfferPayload>

export type PeerAnswerSchema = z.infer<typeof PeerAnswerPayload>

export type PeerIceCandidateSchema = z.infer<typeof PeerIceCandidatePayload>

export type ReceiveChatSchema = z.infer<typeof ReceiveChatPayload>

export type VideoStatusSchema = z.infer<typeof VideoStatusPayload>

/**
 * =========================================
 * validators
 * =========================================
 */
export const isRoomCreatedSchema = (obj: any): obj is RoomCreatedSchema => {
  return RoomCreatedPayload.safeParse(obj).success
}

export const isRoomJoinedSchema = (obj: any): obj is RoomJoinedSchema => {
  return RoomJoinedPayload.safeParse(obj).success
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

export const isReceiveChatSchema = (obj: any): obj is ReceiveChatSchema => {
  return ReceiveChatPayload.safeParse(obj).success
}

export const isVideoStatusSchema = (obj: any): obj is VideoStatusSchema => {
  return VideoStatusPayload.safeParse(obj).success
}
