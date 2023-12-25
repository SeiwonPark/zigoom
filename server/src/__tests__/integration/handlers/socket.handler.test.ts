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

  const TEST_ROOM_ID = '123e4567-e89b-12d3-a456-426614174000'
  const WRONG_TEST_ROOM_ID = 'abcd'

  // jest.mocked(createTURNCredentials).mockResolvedValue({ username: 'mocked-username', password: 'mocked-password' })

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

      /**
       * Setup servers to listen to events
       */
      io.on('connection', (socket: any) => {
        serverSocket = socket
      })
      setupSocketHandlers(io)

      clientSocket.on('connect', () => {
        clientSocket.emit('join', { roomId: TEST_ROOM_ID })
        clientSocket.on('room_created', (payload) => {
          if (payload.roomId === TEST_ROOM_ID) {
            done()
          }
        })
      })

      participantSocket.on('connect', () => {
        participantSocket.emit('join', { roomId: TEST_ROOM_ID })
        participantSocket.on('room_joined', (payload) => {
          if (payload.roomId === TEST_ROOM_ID) {
            done()
          }
        })
      })
    })
  })

  afterAll(() => {
    /**
     * SHOULD be closed.
     */
    clientSocket.close()
    participantSocket.close()
    io.close()
    serverSocket.disconnect()
  })

  test('should work with onJoin', (done) => {
    clientSocket.emit('join', { roomId: TEST_ROOM_ID })

    clientSocket.on('room_joined', (payload) => {
      expect(payload).toHaveProperty('roomId', TEST_ROOM_ID)
      expect(payload).toHaveProperty('peerId', clientSocket.id)
      done()
    })
  })

  test('should fail with onJoin if payload is invalid', (done) => {
    clientSocket.on('error', (error) => {
      expect(error).toMatch('Invalid payload type for JoinSchema.')
      done()
    })

    clientSocket.emit('join', { roomId: WRONG_TEST_ROOM_ID })
  })

  test('should work with onCall', (done) => {
    participantSocket.emit('call', { roomId: TEST_ROOM_ID, senderId: participantSocket.id })

    clientSocket.on('call', (payload) => {
      expect(payload).toHaveProperty('senderId', participantSocket.id)
      expect(payload).toHaveProperty('username', 'mocked-username')
      expect(payload).toHaveProperty('credential', 'mocked-password')
      done()
    })
  })

  test('should fail with onCall if payload is invalid', (done) => {
    participantSocket.emit('call', { roomId: WRONG_TEST_ROOM_ID, senderId: participantSocket.id })

    participantSocket.on('error', (error) => {
      expect(error).toMatch('Invalid payload type for CallSchema.')
      done()
    })
  })
})
