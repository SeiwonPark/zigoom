import { memo, useContext, useEffect, useRef, useState } from 'react'

import { MoreIcon, PinIconDisabled, PinIconEnabled } from '@/assets/icons'
import { SVGIcon } from '@/components/Buttons'
import { SocketContext } from '@/contexts/SocketContext'
import { useLocalOption } from '@/hooks/useStore'
import { PeerInfo } from '@/typings/index'
import { isVideoStatusSchema } from '@/validations/socket.validation'

import styles from './index.module.css'

interface VideoProps {
  stream: MediaStream
  peerId: string
  numOfparticipants: number
  remoteProfiles: Map<string, PeerInfo>
}

const RemoteVideoComponent = ({ stream, peerId, numOfparticipants, remoteProfiles }: VideoProps) => {
  const socket = useContext(SocketContext)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [videoActive, setVideoActive] = useState<boolean>(false)
  const { pinnedPeerId, setPinnedPeerId } = useLocalOption()

  useEffect(() => {
    const remotePeerInfo = remoteProfiles.get(peerId)
    if (remotePeerInfo) {
      setVideoActive(remotePeerInfo.video)
    }
  }, [remoteProfiles, peerId])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream
    }

    const handleVideoStatus = (event: any) => {
      if (!isVideoStatusSchema(event)) {
        throw new Error('Invalid payload type for VideoStatusSchema.')
      }

      if (event.senderId === peerId) {
        setVideoActive(event.video)
      }
    }

    socket.on('video_status', handleVideoStatus)

    return () => {
      socket.off('video_status', handleVideoStatus)
    }
  }, [socket, peerId])

  const setVideoRef = (node: HTMLVideoElement) => {
    if (node) {
      node.srcObject = stream
      videoRef.current = node
    }
  }

  const togglePin = () => {
    if (pinnedPeerId === '' || pinnedPeerId !== peerId) {
      setPinnedPeerId(peerId)
    } else {
      setPinnedPeerId('')
    }
  }

  console.log('This is the image', remoteProfiles.get(peerId)?.img)

  return (
    <div className={`${styles.container} ${numOfparticipants === 1 ? styles.single : styles.multiple}`}>
      {videoActive ? (
        <video
          className={`${styles.remoteVideo} ${numOfparticipants === 1 ? styles.singleVideo : styles.multipleVideo}`}
          ref={setVideoRef}
          muted={true}
          autoPlay
          playsInline
        />
      ) : (
        <div>
          <img className={styles.altImage} src={remoteProfiles.get(peerId)?.img} alt={peerId} />
        </div>
      )}
      <div className={styles.peerId}>{peerId}</div>
      <div id="options" className={styles.options}>
        <div className={styles.iconContainer}>
          <div id="icon" className={styles.icon} onClick={togglePin}>
            <SVGIcon Icon={pinnedPeerId === peerId ? PinIconEnabled : PinIconDisabled} width={30} height={24} />
          </div>
          <div id="icon" className={styles.icon}>
            <SVGIcon Icon={MoreIcon} width={30} height={24} />
          </div>
        </div>
      </div>
    </div>
  )
}

export const RemoteVideo = memo(RemoteVideoComponent, (prev, next) => {
  return (
    prev.peerId === next.peerId &&
    prev.numOfparticipants === next.numOfparticipants &&
    prev.stream === next.stream &&
    prev.remoteProfiles === next.remoteProfiles
  )
})
