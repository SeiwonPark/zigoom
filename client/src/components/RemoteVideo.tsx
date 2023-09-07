import { useEffect, useRef } from 'react'

interface RemoteVideoProps {
  peerId: string
  stream: MediaStream
}

export const RemoteVideo = ({ peerId, stream }: RemoteVideoProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  return (
    <video
      ref={videoRef}
      key={peerId}
      width="100"
      height="100"
      id={`remotevideo_${peerId}`}
      muted
      autoPlay
      playsInline
      style={{ backgroundColor: 'black', width: '100px', height: '100px' }}
    />
  )
}
