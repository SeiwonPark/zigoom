import { useEffect, useRef, useState } from 'react'

import { css } from '@emotion/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { MicIcon, MicOffIcon, VideoIcon, VideoOffIcon } from '@/assets/icons'
import { ControlButton, ElevatedButton } from '@/components/buttons'
import { LocalVideo } from '@/components/videos/LocalVideo'
import { defaultMediaConstraints } from '@/configs/webrtc'
import { useLocalOption } from '@/hooks/useStore'
import { verifySession } from '@/utils/check'

interface WaitingRoomProps {
  roomId?: string
}

export const WaitingRoom = ({ roomId }: WaitingRoomProps) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const localStreamRef = useRef<MediaStream>()
  const { isVideoOn, isAudioOn, setIsVideoOn, setIsAudioOn } = useLocalOption()
  const location = useLocation()
  const navigate = useNavigate()
  const params = new URLSearchParams(location.search)

  const initializeLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(defaultMediaConstraints)
      setLocalStream(stream)
      localStreamRef.current = stream
    } catch (error) {
      console.error('Could not get user media', error)
    }
  }

  useEffect(() => {
    const verifyAndNavigate = async () => {
      const isVerified = await verifySession({ params }, roomId)
      if (isVerified) {
        navigate(`/room/${roomId}`, { replace: true })
      }
    }

    verifyAndNavigate()
  }, [roomId])

  useEffect(() => {
    initializeLocalStream()
  }, [])

  const toggleVideo = () => {
    if (localStream && localStream.getVideoTracks().length > 0) {
      const enabled = !localStream.getVideoTracks()[0].enabled
      localStream.getVideoTracks()[0].enabled = enabled
      setIsVideoOn()
    }
  }

  const toggleMic = () => {
    if (localStream && localStream.getAudioTracks().length > 0) {
      const enabled = !localStream.getAudioTracks()[0].enabled
      localStream.getAudioTracks()[0].enabled = enabled
      setIsAudioOn()
    }
  }

  return (
    <div
      css={css`
        height: inherit;
        width: 100%;
        display: flex;
        min-width: 0;
      `}
    >
      <div
        css={css`
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;

          @media screen and (max-width: 1000px) {
            padding-top: 100px;
            display: grid;
            grid-template: minmax(0, 1fr);
          }
        `}
      >
        <div
          css={css`
            display: flex;
            align-items: center;
            justify-content: center;
          `}
        >
          <div
            css={css`
              width: 90vw;
              max-width: 600px;
              min-width: 400px;
              height: 400px;
              position: relative;
            `}
          >
            <LocalVideo
              stream={localStream}
              peerId="You"
              peerIdPosition="top-left"
              numOfparticipants={1}
              showHover={false}
            />
            <div
              css={css`
                display: flex;
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
              `}
            >
              <ControlButton Icon={isVideoOn ? VideoIcon : VideoOffIcon} onClick={toggleVideo} enabled={isVideoOn} />
              <ControlButton Icon={isAudioOn ? MicIcon : MicOffIcon} onClick={toggleMic} enabled={isAudioOn} />
            </div>
          </div>
        </div>
        <div
          css={css`
            width: 600px;
            height: 400px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
          `}
        >
          <span
            css={css`
              font-size: 32px;
            `}
          >
            Ready to join?
          </span>
          <span>No one else is here.</span>
          <ElevatedButton text="Join now" onClick={() => {}} />
        </div>
      </div>
    </div>
  )
}
