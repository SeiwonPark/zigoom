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
export type RoomCreatedPayloadSchema = z.infer<typeof RoomCreatedPayload>

export type RoomJoinedPayloadSchema = z.infer<typeof RoomJoinedPayload>

export type CallPayloadSchema = z.infer<typeof CallPayload>

export type PeerOfferPayloadSchema = z.infer<typeof PeerOfferPayload>

export type PeerAnswerPayloadSchema = z.infer<typeof PeerAnswerPayload>

export type PeerIceCandidatePayloadSchema = z.infer<typeof PeerIceCandidatePayload>

export type ReceiveChatPayloadSchema = z.infer<typeof ReceiveChatPayload>

export type VideoStatusPayloadSchema = z.infer<typeof VideoStatusPayload>

/**
 * =========================================
 * validators
 * =========================================
 */
export const isRoomCreatedPayloadSchema = (obj: any): obj is RoomCreatedPayloadSchema => {
  return RoomCreatedPayload.safeParse(obj).success
}

export const isRoomJoinedPayloadSchema = (obj: any): obj is RoomJoinedPayloadSchema => {
  return RoomJoinedPayload.safeParse(obj).success
}

export const isCallPayloadSchema = (obj: any): obj is CallPayloadSchema => {
  return CallPayload.safeParse(obj).success
}

export const isPeerOfferPayloadSchema = (obj: any): obj is PeerOfferPayloadSchema => {
  return PeerOfferPayload.safeParse(obj).success
}

export const isPeerAnswerPayloadSchema = (obj: any): obj is PeerAnswerPayloadSchema => {
  return PeerAnswerPayload.safeParse(obj).success
}

export const isPeerIceCandidatePayloadSchema = (obj: any): obj is PeerIceCandidatePayloadSchema => {
  return PeerIceCandidatePayload.safeParse(obj).success
}

export const isReceiveChatPayloadSchema = (obj: any): obj is ReceiveChatPayloadSchema => {
  return ReceiveChatPayload.safeParse(obj).success
}

export const isVideoStatusPayloadSchema = (obj: any): obj is VideoStatusPayloadSchema => {
  return VideoStatusPayload.safeParse(obj).success
}
