import { create } from 'zustand'

import { LocalOptions } from '@/typings/index'

interface LocalOptionState extends LocalOptions {
  setIsVideoOn: (value: boolean) => void
  setIsAudioOn: (value: boolean) => void
}

interface AuthState {
  isAuthenticated: boolean
  setIsAuthenticated: (value: boolean) => void
}

/**
 * Stores states of client's local media options.
 */
const useLocalOption = create<LocalOptionState>((set) => ({
  isVideoOn: false,
  isAudioOn: false,
  setIsVideoOn: (value: boolean) => set((state: LocalOptions) => ({ ...state, isVideoOn: value })),
  setIsAudioOn: (value: boolean) => set((state: LocalOptions) => ({ ...state, isAudioOn: value })),
}))

/**
 * Stores states of client's authentication. Though it's been set by unpredictable operation, server
 * verifies every single request with authorization process.
 */
const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  setIsAuthenticated: (value: boolean) => set((state) => ({ ...state, isAuthenticated: value })),
}))

export { useLocalOption, useAuthStore }
