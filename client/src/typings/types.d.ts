export type SocketType = Socket<DefaultEventsMap, DefaultEventsMap>

export type VideoElement = React.RefObject<HTMLVideoElement>

export type SVGProps = React.FC<React.SVGProps<SVGElement>>

export interface LocalOptions {
  isVideoOn: boolean
  isAudioOn: boolean
}

export interface PeerData {
  id: string
  img: string
}
