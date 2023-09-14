import { createRef, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { css } from '@emotion/react'
import { SocketEvent, VideoElement } from '../typings/types'
import { iceServers, mediaConstraints, offerOptions } from '../configs/webrtc'
import { SocketContext } from '../contexts/SocketContext'
import { ControlBar } from './ControlBar'
import { ChatBox } from './ChatBox'
import { Video } from './Video'

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

  useEffect(() => {
    setSocketListeners()
    socket.emit('join', { roomId: roomId, peerId: localPeerId.current })

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

  const grids = [
    [
      { rowStart: 1, rowEnd: 7, colStart: 1, colEnd: 7 }, // n = 0
      { rowStart: 1, rowEnd: 7, colStart: 1, colEnd: 7 },
    ],
    [
      { rowStart: 1, rowEnd: 7, colStart: 1, colEnd: 7 }, // n = 1
      { rowStart: 1, rowEnd: 7, colStart: 1, colEnd: 7 },
    ],
    [
      { rowStart: 1, rowEnd: 7, colStart: 1, colEnd: 4 }, // n = 2
      { rowStart: 1, rowEnd: 7, colStart: 4, colEnd: 7 },
      { rowStart: 1, rowEnd: 7, colStart: 4, colEnd: 7 },
    ],
    [
      { rowStart: 1, rowEnd: 4, colStart: 1, colEnd: 4 }, // n = 3
      { rowStart: 1, rowEnd: 4, colStart: 4, colEnd: 7 },
      { rowStart: 4, rowEnd: 7, colStart: 2, colEnd: 6 },
      { rowStart: 4, rowEnd: 7, colStart: 2, colEnd: 6 },
    ],
    [
      { rowStart: 1, rowEnd: 4, colStart: 1, colEnd: 4 }, // n = 4
      { rowStart: 1, rowEnd: 4, colStart: 4, colEnd: 7 },
      { rowStart: 4, rowEnd: 7, colStart: 1, colEnd: 4 },
      { rowStart: 4, rowEnd: 7, colStart: 4, colEnd: 7 },
      { rowStart: 4, rowEnd: 7, colStart: 4, colEnd: 7 },
    ],
    [
      { rowStart: 1, rowEnd: 4, colStart: 1, colEnd: 3 }, // n = 5
      { rowStart: 1, rowEnd: 4, colStart: 3, colEnd: 5 },
      { rowStart: 1, rowEnd: 4, colStart: 5, colEnd: 7 },
      { rowStart: 4, rowEnd: 7, colStart: 2, colEnd: 4 },
      { rowStart: 4, rowEnd: 7, colStart: 4, colEnd: 6 },
      { rowStart: 4, rowEnd: 7, colStart: 4, colEnd: 6 },
    ],
    [
      { rowStart: 1, rowEnd: 4, colStart: 1, colEnd: 3 }, // n = 6
      { rowStart: 1, rowEnd: 4, colStart: 3, colEnd: 5 },
      { rowStart: 1, rowEnd: 4, colStart: 5, colEnd: 7 },
      { rowStart: 4, rowEnd: 7, colStart: 1, colEnd: 3 },
      { rowStart: 4, rowEnd: 7, colStart: 3, colEnd: 5 },
      { rowStart: 4, rowEnd: 7, colStart: 5, colEnd: 7 },
      { rowStart: 4, rowEnd: 7, colStart: 5, colEnd: 7 },
    ],
    [
      { rowStart: 1, rowEnd: 3, colStart: 1, colEnd: 3 }, // n = 7
      { rowStart: 1, rowEnd: 3, colStart: 3, colEnd: 5 },
      { rowStart: 1, rowEnd: 3, colStart: 5, colEnd: 7 },
      { rowStart: 3, rowEnd: 5, colStart: 1, colEnd: 3 },
      { rowStart: 3, rowEnd: 5, colStart: 3, colEnd: 5 },
      { rowStart: 3, rowEnd: 5, colStart: 5, colEnd: 7 },
      { rowStart: 5, rowEnd: 7, colStart: 3, colEnd: 5 },
      { rowStart: 5, rowEnd: 7, colStart: 3, colEnd: 5 },
    ],
    [
      { rowStart: 1, rowEnd: 3, colStart: 1, colEnd: 3 }, // n = 8
      { rowStart: 1, rowEnd: 3, colStart: 3, colEnd: 5 },
      { rowStart: 1, rowEnd: 3, colStart: 5, colEnd: 7 },
      { rowStart: 3, rowEnd: 5, colStart: 1, colEnd: 3 },
      { rowStart: 3, rowEnd: 5, colStart: 3, colEnd: 5 },
      { rowStart: 3, rowEnd: 5, colStart: 5, colEnd: 7 },
      { rowStart: 5, rowEnd: 7, colStart: 2, colEnd: 4 },
      { rowStart: 5, rowEnd: 7, colStart: 4, colEnd: 6 },
      { rowStart: 5, rowEnd: 7, colStart: 4, colEnd: 6 },
    ],
    [
      { rowStart: 1, rowEnd: 3, colStart: 1, colEnd: 3 }, // n = 9
      { rowStart: 1, rowEnd: 3, colStart: 3, colEnd: 5 },
      { rowStart: 1, rowEnd: 3, colStart: 5, colEnd: 7 },
      { rowStart: 3, rowEnd: 5, colStart: 1, colEnd: 3 },
      { rowStart: 3, rowEnd: 5, colStart: 3, colEnd: 5 },
      { rowStart: 3, rowEnd: 5, colStart: 5, colEnd: 7 },
      { rowStart: 5, rowEnd: 7, colStart: 1, colEnd: 3 },
      { rowStart: 5, rowEnd: 7, colStart: 3, colEnd: 5 },
      { rowStart: 5, rowEnd: 7, colStart: 5, colEnd: 7 },
      { rowStart: 5, rowEnd: 7, colStart: 5, colEnd: 7 },
    ],
  ]

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
          display: grid;
          grid-template-rows: repeat(6, 1fr);
          grid-template-columns: repeat(6, 1fr);
          grid-gap: 60px;
          align-items: center;
          justify-content: center;
        `}
      >
        <div
          css={css`
            width: 100%;
            height: 100%;
            grid-row-start: ${grids[1 + remoteStreams.size][0].rowStart};
            grid-row-end: ${grids[1 + remoteStreams.size][0].rowEnd};
            grid-column-start: ${grids[1 + remoteStreams.size][0].colStart};
            grid-column-end: ${grids[1 + remoteStreams.size][0].colEnd};
          `}
        >
          <Video stream={localStream} peerId="You" numOfparticipants={1 + remoteStreams.size} />
        </div>
        {Array.from(remoteStreams.entries()).map(([peerId, stream]: [string, MediaStream], index: number) => {
          if (!remoteVideoRefs.current.has(peerId)) {
            remoteVideoRefs.current.set(peerId, createRef())
          }

          return (
            <div
              key={index}
              css={css`
                width: 100%;
                height: 100%;
                grid-row-start: ${grids[1 + remoteStreams.size][index + 1].rowStart};
                grid-row-end: ${grids[1 + remoteStreams.size][index + 1].rowEnd};
                grid-column-start: ${grids[1 + remoteStreams.size][index + 1].colStart};
                grid-column-end: ${grids[1 + remoteStreams.size][index + 1].colEnd};
              `}
            >
              <Video key={peerId} stream={stream} peerId={peerId} numOfparticipants={1 + remoteStreams.size} />
            </div>
          )
        })}
      </div>
      <ChatBox roomId={roomId} isChatOpen={isChatOpen} localPeerId={localPeerId.current} toggleChat={toggleChat} />
      {/* FIXME: isChatOpen to be global state */}
      <ControlBar roomId={roomId} localStream={localStream} isChatOpen={isChatOpen} toggleChat={toggleChat} />
    </div>
  )
}
