import { useEffect, useRef, useState } from 'react'

import { MoreIcon, PinIconDisabled, PinIconEnabled } from '@/assets/icons'
import { Unnamed } from '@/assets/images'
import { SVGIcon } from '@/components/Buttons'
import { useLocalOption } from '@/hooks/useStore'
import { getLocalStorageItem } from '@/utils/localStorage'
import { GoogleJWTPayload } from '@/validations/auth.validation'

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
  const [pinned, setPinned] = useState<boolean>(false)
  const { isVideoOn, isAudioOn } = useLocalOption()

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
  }, [isVideoOn, isAudioOn, stream?.active])

  // FIXME: actually pin
  const togglePin = () => {
    setPinned(!pinned)
  }

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

  const getProfileImageFromLocalStorage = () => {
    return getLocalStorageItem<GoogleJWTPayload>('user')?.picture.replace('=s96-c', '=l96-c')
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
          playsInline
        />
      ) : (
        <div>
          <img
            className={styles.altImage}
            // FIXME: hope there's a better idea
            src={getProfileImageFromLocalStorage() || Unnamed}
            alt="Unnamed"
          />
        </div>
      )}
      <div className={styles.peerId} style={{ ...setIdPosition() }}>
        {peerId}
      </div>
      <div className={`${styles.options} ${showHover ? styles.optionHover : styles.optionDefault}`} id="options">
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
