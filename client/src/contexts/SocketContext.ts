import { createContext } from 'react'

import { Manager } from 'socket.io-client'

import { VITE_BASE_URL } from '@/configs/env'
import { SocketType } from '@/typings/index'

// FIXME: domain
const manager = new Manager(VITE_BASE_URL, {})

/**
 * Declare main namespace for the socket connection.
 */
export const socket = manager.socket('/')

export const SocketContext = createContext<SocketType>(socket)
