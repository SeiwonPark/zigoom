import { AuthTokenSchema } from '@modules/users/validations/auth.validation'

export interface Guest {
  id: string
  name: string
  isGuest: boolean
}

export type Token = AuthTokenSchema & Guest

export enum AuthProviderType {
  GOOGLE = 'google',
}
