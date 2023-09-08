import { useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Chat } from '../components/Chat'
import { Video } from '../components/Video'

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>()
  const localPeerId = useRef<string>('')

  return (
    <div>
      <Video localPeerId={localPeerId.current} />
      <Chat roomId={roomId} localPeerId={localPeerId.current} />
    </div>
  )
}
