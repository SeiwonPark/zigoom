import { useContext, useEffect, useRef, useState } from 'react'

import { MoreIcon, PinIconDisabled, PinIconEnabled } from '@/assets/icons'
import { SVGIcon } from '@/components/Buttons'
import { SocketContext } from '@/contexts/SocketContext'
import { PeerInfo } from '@/typings/index'
import { isVideoStatusSchema } from '@/validations/socket.validation'

import styles from './index.module.css'

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

    socket.on('video_status', handleVideoStatus)

    return () => {
      socket.off('video_status', handleVideoStatus)
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
      console.log('received event: ', event)
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
            <SVGIcon Icon={pinned ? PinIconEnabled : PinIconDisabled} width={30} height={24} />
          </div>
          <div id="icon" className={styles.icon}>
            <SVGIcon Icon={MoreIcon} width={30} height={24} />
          </div>
        </div>
      </div>
    </div>
  )
}
