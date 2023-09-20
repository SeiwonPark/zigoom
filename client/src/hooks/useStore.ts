import { create } from 'zustand'
import { LocalOptions } from '../typings/types'

interface LocalOptionState extends LocalOptions {
  setIsVideoOn: () => void
  setIsAudioOn: () => void
}

export const useLocalOption = create<LocalOptionState>((set) => ({
  isVideoOn: false,
  isAudioOn: false,
  setIsVideoOn: () => set((state: LocalOptions) => ({ ...state, isVideoOn: !state.isVideoOn })),
  setIsAudioOn: () => set((state: LocalOptions) => ({ ...state, isAudioOn: !state.isAudioOn })),
}))
