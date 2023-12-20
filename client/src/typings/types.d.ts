export type SocketType = Socket<DefaultEventsMap, DefaultEventsMap>

export type VideoElement = React.RefObject<HTMLVideoElement>

export type SVGProps = React.FC<React.SVGProps<SVGElement>>

export type MediaTypes = 'audioinput' | 'audiooutput' | 'video'

export interface LocalOptions {
  isVideoOn: boolean
  isAudioOn: boolean
  pinnedPeerId: string
  isChatOpen: boolean
}

export interface PeerData {
  id: string
  img: string
  video: boolean
  audio: boolean
}

export interface PeerInfo {
  img: string
  video: boolean
  audio: boolean
}

declare global {
  interface Window {
    google: any
  }
}
