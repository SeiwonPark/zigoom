import { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { css } from '@emotion/react'
import { ControlButton } from './buttons/ControlButton'
import VideoIcon from '../assets/icons/video.svg'
import VideoOffIcon from '../assets/icons/video_off.svg'
import MicIcon from '../assets/icons/mic.svg'
import MicOffIcon from '../assets/icons/mic_off.svg'
import ChatIconEnabled from '../assets/icons/chat_enabled.svg'
import ChatIconDisabled from '../assets/icons/chat_disabled.svg'
import CallEndIcon from '../assets/icons/call_end.svg'
import { HostOptionButton } from './buttons/HostOptionButton'
import { SocketContext } from '../contexts/SocketContext'
import { useLocalOption } from '../hooks/useStore'

interface ControlBarProps {
  roomId?: string
  isChatOpen: boolean
  localStream: MediaStream | null
  toggleChat: () => void
}

export const ControlBar = ({ roomId, isChatOpen, localStream, toggleChat }: ControlBarProps) => {
  const socket = useContext(SocketContext)
  const navigate = useNavigate()
  const { isVideoOn, isAudioOn, setIsVideoOn, setIsAudioOn } = useLocalOption()

  useEffect(() => {
    socket.on('disconnect', async (reason: string) => {
      if (reason === 'io server disconnect') {
        navigate('/')
      }
    })
  }, [localStream, isVideoOn, isAudioOn])

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

  const handleCancelCall = () => {
    socket.emit('cancel')
  }

  return (
    <div
      css={css`
        position: absolute;
        bottom: 0;
        display: flex;
        width: 100vw;
        height: 5rem;
        background-color: rgb(32, 33, 36);
        margin-bottom: 0;
      `}
    >
      <div
        css={css`
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        `}
      >
        <span
          css={css`
            color: #fff;
            padding-left: 1rem;
          `}
        >
          {roomId}
        </span>
        <div
          css={css`
            display: flex;
          `}
        >
          <ControlButton Icon={isVideoOn ? VideoIcon : VideoOffIcon} onClick={toggleVideo} enabled={isVideoOn} />
          <ControlButton Icon={isAudioOn ? MicIcon : MicOffIcon} onClick={toggleMic} enabled={isAudioOn} />
          <ControlButton Icon={CallEndIcon} onClick={handleCancelCall} enabled={false} />
        </div>
        <div
          css={css`
            display: flex;
            padding-right: 1rem;
          `}
        >
          <HostOptionButton
            Icon={isChatOpen ? ChatIconEnabled : ChatIconDisabled}
            fill={isChatOpen ? '#8ab4f8' : '#fff'}
            onClick={toggleChat}
          />
        </div>
      </div>
    </div>
  )
}
