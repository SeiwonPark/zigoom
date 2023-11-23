import { createRef, useRef, useState } from 'react'

import { LocalVideo, RemoteVideo } from '@/components/Videos'
import { ChatBox, ControlBar } from '@/components/index'
import { VIDEO_GRIDS } from '@/configs/webrtc'
import { useWebRTC } from '@/hooks/useWebRTC'
import { VideoElement } from '@/typings/index'

import styles from './index.module.css'

interface SessionProps {
  roomId?: string
}

export const Session = ({ roomId }: SessionProps) => {
  const remoteVideoRefs = useRef<Map<string, VideoElement>>(new Map())
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false)
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false)
  const [isNavigating, setIsNavigating] = useState<boolean>(false)

  const { localPeerId, localStream, localStreamRef, remoteStreams, remoteProfiles, peerConnectionRefs } = useWebRTC({
    roomId,
  })

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen)
  }

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      stopScreenSharing()
    } else {
      startScreenSharing()
    }
  }

  const startScreenSharing = async () => {
    try {
      console.log('Starting screen sharing...')
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })

      for (const peerId in peerConnectionRefs.current) {
        const peerConnection = peerConnectionRefs.current[peerId]
        const senders = peerConnection.getSenders()
        const videoSender = senders.find((sender: RTCRtpSender) => sender.track?.kind === 'video')
        if (videoSender) {
          videoSender.replaceTrack(screenStream.getVideoTracks()[0])
        }
      }

      setIsNavigating(true)
      screenStream.getVideoTracks()[0].addEventListener('ended', () => {
        stopScreenSharing()
      })
      setIsScreenSharing(true)

      setTimeout(() => {
        setIsNavigating(false)
      }, 1500)

      console.log('Successfully started screen sharing')
    } catch (error) {
      console.error('Error on starting screen sharing', error)
    }
  }

  const stopScreenSharing = () => {
    for (const peerId in peerConnectionRefs.current) {
      const peerConnection = peerConnectionRefs.current[peerId]
      const senders = peerConnection.getSenders()
      const videoSender = senders.find((sender: RTCRtpSender) => sender.track?.kind === 'video')
      if (videoSender && localStreamRef.current) {
        videoSender.replaceTrack(localStreamRef.current.getVideoTracks()[0])
      }
    }

    setIsScreenSharing(false)
    console.log('Successfully stopped screen sharing')
  }

  return (
    <div className={styles.container}>
      <div className={isNavigating ? styles.navigating : styles.default}>
        <div className={styles.background}>
          <span className={styles.loadingText}>Sharing screen...</span>
        </div>
      </div>
      <div className={`${styles.wrapper} ${remoteStreams.size > 0 ? styles.multiple : styles.single}`}>
        <div
          style={{
            width: '100%',
            height: '100%',
            gridRowStart: VIDEO_GRIDS[1 + remoteStreams.size][0].rowStart,
            gridRowEnd: VIDEO_GRIDS[1 + remoteStreams.size][0].rowEnd,
            gridColumnStart: VIDEO_GRIDS[1 + remoteStreams.size][0].colStart,
            gridColumnEnd: VIDEO_GRIDS[1 + remoteStreams.size][0].colEnd,
          }}
        >
          <LocalVideo
            stream={localStream}
            peerId={localPeerId.current}
            peerIdPosition="bottom-left"
            numOfparticipants={1 + remoteStreams.size}
            showHover={true}
          />
        </div>
        {Array.from(remoteStreams.entries()).map(([peerId, stream]: [string, MediaStream], index: number) => {
          if (!remoteVideoRefs.current.has(peerId)) {
            remoteVideoRefs.current.set(peerId, createRef())
          }

          return (
            <div
              key={index}
              style={{
                width: '100%',
                height: '100%',
                gridRowStart: VIDEO_GRIDS[1 + remoteStreams.size][index + 1].rowStart,
                gridRowEnd: VIDEO_GRIDS[1 + remoteStreams.size][index + 1].rowEnd,
                gridColumnStart: VIDEO_GRIDS[1 + remoteStreams.size][index + 1].colStart,
                gridColumnEnd: VIDEO_GRIDS[1 + remoteStreams.size][index + 1].colEnd,
              }}
            >
              <RemoteVideo
                key={peerId}
                stream={stream}
                peerId={peerId}
                numOfparticipants={1 + remoteStreams.size}
                remoteProfiles={remoteProfiles}
              />
            </div>
          )
        })}
      </div>
      <ChatBox roomId={roomId} isChatOpen={isChatOpen} localPeerId={localPeerId.current} toggleChat={toggleChat} />
      {/* FIXME: isChatOpen to be global state */}
      <ControlBar
        roomId={roomId}
        localPeerId={localPeerId.current}
        localStream={localStream}
        isChatOpen={isChatOpen}
        toggleChat={toggleChat}
        toggleScreenShare={toggleScreenShare}
      />
    </div>
  )
}
