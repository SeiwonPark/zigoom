import { createContext } from 'react'
import { Manager } from 'socket.io-client'
import { SocketType } from '../typings/types'

// FIXME: domain
const manager = new Manager('http://localhost:5001', {})

/**
 * Declare main namespace for the socket connection.
 */
export const socket = manager.socket('/')

export const SocketContext = createContext<SocketType>(socket)
