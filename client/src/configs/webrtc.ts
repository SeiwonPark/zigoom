export const mediaConstraints: MediaStreamConstraints = {
  audio: false,
  video: true,
}

export const iceServers: { [key: string]: RTCIceServer[] } = {
  // FIXME: ice servers
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }],
}

export const offerOptions: RTCOfferOptions = {
  offerToReceiveVideo: true,
  offerToReceiveAudio: true,
}
