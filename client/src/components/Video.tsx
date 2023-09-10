import { createRef, useContext, useEffect, useRef, useState } from 'react'
import { css } from '@emotion/react'
import { SocketEvent, VideoElement } from '../typings/types'
import { RemoteVideo } from './RemoteVideo'
import { iceServers, mediaConstraints, offerOptions } from '../configs/webrtc'
import { SocketContext } from '../contexts/SocketContext'
import { ControlBar } from './ControlBar'
import { Chat } from './Chat'
import { IconButton } from './IconButton'
import CloseIcon from '../assets/icons/close.svg'

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
      `}
    >
      <div
        css={css`
          width: 100%;
          height: calc(100% - 5rem);
          display: flex;
          align-items: center;
          justify-content: center;
        `}
      >
        <video
          ref={userVideo}
          css={css`
            min-width: 200px;
            width: 90%;
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
      <div
        css={css`
          height: calc(100% - 5rem);
          background-color: rgb(32, 33, 36);
          min-width: ${isChatOpen ? 'max(25%, 300px)' : '0px'};
          width: ${isChatOpen ? 'max(25%, 300px)' : '0px'};
          overflow-y: scroll;
          transition: width 0.28s;
          display: flex;
          justify-content: center;
          align-items: center;
        `}
      >
        <div
          css={css`
            padding: 1rem;
            margin-right: 2rem;
            width: 100%;
            height: 90%;
            border-radius: 16px;
            background-color: #fff;
          `}
        >
          <div
            css={css`
              display: flex;
              align-items: center;
            `}
          >
            <span
              css={css`
                line-height: 1.5rem;
                font-size: 1.125rem;
                letter-spacing: 0;
                font-weight: 400;
                align-items: center;
                box-sizing: border-box;
                display: flex;
                flex-direction: row;
                height: 4rem;
                min-height: 4rem;
                padding-left: 1rem;
              `}
            >
              In-call messages
            </span>
            <div
              css={css`
                display: flex;
                align-items: center;
                margin-left: auto;
              `}
            >
              <IconButton Icon={CloseIcon} onClick={toggleChat} />
            </div>
          </div>
          <Chat roomId={roomId} localPeerId={localPeerId} />
        </div>
      </div>
      {/* FIXME: isChatOpen to be global state */}
      <ControlBar roomId={roomId} localStream={localStream} isChatOpen={isChatOpen} toggleChat={toggleChat} />
    </div>
  )
}
