import { useEffect, useRef, useState } from 'react'

import { css } from '@emotion/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { MicIcon, MicOffIcon, VideoIcon, VideoOffIcon, VolumeIcon } from '@/assets/icons'
import { ControlButton, DeviceSelectButton, ElevatedButton } from '@/components/buttons'
import { LocalVideo } from '@/components/videos/LocalVideo'
import { defaultMediaConstraints } from '@/configs/webrtc'
import { useLocalOption } from '@/hooks/useStore'
import { MediaTypes } from '@/typings/types'
import { verifySession } from '@/utils/check'

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

    getDevices()
  }, [])

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
    <div
      css={css`
        height: inherit;
        width: 100%;
        display: flex;
        min-width: 0;
      `}
    >
      <div
        css={css`
          display: flex;
          align-items: center;
          justify-content: center;
          margin: auto;

          @media screen and (max-width: 1000px) {
            padding-top: 100px;
            display: grid;
            grid-template: minmax(0, 1fr);
          }
        `}
      >
        <div
          css={css`
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
          `}
        >
          <div
            css={css`
              width: 90vw;
              max-width: 720px;
              min-width: 700px;
              height: 420px;
              position: relative;
            `}
          >
            <LocalVideo
              stream={localStream}
              peerId="You"
              peerIdPosition="top-left"
              numOfparticipants={1}
              showHover={false}
            />
            <div
              css={css`
                display: flex;
                position: absolute;
                bottom: 8px;
                left: 50%;
                transform: translateX(-50%);
              `}
            >
              <ControlButton Icon={isVideoOn ? VideoIcon : VideoOffIcon} onClick={toggleVideo} enabled={isVideoOn} />
              <ControlButton Icon={isAudioOn ? MicIcon : MicOffIcon} onClick={toggleMic} enabled={isAudioOn} />
            </div>
          </div>
          <div
            css={css`
              display: flex;
              flex-direction: row;
              align-items: start;
            `}
          >
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
        <div
          css={css`
            width: 720px;
            height: 420px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
          `}
        >
          <span
            css={css`
              font-size: 32px;
            `}
          >
            <h3
              css={css`
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                font-weight: 500;
              `}
            >
              {data.users.length !== 0 ? `${data.title}` : 'Ready to join?'}
            </h3>
          </span>
          <div
            css={css`
              display: flex;
              margin-bottom: 1rem;
            `}
          >
            {data.users.length !== 0 ? (
              data.users.map((user: User, index: number) => (
                <img
                  key={index}
                  css={css`
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    margin: 6px;
                  `}
                  src={user.profileThumbnail}
                  alt={user.name}
                />
              ))
            ) : (
              <span>No one else is here.</span>
            )}
          </div>
          <ElevatedButton text="Join now" onClick={() => {}} />
        </div>
      </div>
    </div>
  )
}
