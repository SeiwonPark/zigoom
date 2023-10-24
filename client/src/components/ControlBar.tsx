import { useContext, useEffect } from 'react'

import { css } from '@emotion/react'
import { useNavigate } from 'react-router-dom'

import {
  CallEndIcon,
  ChatIconDisabled,
  ChatIconEnabled,
  MicIcon,
  MicOffIcon,
  VideoIcon,
  VideoOffIcon,
} from '@/assets/icons'
import { ControlButton, HostOptionButton } from '@/components/buttons'
import { VITE_BASE_URL } from '@/configs/env'
import axios from '@/configs/http'
import { SocketContext } from '@/contexts/SocketContext'
import { useLocalOption, useSessionStore } from '@/hooks/useStore'

interface ControlBarProps {
  localStream: MediaStream | null
  roomId?: string
  localPeerId?: string
  isChatOpen?: boolean
  toggleChat?: () => void
}

export const ControlBar = ({ localStream, roomId, localPeerId, isChatOpen, toggleChat }: ControlBarProps) => {
  const socket = useContext(SocketContext)
  const navigate = useNavigate()
  const { isVideoOn, isAudioOn, setIsVideoOn, setIsAudioOn } = useLocalOption()
  const { setIsGranted } = useSessionStore()

  useEffect(() => {
    socket.on('disconnect', async (reason: string) => {
      if (reason === 'io server disconnect') {
        if (localStream && localStream.getVideoTracks().length > 0) {
          localStream.getVideoTracks()[0].stop()
          setIsGranted(false)
          navigate('/')
        }
      }
    })
  }, [localStream, isVideoOn, isAudioOn])

  const toggleVideo = () => {
    if (localStream && localStream.getVideoTracks().length > 0) {
      const enabled = !localStream.getVideoTracks()[0].enabled
      localStream.getVideoTracks()[0].enabled = enabled
      setIsVideoOn(enabled)

      socket.emit('toggleVideo', {
        roomId: roomId,
        senderId: localPeerId,
        video: enabled,
      })
    }
  }

  const toggleMic = () => {
    if (localStream && localStream.getAudioTracks().length > 0) {
      const enabled = !localStream.getAudioTracks()[0].enabled
      localStream.getAudioTracks()[0].enabled = enabled
      setIsAudioOn(enabled)
    }
  }

  const handleCancelCall = () => {
    socket.emit('cancel')
    setIsGranted(false)
    handleLeaveSession()
  }

  const handleLeaveSession = async () => {
    const payload = {
      sessionId: roomId,
    }

    const res = await axios.patch(`${VITE_BASE_URL}/v1/session`, payload, {
      params: { sessionId: roomId },
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (res.status === 200) {
      console.log(res.data)
      navigate('/')
    } else {
      console.log('handleLeaveSession failed')
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
