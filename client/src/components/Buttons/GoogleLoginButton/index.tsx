import { useEffect } from 'react'

import { VITE_GOOGLE_CLIENT_ID } from '@/configs/env'

import styles from './index.module.css'

interface GoogleLoginButtonProps {
  onSuccess(credential: any): void
  onError(error: Error): void
}

export const GoogleLoginButton = ({ onSuccess, onError }: GoogleLoginButtonProps) => {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => initializeGoogleSignIn()
    script.onerror = () => onError(new Error('Failed to load the Google Sign In script.'))
    document.body.appendChild(script)
  }, [onError])

  const initializeGoogleSignIn = () => {
    try {
      window.google.accounts.id.initialize({
        client_id: VITE_GOOGLE_CLIENT_ID,
        callback: onSuccess,
      })
      window.google.accounts.id.renderButton(document.getElementById('g_btn'), { theme: 'outline', size: 'large' })
      window.google.accounts.id.prompt()
    } catch (error) {
      onError(error as Error)
    }
  }

  return <div className={styles.buttonContainer} id="g_btn"></div>
}
