import { forwardRef, useEffect, useRef } from 'react'

interface RemoteVideoProps {
  peerId: string
  stream: MediaStream
}

export const RemoteVideo = forwardRef<HTMLVideoElement, RemoteVideoProps>(({ peerId, stream }, forwardedRef) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (typeof forwardedRef === 'function') {
      forwardedRef(videoRef.current)
    } else if (forwardedRef) {
      forwardedRef.current = videoRef.current
    }
  }, [forwardedRef])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  return (
    <video
      ref={videoRef}
      key={peerId}
      id={`vid_${peerId}`}
      muted
      autoPlay
      playsInline
      style={{ backgroundColor: 'black', width: '100px', height: '100px' }}
    />
  )
})
