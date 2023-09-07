import { useContext, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { SocketContext } from '../contexts/SocketContext'
import { RemoteVideo } from '../components/RemoteVideo'
import { iceServers, mediaConstraints, offerOptions } from '../configs/webrtc'
import { handleKeyUp } from '../utils/keys'

// FIXME: peerConnections type
const peerConnections: any = {}

export default function Room() {
  const socket = useContext(SocketContext)
  const { roomId } = useParams<{ roomId: string }>()
  const videoChatContainerRef = useRef<any>()
  const userVideo = useRef<any>()
  const localPeerId = useRef<string>('')
  const localStreamRef = useRef<MediaStream>()
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map())
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; message: string }>>([])
  const [chatInput, setChatInput] = useState<string>('')

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
    socket.on('receive_chat', onReceiveChat)
  }

  const onRoomCreated = async (event: any) => {
    localPeerId.current = event.peerId
    await initializeLocalStream()
  }

  const onRoomJoined = async (event: any) => {
    localPeerId.current = event.peerId
    await initializeLocalStream()
    socket.emit('call', {
      roomId: event.roomId,
      senderId: event.peerId,
    })
  }

  const configurePeerConnection = (remotePeerId: string) => {
    const rtcPeerConnection = new RTCPeerConnection(iceServers)

    rtcPeerConnection.ontrack = (event: any) => setRemoteStream(event, remotePeerId)
    rtcPeerConnection.oniceconnectionstatechange = (_: any) => checkPeerDisconnect(remotePeerId)
    rtcPeerConnection.onicecandidate = (event: any) => sendIceCandidate(event, remotePeerId)

    return rtcPeerConnection
  }

  const onCall = async (event: any) => {
    const remotePeerId = event.senderId

    const rtcPeerConnection = configurePeerConnection(remotePeerId)
    await addLocalTracks(rtcPeerConnection)
    await createOffer(rtcPeerConnection, remotePeerId)

    peerConnections[remotePeerId] = rtcPeerConnection
  }

  const onPeerOffer = async (event: any) => {
    const remotePeerId = event.senderId
    const rtcPeerConnection = configurePeerConnection(remotePeerId)

    rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event.sdp))
    await addLocalTracks(rtcPeerConnection)
    await createAnswer(rtcPeerConnection, remotePeerId)

    peerConnections[remotePeerId] = rtcPeerConnection
  }

  const onPeerAnswer = async (event: any) => {
    peerConnections[event.senderId].setRemoteDescription(new RTCSessionDescription(event.sdp))
  }

  const onPeerIceCandidate = (event: any) => {
    const senderPeerId = event.senderId
    const candidate = new RTCIceCandidate({
      sdpMLineIndex: event.label,
      candidate: event.candidate,
    })

    if (peerConnections[senderPeerId]) {
      peerConnections[senderPeerId].addIceCandidate(candidate)
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

  const setRemoteStream = (event: any, remotePeerId: string) => {
    if (event.track.kind === 'video') {
      setRemoteStreams((prevStreams) => {
        const newStreams = new Map(prevStreams)
        newStreams.set(remotePeerId, event.streams[0])
        return newStreams
      })
    }
  }

  const createOffer = async (rtcPeerConnection: RTCPeerConnection, remotePeerId: string) => {
    let sessionDescription
    try {
      sessionDescription = await rtcPeerConnection.createOffer(offerOptions)
      rtcPeerConnection.setLocalDescription(sessionDescription)
    } catch (error) {
      console.error(error)
    }

    socket.emit('peer_offer', {
      type: 'peer_offer',
      sdp: sessionDescription,
      roomId: roomId,
      senderId: localPeerId.current,
      receiverId: remotePeerId,
    })
  }

  const createAnswer = async (rtcPeerConnection: RTCPeerConnection, remotePeerId: string) => {
    let sessionDescription
    try {
      sessionDescription = await rtcPeerConnection.createAnswer(offerOptions)
      rtcPeerConnection.setLocalDescription(sessionDescription)
    } catch (error) {
      console.error(error)
    }

    socket.emit('peer_answer', {
      type: 'peer_answer',
      sdp: sessionDescription,
      roomId: roomId,
      senderId: localPeerId.current,
      receiverId: remotePeerId,
    })
  }

  const sendIceCandidate = (event: any, remotePeerId: string) => {
    if (event.candidate) {
      socket.emit('peer_ice_candidate', {
        senderId: localPeerId.current,
        receiverId: remotePeerId,
        roomId: roomId,
        label: event.candidate.sdpMLineIndex,
        candidate: event.candidate.candidate,
      })
    }
  }

  const addLocalTracks = async (rtcPeerConnection: RTCPeerConnection) => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track: any) => {
        rtcPeerConnection.addTrack(track, localStreamRef.current!)
      })
    }
  }

  const checkPeerDisconnect = (remotePeerId: string) => {
    const state = peerConnections[remotePeerId].iceConnectionState

    if (state === 'failed' || state === 'closed' || state === 'disconnected') {
      const videoDisconnected = document.getElementById('remotevideo_' + remotePeerId)

      if (videoDisconnected) {
        videoDisconnected.remove()
      }

      if (peerConnections[remotePeerId]) {
        peerConnections[remotePeerId].close()
        delete peerConnections[remotePeerId]
      }

      console.log(`Peer ${remotePeerId} has been disconnected`)
    }
  }

  const sendChatMessage = () => {
    socket.emit('send_chat', {
      roomId: roomId,
      sender: localPeerId.current,
      message: chatInput,
    })

    setChatMessages((prev) => [...prev, { sender: localPeerId.current, message: chatInput }])
    setChatInput('')
  }

  const onReceiveChat = (data: { sender: string; message: string }) => {
    setChatMessages((prev) => [...prev, data])
  }

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks()[0].enabled = !localStream.getVideoTracks()[0].enabled
    }
  }

  return (
    <div ref={videoChatContainerRef}>
      <video width="100" height="100" ref={userVideo} autoPlay muted />
      {Array.from(remoteStreams.entries()).map(([peerId, stream]) => (
        <RemoteVideo key={peerId} peerId={peerId} stream={stream} />
      ))}
      <button onClick={toggleVideo}>Toggle Video</button>
      <div>
        <div>
          {chatMessages.map((msg, idx) => (
            <div key={idx}>
              <strong>{msg.sender}</strong>: {msg.message}
            </div>
          ))}
        </div>
        <div>
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyUp={(e) => handleKeyUp(e, sendChatMessage)}
          />
          <button onClick={() => sendChatMessage()}>Send</button>
        </div>
      </div>
    </div>
  )
}
