import { useEffect, useRef } from 'react'

import { MoreIcon, PinIconDisabled, PinIconEnabled } from '@/assets/icons'
import { SVGIcon } from '@/components/Buttons'
import { useLocalOption, useUserStore } from '@/hooks/useStore'

import styles from './index.module.css'

type PeerIdPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'

interface VideoProps {
  stream: MediaStream | null
  peerId: string
  peerIdPosition: PeerIdPosition
  numOfparticipants: number
  showHover?: boolean
}

export const LocalVideo = ({ stream, peerId, peerIdPosition, numOfparticipants, showHover }: VideoProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const { isVideoOn, isAudioOn, pinnedPeerId, setPinnedPeerId } = useLocalOption()
  const { user } = useUserStore()

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream
    }

    if (stream && stream.getVideoTracks().length > 0) {
      stream.getVideoTracks()[0].enabled = isVideoOn
    }

    if (stream && stream.getAudioTracks().length > 0) {
      stream.getAudioTracks()[0].enabled = isAudioOn
    }
  }, [isVideoOn, stream?.active])

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

  const togglePin = () => {
    if (pinnedPeerId === '' || pinnedPeerId !== peerId) {
      setPinnedPeerId(peerId)
    } else {
      setPinnedPeerId('')
    }
  }

  return (
    <div
      className={`${styles.container} ${showHover ? styles.active : styles.inactive} ${
        numOfparticipants === 1 ? styles.single : styles.multiple
      }`}
    >
      {isVideoOn ? (
        <video
          className={`${styles.localVideo} ${numOfparticipants === 1 ? styles.singleVideo : styles.multipleVideo}`}
          ref={videoRef}
          autoPlay
          muted
          playsInline
        />
      ) : (
        <div>
          <img className={styles.altImage} src={user.profileThumbnail} alt="profile-image" />
        </div>
      )}
      <div className={styles.peerId} style={{ ...setIdPosition() }}>
        You
      </div>
      <div className={styles.options}>
        <div className={styles.iconContainer}>
          <div id="icon" className={styles.icon} onClick={togglePin}>
            <SVGIcon Icon={peerId === pinnedPeerId ? PinIconEnabled : PinIconDisabled} width={30} height={24} />
          </div>
          <div id="icon" className={styles.icon}>
            <SVGIcon Icon={MoreIcon} width={30} height={24} />
          </div>
        </div>
      </div>
    </div>
  )
}
