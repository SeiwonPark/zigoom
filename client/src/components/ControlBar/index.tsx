import { useContext, useEffect } from 'react'

import { useNavigate } from 'react-router-dom'

import {
  CallEndIcon,
  ChatIconDisabled,
  ChatIconEnabled,
  MicIcon,
  MicOffIcon,
  ScreenIcon,
  VideoIcon,
  VideoOffIcon,
} from '@/assets/icons'
import { ControlButton, HostOptionButton } from '@/components/Buttons'
import { VITE_BASE_URL } from '@/configs/env'
import axios from '@/configs/http'
import { SocketContext } from '@/contexts/SocketContext'
import { useLocalOption, useSessionStore } from '@/hooks/useStore'

import styles from './index.module.css'

interface ControlBarProps {
  localStream: MediaStream | null
  roomId?: string
  localPeerId?: string
  isChatOpen?: boolean
  toggleChat?: () => void
  toggleScreenShare: () => void
}

export const ControlBar = ({
  localStream,
  roomId,
  localPeerId,
  isChatOpen,
  toggleChat,
  toggleScreenShare,
}: ControlBarProps) => {
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
  }, [localStream])

  const toggleVideo = () => {
    if (localStream && localStream.getVideoTracks().length > 0) {
      const enabled = !localStream.getVideoTracks()[0].enabled
      localStream.getVideoTracks()[0].enabled = enabled
      setIsVideoOn(enabled)

      socket.emit('toggle_video', {
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

      socket.emit('toggle_audio', {
        roomId: roomId,
        senderId: localPeerId,
        audio: enabled,
      })
    }
  }

  const handleCancelCall = () => {
    socket.emit('cancel')
    setIsGranted(false)
    handleLeaveSession()
  }

  const handleLeaveSession = async () => {
    const payload = {
      id: roomId,
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
      console.error('handleLeaveSession failed')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <span className={styles.roomId}>{roomId}</span>
        <div className={styles.controlButtons}>
          <ControlButton Icon={isVideoOn ? VideoIcon : VideoOffIcon} onClick={toggleVideo} enabled={isVideoOn} />
          <ControlButton Icon={isAudioOn ? MicIcon : MicOffIcon} onClick={toggleMic} enabled={isAudioOn} />
          <ControlButton Icon={ScreenIcon} onClick={toggleScreenShare} enabled={true} height="28px" />
          <ControlButton Icon={CallEndIcon} onClick={handleCancelCall} enabled={false} />
        </div>
        <div className={styles.hostOptionButtons}>
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
