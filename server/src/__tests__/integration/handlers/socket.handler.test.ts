import { setupSocketHandlers } from '@handlers/socket.handler'

import { createServer } from 'node:http'
import { type AddressInfo } from 'node:net'
import { Server } from 'socket.io'
import { type Socket as ClientSocket, io as ioc } from 'socket.io-client'
import { type DefaultEventsMap } from 'socket.io/dist/typed-events'

/**
 * Describes both client and server socket behavior.
 */
describe('Socket Handler Integration Tests', () => {
  let io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
  let clientSocket: ClientSocket

  beforeAll((done) => {
    const httpServer = createServer()
    io = new Server(httpServer)

    httpServer.listen(() => {
      /**
       * Grabs unused port arbitrarily
       */
      const PORT = (httpServer.address() as AddressInfo).port
      clientSocket = ioc(`http://localhost:${PORT}`)

      /**
       * Setup servers to listen to events
       */
      setupSocketHandlers(io)

      clientSocket.on('connect', done)
    })
  })

  afterAll(() => {
    /**
     * SHOULD be closed.
     */
    io.close()
    clientSocket.close()
  })

  test('should work with onJoin', (done) => {
    const TEST_ROOM_ID = '123e4567-e89b-12d3-a456-426614174000'

    let roomCreatedOrJoined = false

    clientSocket.emit('join', { roomId: TEST_ROOM_ID })

    clientSocket.on('room_joined', (data) => {
      expect(roomCreatedOrJoined).toBeFalsy()
      roomCreatedOrJoined = true

      expect(data).toHaveProperty('roomId', TEST_ROOM_ID)
      expect(data).toHaveProperty('peerId', clientSocket.id)
      done()
    })

    clientSocket.on('room_created', (data) => {
      expect(roomCreatedOrJoined).toBeFalsy()
      roomCreatedOrJoined = true

      expect(data).toHaveProperty('roomId', TEST_ROOM_ID)
      expect(data).toHaveProperty('peerId', clientSocket.id)
      done()
    })
  })

  test('should fail with onJoin if roomId is invalid', (done) => {
    const TEST_ROOM_ID = 'abcd'

    clientSocket.on('error', (errorMsg) => {
      expect(errorMsg).toMatch('Invalid payload type for JoinSchema.')
      done()
    })

    clientSocket.emit('join', { roomId: TEST_ROOM_ID })
  })
})
