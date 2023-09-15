import { css } from '@emotion/react'
import { useEffect, useRef, useState } from 'react'
import PinIconDisabled from '../assets/icons/pin_disabled.svg'
import PinIconEnabled from '../assets/icons/pin_enabled.svg'
import { SVGIcon } from './SVGIcon'

interface VideoProps {
  stream: MediaStream | null
  peerId: string
  numOfparticipants: number
  muted?: boolean
}

export const Video = ({ stream, peerId, numOfparticipants, muted = true }: VideoProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [pinned, setPinned] = useState<boolean>(false)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  // FIXME: actually pin
  const togglePin = () => {
    setPinned(!pinned)
  }

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

        &:hover #options {
          -webkit-transition: opacity 0.1s ease-in;
          -moz-transition: opacity 0.1s ease-in;
          -o-transition: opacity 0.1s ease-in;
          opacity: 1;
          transition-delay: 0.1s;
        }
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
          background-color: rgba(0, 0, 0, 0.5);
          font-size: 14px;
          border-radius: 0px 8px;
          padding: 2px 12px;
        `}
      >
        {peerId}
      </div>
      <div
        id="options"
        css={css`
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          opacity: 0;
          justify-content: center;
          align-items: center;
        `}
      >
        <div
          css={css`
            display: flex;
            border-radius: 30px;
            background-color: rgba(0, 0, 0, 0.33);

            &:hover {
              -webkit-transition: background-color 0.1s ease-in;
              -moz-transition: background-color 0.1s ease-in;
              -o-transition: background-color 0.1s ease-in;
              background-color: rgba(0, 0, 0, 0.6);
            }

            &:hover #icon {
              opacity: 1;
            }
          `}
        >
          <div
            id="icon"
            css={css`
              padding: 0.5rem;
              border-radius: 30px;
              align-items: center;
              opacity: 0.5;

              &:hover {
                background-color: rgb(255, 255, 255, 0.1);
              }
            `}
            onClick={togglePin}
          >
            <SVGIcon Icon={pinned ? PinIconEnabled : PinIconDisabled} width={30} height={24} />
          </div>
        </div>
      </div>
    </div>
  )
}
