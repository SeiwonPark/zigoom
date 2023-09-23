import { css } from '@emotion/react'
import { useContext, useEffect, useRef, useState } from 'react'
import { SocketContext } from '../../contexts/SocketContext'
import PinIconDisabled from '../../assets/icons/pin_disabled.svg'
import PinIconEnabled from '../../assets/icons/pin_enabled.svg'
import MoreIcon from '../../assets/icons/more.svg'
import { SVGIcon } from '../buttons/SVGIcon'
import { isVideoStatusSchema } from '../../validations/socket.validation'
import { PeerInfo } from '../../typings/types'

interface VideoProps {
  stream: MediaStream
  peerId: string
  numOfparticipants: number
  remoteProfiles: Map<string, PeerInfo>
}

export const RemoteVideo = ({ stream, peerId, numOfparticipants, remoteProfiles }: VideoProps) => {
  const socket = useContext(SocketContext)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [pinned, setPinned] = useState<boolean>(false)
  const [videoActive, setVideoActive] = useState<boolean>(false)

  useEffect(() => {
    const remotePeerId = remoteProfiles.get(peerId)
    if (remotePeerId) {
      setVideoActive(remotePeerId.video)
    }
  }, [remoteProfiles, peerId])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream
    }

    socket.on('videoStatus', handleVideoStatus)

    return () => {
      socket.off('videoStatus', handleVideoStatus)
    }
  }, [])

  const handleVideoStatus = (event: any) => {
    if (!isVideoStatusSchema(event)) {
      throw Error('Invalid payload type for VideoStatusSchema.')
    }

    if (event.senderId === peerId) {
      if (videoRef.current) {
        toggleVideo()
      }

      setVideoActive(event.video)
    }
  }

  // FIXME: actually pin
  const togglePin = () => {
    setPinned(!pinned)
  }

  const toggleVideo = () => {
    if (stream && stream.getVideoTracks().length > 0) {
      const enabled = !stream.getVideoTracks()[0].enabled
      stream.getVideoTracks()[0].enabled = enabled
    }
  }

  const setVideoRef = (node: HTMLVideoElement) => {
    if (node) {
      node.srcObject = stream
      videoRef.current = node
    }
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

        &:hover #options {
          -webkit-transition: opacity 0.1s ease-in;
          -moz-transition: opacity 0.1s ease-in;
          -o-transition: opacity 0.1s ease-in;
          opacity: 1;
          transition-delay: 0.1s;
        }
      `}
    >
      {videoActive ? (
        <video
          ref={setVideoRef}
          muted={true}
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
              height: 20vh;
              border-radius: 20vh;
            `}
            src={remoteProfiles.get(peerId)?.img}
            alt={peerId}
          />
        </div>
      )}
      <div
        css={css`
          position: absolute;
          bottom: 0;
          left: 0;
          color: #fff;
          pointer-events: none;
          background-color: rgba(0, 0, 0, 0.3);
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
