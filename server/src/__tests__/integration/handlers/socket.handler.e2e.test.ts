import { setupSocketHandlers } from '@handlers/socket.handler'

import { createServer } from 'node:http'
import { type AddressInfo } from 'node:net'
import { Server, type Socket as ServerSocket } from 'socket.io'
import { type Socket as ClientSocket, io as ioc } from 'socket.io-client'
import { type DefaultEventsMap } from 'socket.io/dist/typed-events'

jest.mock('@utils/math', () => ({
  createTURNCredentials: jest.fn().mockReturnValue({ username: 'mocked-username', password: 'mocked-password' }),
}))

/**
 * Describes both client and server socket behavior.
 */
describe('Socket Handler Integration Tests', () => {
  let io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
  let serverSocket: ServerSocket
  let clientSocket: ClientSocket
  let participantSocket: ClientSocket
  let tempClientSocket: ClientSocket

  const TEST_ROOM_ID = '123e4567-e89b-12d3-a456-426614174000'
  const WRONG_TEST_ROOM_ID = 'abcd'

  beforeAll((done) => {
    const httpServer = createServer()
    io = new Server(httpServer)

    httpServer.listen(() => {
      /**
       * Grabs unused port arbitrarily
       */
      const PORT = (httpServer.address() as AddressInfo).port
      clientSocket = ioc(`http://localhost:${PORT}`)
      participantSocket = ioc(`http://localhost:${PORT}`)
      tempClientSocket = ioc(`http://localhost:${PORT}`)

      /**
       * Setup servers to listen to events
       */
      io.on('connection', (socket: any) => {
        serverSocket = socket
      })
      setupSocketHandlers(io)

      /**
       * clientSocket CREATES a room.
       */
      clientSocket.on('connect', () => {
        clientSocket.emit('join', { roomId: TEST_ROOM_ID })
        clientSocket.on('room_created', (payload) => {
          if (payload.roomId === TEST_ROOM_ID) {
            done()
          }
        })
      })

      /**
       * participantSocket JOINS the room.
       */
      participantSocket.on('connect', () => {
        participantSocket.emit('join', { roomId: TEST_ROOM_ID })
        participantSocket.on('room_joined', (payload) => {
          if (payload.roomId === TEST_ROOM_ID) {
            done()
          }
        })
      })

      /**
       * tempClientSocket JOINS the room.
       */
      tempClientSocket.on('connect', () => {
        tempClientSocket.emit('join', { roomId: TEST_ROOM_ID })
        tempClientSocket.on('room_joined', (payload) => {
          if (payload.roomId === TEST_ROOM_ID) {
            done()
          }
        })
      })
    })
  })

  /**
   * FIXME: Is this right? Initializing all 'error' event listeners?
   */
  beforeEach(() => {
    clientSocket.on('error', () => {})
    participantSocket.on('error', () => {})
    tempClientSocket.on('error', () => {})
  })

  afterEach(() => {
    clientSocket.off('error')
    participantSocket.off('error')
    tempClientSocket.off('error')
  })

  afterAll(() => {
    /**
     * SHOULD be closed.
     */
    clientSocket.close()
    participantSocket.close()
    tempClientSocket.close()
    io.close()
    serverSocket.disconnect()
  })

  test('should work with onJoin', (done) => {
    expect.assertions(2)

    clientSocket.emit('join', { roomId: TEST_ROOM_ID })

    clientSocket.on('room_joined', (payload) => {
      expect(payload).toHaveProperty('roomId', TEST_ROOM_ID)
      expect(payload).toHaveProperty('peerId', clientSocket.id)
      done()
    })
  })

  test('should fail with onJoin if payload is invalid', (done) => {
    expect.assertions(1)

    clientSocket.on('error', (error) => {
      expect(error).toMatch('Invalid payload type for JoinSchema.')
      done()
    })

    clientSocket.emit('join', { roomId: WRONG_TEST_ROOM_ID })
  })

  test('should work with onCall', (done) => {
    expect.assertions(3)

    participantSocket.emit('call', { roomId: TEST_ROOM_ID, senderId: participantSocket.id })

    clientSocket.on('call', (payload) => {
      expect(payload).toHaveProperty('senderId', participantSocket.id)
      expect(payload).toHaveProperty('username', 'mocked-username')
      expect(payload).toHaveProperty('credential', 'mocked-password')
      done()
    })
  })

  test('should fail with onCall if payload is invalid', (done) => {
    expect.assertions(1)

    participantSocket.emit('call', { roomId: WRONG_TEST_ROOM_ID, senderId: participantSocket.id })

    participantSocket.on('error', (error) => {
      expect(error).toMatch('Invalid payload type for CallSchema.')
      done()
    })
  })

  test('should work with onPeerOffer', (done) => {
    expect.assertions(3)

    const peerOfferPayload = {
      receiverId: participantSocket.id,
      type: 'offer',
      sdp: 'sample-sdp',
      senderId: clientSocket.id,
    }

    participantSocket.on('peer_offer', (payload) => {
      expect(payload).toHaveProperty('type', 'offer')
      expect(payload).toHaveProperty('sdp', 'sample-sdp')
      expect(payload).toHaveProperty('senderId', clientSocket.id)
      done()
    })

    clientSocket.emit('peer_offer', peerOfferPayload)
  })

  test('should fail with onPeerOffer if payload is invalid', (done) => {
    expect.assertions(1)

    clientSocket.on('error', (error) => {
      expect(error).toMatch('Invalid payload type for PeerOfferSchema.')
      done()
    })

    clientSocket.emit('peer_offer', { invalidData: true })
  })

  test('should work with onPeerAnswer', (done) => {
    expect.assertions(3)

    const peerAnswerPayload = {
      receiverId: clientSocket.id,
      type: 'offer',
      sdp: 'sample-sdp',
      senderId: participantSocket.id,
    }

    clientSocket.on('peer_answer', (payload) => {
      expect(payload).toHaveProperty('type', 'offer')
      expect(payload).toHaveProperty('sdp', 'sample-sdp')
      expect(payload).toHaveProperty('senderId', participantSocket.id)
      done()
    })

    participantSocket.emit('peer_answer', peerAnswerPayload)
  })

  test('should fail with onPeerAnswer if payload is invalid', (done) => {
    expect.assertions(1)

    participantSocket.on('error', (error) => {
      expect(error).toMatch('Invalid payload type for PeerAnswerSchema.')
      done()
    })

    participantSocket.emit('peer_answer', { invalidData: true })
  })

  test('should work with onPeerIceCandidate', (done) => {
    expect.assertions(5)

    const peerIceCandidatePayload = {
      senderId: clientSocket.id,
      receiverId: participantSocket.id,
      roomId: TEST_ROOM_ID,
      candidate: {
        candidate: 'candidate',
        sdpMid: 'sdp-mid',
        sdpMLineIndex: 123,
        usernameFragment: null,
      },
    }

    participantSocket.on('peer_ice_candidate', (payload) => {
      expect(payload).toHaveProperty('senderId', clientSocket.id)
      expect(payload).toHaveProperty('receiverId', participantSocket.id)
      expect(payload.candidate).toHaveProperty('candidate', 'candidate'),
        expect(payload.candidate).toHaveProperty('sdpMid', 'sdp-mid'),
        expect(payload.candidate).toHaveProperty('sdpMLineIndex', 123),
        done()
    })

    clientSocket.emit('peer_ice_candidate', peerIceCandidatePayload)
  })

  test('should fail onPeerIceCandidate if payload is invalid', (done) => {
    expect.assertions(1)

    clientSocket.on('error', (error) => {
      expect(error).toMatch('Invalid payload type for PeerIceCandidateSchema.')
      done()
    })

    clientSocket.emit('peer_ice_candidate', { invalidData: true })
  })

  test('should work with onSendChat', (done) => {
    expect.assertions(2)

    const chatPayload = {
      roomId: TEST_ROOM_ID,
      senderId: clientSocket.id,
      message: 'hi there',
    }

    clientSocket.emit('send_chat', chatPayload)

    participantSocket.on('receive_chat', (payload) => {
      expect(payload).toHaveProperty('senderId', clientSocket.id)
      expect(payload).toHaveProperty('message', 'hi there')
      done()
    })
  })

  test('should fail with onSendChat if payload is invalid', (done) => {
    expect.assertions(1)

    clientSocket.on('error', (error) => {
      expect(error).toMatch('Invalid payload type for SendChatSchema.')
      done()
    })

    clientSocket.emit('send_chat', { invalidData: true })
  })

  /**
   * This works but needs better idea since the host socket is closed.
   */
  // test('should emit `peer_disconnected` when the peer is disconnected', (done) => {
  //   expect.assertions(0)

  //   tempClientSocket.on('peer_disconnected', (payload) => {
  //     tempClientSocket.close()
  //     done()
  //   })

  //   clientSocket.close()
  // })

  test('should work with onToggleVideo', (done) => {
    const toggleVideoPaylod = {
      roomId: TEST_ROOM_ID,
      senderId: clientSocket.id,
      video: true,
    }

    clientSocket.emit('toggle_video', toggleVideoPaylod)

    participantSocket.on('video_status', (payload) => {
      expect(payload).toHaveProperty('senderId', clientSocket.id)
      expect(payload).toHaveProperty('video', true)
      done()
    })
  })

  test('should fail with onToggleVideo if payload is invalid', (done) => {
    clientSocket.on('error', (error) => {
      expect(error).toMatch('Invalid payload type for ToggleVideoSchema.')
      done()
    })

    clientSocket.emit('toggle_video', { invalidData: true })
  })

  test('should work with onToggleAudio', (done) => {
    const toggleAudioPayload = {
      roomId: TEST_ROOM_ID,
      senderId: clientSocket.id,
      audio: true,
    }

    clientSocket.emit('toggle_audio', toggleAudioPayload)

    participantSocket.on('audio_status', (payload) => {
      expect(payload).toHaveProperty('senderId', clientSocket.id)
      expect(payload).toHaveProperty('audio', true)
      done()
    })
  })

  test('should fail with onToggleAudio if payload is invalid', (done) => {
    clientSocket.on('error', (error) => {
      expect(error).toMatch('Invalid payload type for ToggleAudioSchema.')
      done()
    })

    clientSocket.emit('toggle_audio', { invalidData: true })
  })
})
