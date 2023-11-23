import { MutableRefObject, useState } from 'react'

import { sleep } from '@/utils/time'

interface ScreenProps {
  localStreamRef: MutableRefObject<MediaStream | undefined>
  peerConnectionRefs: MutableRefObject<Record<string, RTCPeerConnection>>
}

export const useScreen = ({ localStreamRef, peerConnectionRefs }: ScreenProps) => {
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false)
  const [isNavigating, setIsNavigating] = useState<boolean>(false)

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

      await sleep(1500)
      setIsNavigating(false)

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

  return {
    isNavigating,
    toggleScreenShare,
  }
}
