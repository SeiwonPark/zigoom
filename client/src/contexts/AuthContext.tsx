import { ReactNode, createContext, useContext, useEffect, useState } from 'react'

import { VITE_BASE_URL } from '@/configs/env'
import axios from '@/configs/http'

interface AuthState {
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthContextType {
  authState: AuthState
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>
}

interface AuthProviderProps {
  children: ReactNode
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Deals with Authentication related context
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>({ isLoading: true, isAuthenticated: false })

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('authToken')

        if (!token) {
          setAuthState({ isLoading: false, isAuthenticated: false })
          return
        }

        await axios.post(`${VITE_BASE_URL}/v1/auth/verify`, { provider: 'google', token: token }) // FIXME: dynamic provider

        setAuthState({ isLoading: false, isAuthenticated: true })
      } catch (error) {
        setAuthState({ isLoading: false, isAuthenticated: false })
      }
    }

    verifyAuth()
  }, [])

  return <AuthContext.Provider value={{ authState, setAuthState }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth should be wrapped by AuthContext')
  }
  return context
}
