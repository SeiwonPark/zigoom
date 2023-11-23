import { useCallback, useContext, useEffect, useRef, useState } from 'react'

import { useLocation, useNavigate } from 'react-router-dom'

import { defaultMediaConstraints, iceServers, offerOptions } from '@/configs/webrtc'
import { SocketContext } from '@/contexts/SocketContext'
import { useLocalOption } from '@/hooks/useStore'
import { PeerDisconnectionType } from '@/typings/enums'
import { PeerData, PeerInfo } from '@/typings/types'
import { verifySession } from '@/utils/check'
import { getProfileImage } from '@/utils/localStorage'
import {
  isCallSchema,
  isPeerAnswerSchema,
  isPeerIceCandidateSchema,
  isPeerOfferSchema,
  isRoomCreatedSchema,
  isRoomJoinedSchema,
} from '@/validations/socket.validation'

interface WebRTCProps {
  roomId: string | undefined
}

export const useWebRTC = ({ roomId }: WebRTCProps) => {
  const socket = useContext(SocketContext)

  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map())
  const [remoteProfiles, setRemoteProfiles] = useState<Map<string, PeerInfo>>(new Map())

  const localStreamRef = useRef<MediaStream>()
  const peerConnectionRefs = useRef<Record<string, RTCPeerConnection>>({})
  const localPeerId = useRef<string>('')

  const location = useLocation()
  const navigate = useNavigate()
  const params = new URLSearchParams(location.search)
  const { isVideoOn, isAudioOn } = useLocalOption()
  const isVideoOnRef = useRef(isVideoOn)
  const isAudioOnRef = useRef(isAudioOn)

  useEffect(() => {
    setSocketListeners()
    socket.emit('join', { roomId: roomId, peerId: localPeerId.current })

    return () => removeSocketListeners()
  }, [])

  useEffect(() => {
    isVideoOnRef.current = isVideoOn
    isAudioOnRef.current = isAudioOn
  }, [isVideoOn, isAudioOn])

  useEffect(() => {
    const verifyAndNavigate = async () => {
      const isVerified = await verifySession({ params }, roomId)
      if (isVerified) {
        navigate(`/room/${roomId}`, { replace: true })
      }
    }

    verifyAndNavigate()
  }, [roomId])

  const setSocketListeners = useCallback(() => {
    socket.on('room_created', onRoomCreated)
    socket.on('room_joined', onRoomJoined)
    socket.on('call', onCall)
    socket.on('peer_offer', onPeerOffer)
    socket.on('peer_answer', onPeerAnswer)
    socket.on('peer_ice_candidate', onPeerIceCandidate)
    socket.on('peer_disconnected', onPeerDisconnected)
  }, [socket])

  const removeSocketListeners = useCallback(() => {
    socket.off('room_created')
    socket.off('room_joined')
    socket.off('call')
    socket.off('peer_offer')
    socket.off('peer_answer')
    socket.off('peer_ice_candidate')
    socket.off('peer_disconnected')
  }, [socket])

  const onRoomCreated = async (event: any) => {
    if (!isRoomCreatedSchema(event)) {
      throw new Error('Invalid payload type for RoomCreatedSchema.')
    }

    localPeerId.current = event.peerId
    await initializeLocalStream()
  }

  const onRoomJoined = async (event: any) => {
    if (!isRoomJoinedSchema(event)) {
      throw new Error('Invalid payload type for RoomJoinedSchema.')
    }

    localPeerId.current = event.peerId
    await initializeLocalStream()
    socket.emit('call', {
      roomId: event.roomId,
      senderId: event.peerId,
    })
  }

  const configurePeerConnection = (remotePeerId: string) => {
    const rtcPeerConnection: RTCPeerConnection = new RTCPeerConnection(iceServers)

    rtcPeerConnection.ontrack = (ev: RTCTrackEvent) => setRemoteStream(ev, remotePeerId)
    rtcPeerConnection.oniceconnectionstatechange = () => checkPeerDisconnect(remotePeerId)
    rtcPeerConnection.onicecandidate = (ev: RTCPeerConnectionIceEvent) => sendIceCandidate(ev, remotePeerId)

    const peersDataChannel = rtcPeerConnection.createDataChannel('peers', { ordered: true, maxRetransmits: 0 })

    peersDataChannel.onopen = async () => {
      const profileImage = await getProfileImage()

      peersDataChannel.send(
        JSON.stringify({
          id: localPeerId.current,
          img: profileImage,
          video: isVideoOnRef.current,
          audio: isAudioOnRef.current,
        })
      )
    }

    peersDataChannel.onclose = () => {
      console.log(`Data channel is closed from ${remotePeerId}`)
    }

    rtcPeerConnection.ondatachannel = (event: RTCDataChannelEvent) => {
      const receiveChannel = event.channel
      receiveChannel.onmessage = handleReceiveMessage
    }

    return rtcPeerConnection
  }

  const handleReceiveMessage = (event: MessageEvent<string>) => {
    const receivedPeerData: PeerData = JSON.parse(event.data)
    console.log('Received data from peers: ', receivedPeerData)

    setRemoteProfiles((prev) => {
      return new Map(prev).set(receivedPeerData.id, {
        img: receivedPeerData.img,
        video: receivedPeerData.video,
        audio: receivedPeerData.audio,
      })
    })
  }

  const onCall = async (event: any) => {
    if (!isCallSchema(event)) {
      throw new Error('Invalid payload type for CallSchema.')
    }

    const remotePeerId = event.senderId

    const rtcPeerConnection = configurePeerConnection(remotePeerId)
    await addLocalTracks(rtcPeerConnection)
    await createOffer(rtcPeerConnection, remotePeerId)

    peerConnectionRefs.current[remotePeerId] = rtcPeerConnection
  }

  const onPeerOffer = async (event: any) => {
    if (!isPeerOfferSchema(event)) {
      throw new Error('Invalid payload type for PeerOfferSchema.')
    }

    const remotePeerId = event.senderId
    const rtcPeerConnection = configurePeerConnection(remotePeerId)

    rtcPeerConnection.setRemoteDescription(new RTCSessionDescription({ ...event }))
    await addLocalTracks(rtcPeerConnection)
    await createAnswer(rtcPeerConnection, remotePeerId)

    peerConnectionRefs.current[remotePeerId] = rtcPeerConnection
  }

  const onPeerAnswer = async (event: any) => {
    if (!isPeerAnswerSchema(event)) {
      throw new Error('Invalid payload type for PeerAnswerSchema.')
    }

    const peerConnection = peerConnectionRefs.current[event.senderId]
    peerConnection.setRemoteDescription(new RTCSessionDescription({ ...event }))
  }

  const createOffer = async (rtcPeerConnection: RTCPeerConnection, remotePeerId: string) => {
    try {
      const sessionDescription = await rtcPeerConnection.createOffer(offerOptions)
      rtcPeerConnection.setLocalDescription(sessionDescription)

      socket.emit('peer_offer', {
        type: sessionDescription.type,
        sdp: sessionDescription.sdp,
        senderId: localPeerId.current,
        receiverId: remotePeerId,
      })
    } catch (error) {
      console.error(error)
    }
  }

  const createAnswer = async (rtcPeerConnection: RTCPeerConnection, remotePeerId: string) => {
    try {
      const sessionDescription = await rtcPeerConnection.createAnswer(offerOptions)
      rtcPeerConnection.setLocalDescription(sessionDescription)

      socket.emit('peer_answer', {
        type: sessionDescription.type,
        sdp: sessionDescription.sdp,
        senderId: localPeerId.current,
        receiverId: remotePeerId,
      })
    } catch (error) {
      console.error(error)
    }
  }

  const sendIceCandidate = (ev: RTCPeerConnectionIceEvent, remotePeerId: string) => {
    if (ev.candidate) {
      socket.emit('peer_ice_candidate', {
        senderId: localPeerId.current,
        receiverId: remotePeerId,
        roomId: roomId,
        candidate: ev.candidate,
      })
    }
  }

  const onPeerIceCandidate = (event: any) => {
    if (!isPeerIceCandidateSchema(event)) {
      throw new Error('Invalid payload type for PeerIceCandidateSchema.')
    }

    const senderPeerId = event.senderId

    const candidate = new RTCIceCandidate({
      sdpMLineIndex: event.candidate.sdpMLineIndex,
      candidate: event.candidate.candidate,
    })

    if (peerConnectionRefs.current[senderPeerId]) {
      peerConnectionRefs.current[senderPeerId].addIceCandidate(candidate)
    }
  }

  const onPeerDisconnected = (event: any) => {
    const disconnectedPeerId = event.peerId
    console.log(`Peer ${disconnectedPeerId} has been disconnected`)

    setRemoteStreams((prevStreams) => {
      const newStreams = new Map(prevStreams)
      newStreams.delete(disconnectedPeerId)
      return newStreams
    })
  }

  const addLocalTracks = async (rtcPeerConnection: RTCPeerConnection) => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track: MediaStreamTrack) => {
        rtcPeerConnection.addTrack(track, localStreamRef.current!)
      })
    }
  }

  const checkPeerDisconnect = (remotePeerId: string) => {
    try {
      const state = peerConnectionRefs.current[remotePeerId].iceConnectionState

      if (
        state === PeerDisconnectionType.Failed ||
        state === PeerDisconnectionType.Closed ||
        state === PeerDisconnectionType.Disconnected
      ) {
        const videoDisconnected = document.getElementById('vid_' + remotePeerId)

        if (videoDisconnected) {
          videoDisconnected.remove()
        }

        if (peerConnectionRefs.current[remotePeerId]) {
          peerConnectionRefs.current[remotePeerId].close()
          delete peerConnectionRefs.current[remotePeerId]
        }

        console.log(`Peer ${remotePeerId} has been disconnected`)
      }
    } catch {
      // DO NOTHING
    }
  }

  const initializeLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(defaultMediaConstraints)
      setLocalStream(stream)
      localStreamRef.current = stream
    } catch (error) {
      console.error('Could not get user media', error)
    }
  }

  const setRemoteStream = (ev: RTCTrackEvent, remotePeerId: string) => {
    if (ev.track.kind === 'video') {
      setRemoteStreams((prevStreams) => {
        return new Map(prevStreams).set(remotePeerId, ev.streams[0])
      })
    }
  }

  return {
    localPeerId,
    localStream,
    localStreamRef,
    remoteStreams,
    remoteProfiles,
    peerConnectionRefs,
  }
}