import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Chat } from '../components/Chat'
import { Video } from '../components/Video'

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>()
  const [localPeerId, setLocalPeerId] = useState<string>('')

  useEffect(() => {}, [localPeerId])

  return (
    <div>
      <Video roomId={roomId} localPeerId={localPeerId} setLocalPeerId={setLocalPeerId} />
      <Chat roomId={roomId} localPeerId={localPeerId} />
    </div>
  )
}
