import { create } from 'zustand'

import { LocalOptions } from '@/typings/index'

interface LocalOptionState extends LocalOptions {
  setIsVideoOn: (value: boolean) => void
  setIsAudioOn: (value: boolean) => void
  setPinnedPeerId: (value: string) => void
  setIsChatOpen: (value: boolean) => void
}

interface AuthState {
  authToken: string
  isAuthenticated: boolean
  setIsAuthenticated: (value: boolean) => void
  setAuthToken: (value: string) => void
}

interface SessionState {
  isGranted: boolean
  setIsGranted: (value: boolean) => void
}

/**
 * Stores states of client's local media options.
 */
const useLocalOption = create<LocalOptionState>((set) => ({
  isVideoOn: false,
  isAudioOn: false,
  isChatOpen: false,
  pinnedPeerId: '',
  setIsVideoOn: (value: boolean) => set((state: LocalOptions) => ({ ...state, isVideoOn: value })),
  setIsAudioOn: (value: boolean) => set((state: LocalOptions) => ({ ...state, isAudioOn: value })),
  setPinnedPeerId: (value: string) => set((state: LocalOptions) => ({ ...state, pinnedPeerId: value })),
  setIsChatOpen: (value: boolean) => set((state: LocalOptions) => ({ ...state, isChatOpen: value })),
}))

/**
 * Stores states of client's authentication. Though it's been set by unpredictable operation, server
 * verifies every single request with authorization process.
 */
const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  authToken: '',
  setIsAuthenticated: (value: boolean) => set((state) => ({ ...state, isAuthenticated: value })),
  setAuthToken: (value: string) => set((state) => ({ ...state, authToken: value })),
}))

const useSessionStore = create<SessionState>((set) => ({
  isGranted: false,
  setIsGranted: (value: boolean) => set((state) => ({ ...state, isGranted: value })),
}))

export { useLocalOption, useAuthStore, useSessionStore }
