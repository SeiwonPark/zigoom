import { css } from '@emotion/react'
import { useEffect, useRef } from 'react'

interface VideoProps {
  stream: MediaStream | null
  peerId: string
  numOfparticipants: number
  muted?: boolean
}

export const Video = ({ stream, peerId, numOfparticipants, muted = true }: VideoProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  return (
    <div
      css={css`
        position: relative;
        display: flex;
        width: 100%;
        height: 100%;
        align-items: center;
        justify-content: center;
        background-color: ${numOfparticipants === 1 ? 'black' : 'rgb(32, 33, 36)'};
      `}
    >
      <video
        ref={videoRef}
        muted={muted}
        autoPlay
        playsInline
        css={css`
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 8px;
          object-fit: ${numOfparticipants === 1 ? 'contain' : 'cover'};
        `}
      />
      <div
        css={css`
          position: absolute;
          bottom: 0;
          left: 0;
          color: #fff;
          pointer-events: none;
          background-color: rgba(0, 0, 0, 0.65);
          font-size: 14px;
          border-radius: 0px 8px;
          padding: 2px 12px;
        `}
      >
        {peerId}
      </div>
    </div>
  )
}
