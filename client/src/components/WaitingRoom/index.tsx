import { useEffect, useRef, useState } from 'react'

import { useLocation, useNavigate } from 'react-router-dom'

import { MicIcon, MicOffIcon, VideoIcon, VideoOffIcon, VolumeIcon } from '@/assets/icons'
import { ControlButton, DeviceSelectButton, ElevatedButton } from '@/components/Buttons'
import { LocalVideo } from '@/components/Videos/LocalVideo'
import { defaultMediaConstraints } from '@/configs/webrtc'
import { useLocalOption, useSessionStore } from '@/hooks/useStore'
import { MediaTypes } from '@/typings/types'
import { verifySession } from '@/utils/check'

import styles from './index.module.css'

interface User {
  id: string
  google_id: string
  name: string
  role: string
  sessionId: string
  profileThumbnail: string
  createdAt: string
  modifiedAt: string
}

interface WaitingRoomProps {
  roomId?: string
  data: {
    id: string
    host: string
    title: string
    isHost: boolean
    isPrivate: boolean
    modifiedAt: string
    createdAt: string
    endedAt: string | null
    users: User[]
  }
}

export const WaitingRoom = ({ roomId, data }: WaitingRoomProps) => {
  const [micDevices, setMicDevices] = useState<MediaDeviceInfo[]>([])
  const [speakerDevices, setSpeakerDevices] = useState<MediaDeviceInfo[]>([])
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const { setIsGranted } = useSessionStore()

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

  const getDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      setMicDevices(devices.filter((device) => device.kind === 'audioinput'))
      setSpeakerDevices(devices.filter((device) => device.kind === 'audiooutput'))
      setVideoDevices(devices.filter((device) => device.kind === 'videoinput'))
    } catch (error) {
      console.error('Error fetching devices', error)
    }
  }

  useEffect(() => {
    getDevices()

    const handlePermissionChange = () => {
      getDevices()
    }

    navigator.permissions.query({ name: 'camera' as PermissionName }).then((permissionStatus) => {
      permissionStatus.onchange = handlePermissionChange
    })

    return () => {
      navigator.permissions.query({ name: 'camera' as PermissionName }).then((permissionStatus) => {
        permissionStatus.onchange = null
      })
    }
  }, [])

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
      setIsVideoOn(enabled)
    }
  }

  const toggleMic = () => {
    if (localStream && localStream.getAudioTracks().length > 0) {
      const enabled = !localStream.getAudioTracks()[0].enabled
      localStream.getAudioTracks()[0].enabled = enabled
      setIsAudioOn(enabled)
    }
  }

  const updateLocalStream = async (deviceId: string, deviceType: MediaTypes): Promise<void> => {
    if (!localStream) {
      return
    }

    switch (deviceType) {
      /** Microphone */
      case 'audioinput': {
        const constraints = { audio: { deviceId: { exact: deviceId } }, video: false }
        const audioStream = await navigator.mediaDevices.getUserMedia(constraints)

        const oldTrack = localStream.getAudioTracks()[0]
        if (oldTrack) {
          oldTrack.stop()
          localStream.removeTrack(oldTrack)
        }

        localStream.addTrack(audioStream.getAudioTracks()[0])
        break
      }

      /** Speaker */
      case 'audiooutput': {
        break
      }

      /** Camera */
      case 'video': {
        const constraints = { audio: false, video: { deviceId: { exact: deviceId } } }
        const videoStream = await navigator.mediaDevices.getUserMedia(constraints)

        const oldTrack = localStream.getVideoTracks()[0]
        if (oldTrack) {
          oldTrack.stop()
          localStream.removeTrack(oldTrack)
        }

        localStream.addTrack(videoStream.getVideoTracks()[0])
        break
      }

      default:
        return
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        <div className={styles.videoContainer}>
          <div className={styles.videoWrapper}>
            <LocalVideo
              stream={localStream}
              peerId="You"
              peerIdPosition="top-left"
              numOfparticipants={1}
              showHover={false}
            />
            <div className={styles.controlButtons}>
              <ControlButton Icon={isVideoOn ? VideoIcon : VideoOffIcon} onClick={toggleVideo} enabled={isVideoOn} />
              <ControlButton Icon={isAudioOn ? MicIcon : MicOffIcon} onClick={toggleMic} enabled={isAudioOn} />
            </div>
          </div>
          <div className={styles.deviceButtons}>
            <DeviceSelectButton
              Icon={MicIcon}
              options={micDevices}
              deviceType="audioinput"
              onDeviceChange={updateLocalStream}
            />
            <DeviceSelectButton
              Icon={VolumeIcon}
              options={speakerDevices}
              deviceType="audiooutput"
              onDeviceChange={updateLocalStream}
            />
            <DeviceSelectButton
              Icon={VideoIcon}
              options={videoDevices}
              deviceType="video"
              onDeviceChange={updateLocalStream}
            />
          </div>
        </div>
        <div className={styles.content}>
          <span className={styles.titleWrapper}>
            <h3 className={styles.title}>{data.users.length !== 0 ? `${data.title}` : 'Ready to join?'}</h3>
          </span>
          <div className={styles.userList}>
            {data.users.length !== 0 ? (
              data.users.map((user: User, index: number) => (
                <img className={styles.user} key={index} src={user.profileThumbnail} alt={user.name} />
              ))
            ) : (
              <span>No one else is here.</span>
            )}
          </div>
          <ElevatedButton text="Join now" onClick={() => setIsGranted(true)} />
        </div>
      </div>
    </div>
  )
}
