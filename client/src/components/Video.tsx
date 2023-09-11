import { createRef, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { css } from '@emotion/react'
import { SocketEvent, VideoElement } from '../typings/types'
import { RemoteVideo } from './RemoteVideo'
import { iceServers, mediaConstraints, offerOptions } from '../configs/webrtc'
import { SocketContext } from '../contexts/SocketContext'
import { ControlBar } from './ControlBar'
import { ChatBox } from './ChatBox'

interface VideoProps {
  roomId?: string
  localPeerId: string
  setLocalPeerId: React.Dispatch<React.SetStateAction<string>>
}

export const Video = ({ roomId, localPeerId, setLocalPeerId }: VideoProps) => {
  const socket = useContext(SocketContext)
  const userVideo = useRef<any>()
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map())
  const remoteVideoRefs = useRef<Map<string, VideoElement>>(new Map())
  const localStreamRef = useRef<MediaStream>()
  const peerConnectionRefs = useRef<Record<string, RTCPeerConnection>>({})
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false)

  useEffect(() => {
    setSocketListeners()
    socket.emit('join', { roomId: roomId, peerId: localPeerId })

    return () => removeSocketListeners()
  }, [])

  const setSocketListeners = () => {
    socket.on('room_created', onRoomCreated)
    socket.on('room_joined', onRoomJoined)
    socket.on('call', onCall)
    socket.on('peer_offer', onPeerOffer)
    socket.on('peer_answer', onPeerAnswer)
    socket.on('peer_ice_candidate', onPeerIceCandidate)
    socket.on('peer_disconnected', onPeerDisconnected)
  }

  const removeSocketListeners = useCallback(() => {
    socket.off('room_created')
    socket.off('room_joined')
    socket.off('call')
    socket.off('peer_offer')
    socket.off('peer_answer')
    socket.off('peer_ice_candidate')
    socket.off('peer_disconnected')
  }, [socket])

  const onRoomCreated = async (event: SocketEvent) => {
    localPeerId = event.peerId
    setLocalPeerId(localPeerId)
    await initializeLocalStream()
  }

  const onRoomJoined = async (event: SocketEvent) => {
    localPeerId = event.peerId
    setLocalPeerId(localPeerId)
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

    return rtcPeerConnection
  }

  const onCall = async (event: SocketEvent) => {
    const remotePeerId = event.senderId

    const rtcPeerConnection = configurePeerConnection(remotePeerId)
    await addLocalTracks(rtcPeerConnection)
    await createOffer(rtcPeerConnection, remotePeerId)

    peerConnectionRefs.current[remotePeerId] = rtcPeerConnection
  }

  const onPeerOffer = async (event: SocketEvent) => {
    const remotePeerId = event.senderId
    const rtcPeerConnection = configurePeerConnection(remotePeerId)

    rtcPeerConnection.setRemoteDescription(new RTCSessionDescription({ ...event }))
    await addLocalTracks(rtcPeerConnection)
    await createAnswer(rtcPeerConnection, remotePeerId)

    peerConnectionRefs.current[remotePeerId] = rtcPeerConnection
  }

  const onPeerAnswer = async (event: SocketEvent) => {
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
        senderId: localPeerId,
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
        senderId: localPeerId,
        receiverId: remotePeerId,
      })
    } catch (error) {
      console.error(error)
    }
  }

  const sendIceCandidate = (ev: RTCPeerConnectionIceEvent, remotePeerId: string) => {
    if (ev.candidate) {
      socket.emit('peer_ice_candidate', {
        senderId: localPeerId,
        receiverId: remotePeerId,
        roomId: roomId,
        candidate: ev.candidate,
      })
    }
  }

  const onPeerIceCandidate = (event: SocketEvent) => {
    const senderPeerId = event.senderId

    const candidate = new RTCIceCandidate({
      sdpMLineIndex: event.candidate.sdpMLineIndex,
      candidate: event.candidate.candidate,
    })

    if (peerConnectionRefs.current[senderPeerId]) {
      peerConnectionRefs.current[senderPeerId].addIceCandidate(candidate)
    }
  }

  const onPeerDisconnected = (event: SocketEvent) => {
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
      const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints)
      setLocalStream(stream)
      localStreamRef.current = stream
      userVideo.current.srcObject = stream
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
    <div
      css={css`
        height: inherit;
        width: 100%;
        display: flex;
        background-color: rgb(32, 33, 36);
        overflow: hidden;
      `}
    >
      <div
        css={css`
          width: 100%;
          height: calc(100% - 5rem);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        `}
      >
        <video
          ref={userVideo}
          css={css`
            min-width: 200px;
            width: ${isChatOpen ? '90%' : '100%'};
            height: 100%;
            background-color: rgb(32, 33, 36);
          `}
          autoPlay
          muted
        />
      </div>
      {Array.from(remoteStreams.entries()).map(([peerId, stream]: [string, MediaStream]) => {
        if (!remoteVideoRefs.current.has(peerId)) {
          remoteVideoRefs.current.set(peerId, createRef())
        }
        return <RemoteVideo key={peerId} peerId={peerId} stream={stream} ref={remoteVideoRefs.current.get(peerId)} />
      })}
      <ChatBox roomId={roomId} isChatOpen={isChatOpen} localPeerId={localPeerId} toggleChat={toggleChat} />
      {/* FIXME: isChatOpen to be global state */}
      <ControlBar roomId={roomId} localStream={localStream} isChatOpen={isChatOpen} toggleChat={toggleChat} />
    </div>
  )
}
