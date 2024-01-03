import { create } from 'zustand'

import { LocalOptions } from '@/typings/index'
import { GetUserResponse } from '@/validations/user.validation'

interface LocalOptionState extends LocalOptions {
  setIsVideoOn: (value: boolean) => void
  setIsAudioOn: (value: boolean) => void
  setPinnedPeerId: (value: string) => void
  setIsChatOpen: (value: boolean) => void
}

interface UserState {
  user: GetUserResponse
  setUser: (value: GetUserResponse) => void
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
 * Stores states of client's user data. Server verifies every single request with authorization process.
 */
const useUserStore = create<UserState>((set) => ({
  user: {
    id: '',
    name: '',
    profileThumbnail: 'https://zigoom-public-assets.s3.ap-northeast-2.amazonaws.com/profile.png',
    sessionId: null,
    createdAt: '',
    modifiedAt: '',
    role: '',
    profile: null,
    authProvider: [
      {
        id: '',
        provider: '',
        providerId: '',
        userId: '',
      },
    ],
  },
  setUser: (value: GetUserResponse) => set((state) => ({ ...state, user: value })),
}))

const useSessionStore = create<SessionState>((set) => ({
  isGranted: false,
  setIsGranted: (value: boolean) => set((state) => ({ ...state, isGranted: value })),
}))

export { useLocalOption, useUserStore, useSessionStore }
