import { createRef, useContext, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { SocketContext } from '../contexts/SocketContext'
import { RemoteVideo } from '../components/RemoteVideo'
import { SocketEvent, VideoElement } from '../typings/types'
import { iceServers, mediaConstraints, offerOptions } from '../configs/webrtc'
import { Chat } from '../components/Chat'

const peerConnections: Record<string, RTCPeerConnection> = {}

export default function Room() {
  const socket = useContext(SocketContext)
  const { roomId } = useParams<{ roomId: string }>()
  const videoChatContainerRef = useRef<any>()
  const userVideo = useRef<any>()
  const localPeerId = useRef<string>('')
  const localStreamRef = useRef<MediaStream>()
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map())
  const remoteVideoRefs = useRef<Map<string, VideoElement>>(new Map())

  useEffect(() => {
    setSocketListeners()
    socket.emit('join', { roomId: roomId, peerId: localPeerId.current })
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

  const onRoomCreated = async (event: SocketEvent) => {
    localPeerId.current = event.peerId
    await initializeLocalStream()
  }

  const onRoomJoined = async (event: SocketEvent) => {
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

    return rtcPeerConnection
  }

  const onCall = async (event: SocketEvent) => {
    const remotePeerId = event.senderId

    const rtcPeerConnection = configurePeerConnection(remotePeerId)
    await addLocalTracks(rtcPeerConnection)
    await createOffer(rtcPeerConnection, remotePeerId)

    peerConnections[remotePeerId] = rtcPeerConnection
  }

  const onPeerOffer = async (event: SocketEvent) => {
    const remotePeerId = event.senderId
    const rtcPeerConnection = configurePeerConnection(remotePeerId)

    rtcPeerConnection.setRemoteDescription(new RTCSessionDescription({ ...event }))
    await addLocalTracks(rtcPeerConnection)
    await createAnswer(rtcPeerConnection, remotePeerId)

    peerConnections[remotePeerId] = rtcPeerConnection
  }

  const onPeerAnswer = async (event: SocketEvent) => {
    const peerConnection = peerConnections[event.senderId]
    peerConnection.setRemoteDescription(new RTCSessionDescription({ ...event }))
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

  const onPeerIceCandidate = (event: SocketEvent) => {
    const senderPeerId = event.senderId

    const candidate = new RTCIceCandidate({
      sdpMLineIndex: event.candidate.sdpMLineIndex,
      candidate: event.candidate.candidate,
    })

    if (peerConnections[senderPeerId]) {
      peerConnections[senderPeerId].addIceCandidate(candidate)
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
      const state = peerConnections[remotePeerId].iceConnectionState

      if (
        state === PeerDisconnectionType.Failed ||
        state === PeerDisconnectionType.Closed ||
        state === PeerDisconnectionType.Disconnected
      ) {
        const videoDisconnected = document.getElementById('vid_' + remotePeerId)

        if (videoDisconnected) {
          videoDisconnected.remove()
        }

        if (peerConnections[remotePeerId]) {
          peerConnections[remotePeerId].close()
          delete peerConnections[remotePeerId]
        }

        console.log(`Peer ${remotePeerId} has been disconnected`)
      }
    } catch {
      // DO NOTHING
    }
  }

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks()[0].enabled = !localStream.getVideoTracks()[0].enabled
    }
  }

  return (
    <div ref={videoChatContainerRef}>
      <video width="100" height="100" ref={userVideo} autoPlay muted />
      {Array.from(remoteStreams.entries()).map(([peerId, stream]: [string, MediaStream]) => {
        if (!remoteVideoRefs.current.has(peerId)) {
          remoteVideoRefs.current.set(peerId, createRef())
        }
        return <RemoteVideo key={peerId} peerId={peerId} stream={stream} ref={remoteVideoRefs.current.get(peerId)} />
      })}
      <button type="button" onClick={toggleVideo}>
        Toggle Video
      </button>
      <Chat roomId={roomId} senderId={localPeerId.current} />
    </div>
  )
}
