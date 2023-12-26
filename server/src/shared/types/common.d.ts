import type { TokenPayload } from 'google-auth-library'

export interface Guest {
  id: string
  name: string
  isGuest: boolean
}

export type Token = TokenPayload & Guest
