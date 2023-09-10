import { useState } from 'react'
import { css } from '@emotion/react'
import { ControlButton } from './ControlButton'
import VideoIcon from '../assets/icons/video.svg'
import VideoOffIcon from '../assets/icons/video_off.svg'
import MicIcon from '../assets/icons/mic.svg'
import MicOffIcon from '../assets/icons/mic_off.svg'
import ChatIconEnabled from '../assets/icons/chat_enabled.svg'
import ChatIconDisabled from '../assets/icons/chat_disabled.svg'
import { HostOptionButton } from './HostOptionButton'

interface ControlBarProps {
  roomId?: string
  isChatOpen: boolean
  localStream: MediaStream | null
  toggleChat: () => void
}

export const ControlBar = ({ roomId, isChatOpen, localStream, toggleChat }: ControlBarProps) => {
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [micEnabled, setMicEnabled] = useState(false)

  const toggleVideo = () => {
    if (localStream && localStream.getVideoTracks().length > 0) {
      const enabled = !localStream.getVideoTracks()[0].enabled
      localStream.getVideoTracks()[0].enabled = enabled
      setVideoEnabled(enabled)
    }
  }

  const toggleMic = () => {
    if (localStream && localStream.getAudioTracks().length > 0) {
      const enabled = !localStream.getAudioTracks()[0].enabled
      localStream.getAudioTracks()[0].enabled = enabled
      setMicEnabled(enabled)
    }
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
          <ControlButton Icon={videoEnabled ? VideoIcon : VideoOffIcon} onClick={toggleVideo} enabled={videoEnabled} />
          <ControlButton Icon={micEnabled ? MicIcon : MicOffIcon} onClick={toggleMic} enabled={micEnabled} />
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
