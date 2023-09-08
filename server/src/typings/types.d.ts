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
