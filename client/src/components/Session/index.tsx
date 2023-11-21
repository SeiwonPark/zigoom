import { createRef, useCallback, useContext, useEffect, useRef, useState } from 'react'

import { useLocation, useNavigate } from 'react-router-dom'

import { LocalVideo, RemoteVideo } from '@/components/Videos'
import { ChatBox, ControlBar } from '@/components/index'
import { VIDEO_GRIDS, defaultMediaConstraints, iceServers, offerOptions } from '@/configs/webrtc'
import { SocketContext } from '@/contexts/SocketContext'
import { useLocalOption } from '@/hooks/useStore'
import { PeerData, PeerDisconnectionType, PeerInfo, VideoElement } from '@/typings/index'
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

import styles from './index.module.css'

interface SessionProps {
  roomId?: string
}

export const Session = ({ roomId }: SessionProps) => {
  const socket = useContext(SocketContext)
  const remoteVideoRefs = useRef<Map<string, VideoElement>>(new Map())
  const localStreamRef = useRef<MediaStream>()
  const peerConnectionRefs = useRef<Record<string, RTCPeerConnection>>({})
  const localPeerId = useRef<string>('')
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map())
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false)
  const [remoteProfiles, setRemoteProfiles] = useState<Map<string, PeerInfo>>(new Map())
  const location = useLocation()
  const navigate = useNavigate()
  const params = new URLSearchParams(location.search)
  const { isVideoOn } = useLocalOption()

  useEffect(() => {
    setSocketListeners()
    socket.emit('join', { roomId: roomId, peerId: localPeerId.current })

    return () => removeSocketListeners()
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
          video: isVideoOn,
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
    console.log('Received data:', receivedPeerData)

    setRemoteProfiles((prev) => {
      return new Map(prev).set(receivedPeerData.id, { img: receivedPeerData.img, video: receivedPeerData.video })
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

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen)
  }

  return (
    <div className={styles.container}>
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
            peerId="You"
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
      />
    </div>
  )
}
