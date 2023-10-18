import { useEffect, useRef, useState } from 'react'

import { css } from '@emotion/react'

import { MoreIcon, PinIconDisabled, PinIconEnabled } from '@/assets/icons'
import { Unnamed } from '@/assets/images'
import { SVGIcon } from '@/components/buttons'
import { useLocalOption } from '@/hooks/useStore'
import { getLocalStorageItem } from '@/utils/localStorage'
import { GoogleJWTPayload } from '@/validations/auth.validation'

type PeerIdPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'

interface VideoProps {
  stream: MediaStream | null
  peerId: string
  peerIdPosition: PeerIdPosition
  numOfparticipants: number
  showHover?: boolean
  muted?: boolean
}

export const LocalVideo = ({
  stream,
  peerId,
  peerIdPosition,
  numOfparticipants,
  showHover,
  muted = true,
}: VideoProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [pinned, setPinned] = useState<boolean>(false)
  const { isVideoOn, isAudioOn } = useLocalOption()

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream
    }

    if (stream && stream.getVideoTracks().length > 0) {
      stream.getVideoTracks()[0].enabled = isVideoOn
    }
  }, [stream, isVideoOn, isAudioOn])

  // FIXME: actually pin
  const togglePin = () => {
    setPinned(!pinned)
  }

  const setIdPosition = () => {
    switch (peerIdPosition) {
      case 'top-left':
        return { top: 0, left: 0 }
      case 'top-right':
        return { top: 0, right: 0 }
      case 'bottom-left':
        return { bottom: 0, left: 0 }
      case 'bottom-right':
        return { bottom: 0, right: 0 }
      case 'center':
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
      default:
        throw new Error('Invalid position')
    }
  }

  const getProfileImageFromLocalStorage = () => {
    return getLocalStorageItem<GoogleJWTPayload>('user')?.picture.replace('=s96-c', '=l96-c')
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
        background-color: ${numOfparticipants === 1 ? 'black' : 'rgb(60, 64, 67)'};
        border-radius: 8px;

        ${showHover ??
        `
        &:hover #options {
          -webkit-transition: opacity 0.1s ease-in;
          -moz-transition: opacity 0.1s ease-in;
          -o-transition: opacity 0.1s ease-in;
          opacity: 1;
          transition-delay: 0.1s;
        }
        `}
      `}
    >
      {isVideoOn ? (
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
      ) : (
        <div>
          <img
            css={css`
              width: 20vh;
              min-width: 60px;
              height: 20vh;
              border-radius: 20vh;
            `}
            // FIXME: hope there's a better idea
            src={getProfileImageFromLocalStorage() || Unnamed}
            alt="Unnamed"
          />
        </div>
      )}
      <div
        css={css`
          position: absolute;
          border-radius: 8px;
          color: #fff;
          pointer-events: none;
          background-color: rgba(0, 0, 0, 0.3);
          font-size: 14px;
          padding: 4px 12px;
        `}
        style={{ ...setIdPosition() }}
      >
        {peerId}
      </div>
      <div
        id="options"
        css={css`
          position: absolute;
          width: 100%;
          height: 100%;
          display: ${showHover ? 'flex' : 'none'};
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
            cursor: pointer;

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
          >
            <SVGIcon Icon={MoreIcon} width={30} height={24} />
          </div>
        </div>
      </div>
    </div>
  )
}
