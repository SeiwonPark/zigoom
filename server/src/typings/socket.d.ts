import { z } from 'zod'

export type JoinSchema = z.infer<typeof joinPayload>

export type CallSchema = z.infer<typeof callPayload>

export type PeerOfferSchema = z.infer<typeof peerOfferPayload>

export type PeerAnswerSchema = z.infer<typeof peerAnswerPayload>

export type PeerIceCandidateSchema = z.infer<typeof peerIceCandidatePayload>

export type SendChatSchema = z.infer<typeof sendChatPayload>
