export type SocketType = Socket<DefaultEventsMap, DefaultEventsMap>

export type VideoElement = React.RefObject<HTMLVideoElement>

export interface Message {
  senderId: string
  message: string
}

export interface SocketEvent extends RTCTrackEvent {
  peerId: string
  roomId: string
  senderId: string
  receiverId: string
  message: string
  streams: MediaStream[]
  type: RTCSdpType
  sdp: string
  candidate: RTCIceCandidate
}