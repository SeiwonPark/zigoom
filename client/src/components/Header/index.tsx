import { CSSProperties, MouseEvent, useCallback, useEffect, useRef, useState } from 'react'

import { AxiosError } from 'axios'
import { useNavigate } from 'react-router-dom'

import { LogoIcon } from '@/assets/icons'
import { GoogleLoginButton } from '@/components/Buttons/GoogleLoginButton'
import Dropdown from '@/components/Dropdown'
import { ProfileModal } from '@/components/ProfileModal'
import { VITE_BASE_URL } from '@/configs/env'
import axios from '@/configs/http'
import { useAuth } from '@/contexts/AuthContext'
import { useUserStore } from '@/hooks/useStore'

import { SVGIcon } from '../Buttons'
import { HamburgerMenu } from '../HamburgerMenu'
import { Spinner } from '../Spinner'
import styles from './index.module.css'

interface HeaderProps {
  style?: CSSProperties
  enterGuestMode?: () => void
}

export const Header = ({ style, enterGuestMode }: HeaderProps) => {
  const [toggleProfile, setToggleProfile] = useState<boolean>(false)
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth)
  const { authState, setAuthState } = useAuth()
  const { user, setUser } = useUserStore()
  const navigate = useNavigate()

  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const getUserData = useCallback(async () => {
    try {
      const res = await axios.get(`${VITE_BASE_URL}/v1/user`, {
        params: {
          include: true,
        },
      })

      if (res.status === 200) {
        setUser(res.data)
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    }
  }, [])

  useEffect(() => {
    if (authState.isAuthenticated) {
      getUserData()
    }
  }, [authState.isAuthenticated])

  const handleLoginSuccess = useCallback(
    async (credential: string) => {
      try {
        const normalizedCredential = credential.replace('"', '').replace("'", '')

        localStorage.setItem('authToken', normalizedCredential)
        const res = await axios.post(`${VITE_BASE_URL}/v1/auth/verify`, {
          provider: 'google',
          token: normalizedCredential,
        })

        if (res.status === 200) {
          setAuthState({ ...authState, isAuthenticated: true })
        }
      } catch (e) {
        const error = e as AxiosError
        if (error.response && error.response.status === 303) {
          navigate('/register')
        } else {
          console.error(error)
          setAuthState({ ...authState, isAuthenticated: false })
        }
      }
    },
    [authState, setAuthState, navigate]
  )

  const handleLoginError = useCallback((error: any) => {
    console.error('Login error:', error)
  }, [])

  const handleClickProfile = (_: MouseEvent) => {
    setToggleProfile(!toggleProfile)
  }

  const handleEnterGuestMode = async () => {
    localStorage.clear()

    if (enterGuestMode) {
      enterGuestMode()
    }
  }

  return (
    <header className={styles.header} style={style}>
      <div className={styles.title} onClick={() => navigate('/')}>
        {windowWidth <= 600 && <HamburgerMenu />}
        <SVGIcon Icon={LogoIcon} width="80px" />
      </div>
      <div className={styles.authContainer}>
        {!authState.isLoading && !authState.isAuthenticated && enterGuestMode && (
          <div className={styles.guestContainer}>
            <button className={styles.guestButton} id="guestButton" type="button" onClick={handleEnterGuestMode}>
              GUEST
            </button>
          </div>
        )}
        {authState.isLoading ? (
          <Spinner />
        ) : (
          <div className={styles.userContainer}>
            {authState.isAuthenticated ? (
              <div>
                {user !== null && (
                  <div className={styles.profileImage} ref={profileRef} onClick={handleClickProfile}>
                    <img src={user.profileThumbnail} alt="user" style={{ width: '40px', borderRadius: '20px' }} />
                  </div>
                )}
                {toggleProfile && (
                  <ProfileModal userData={user} onClose={handleClickProfile} setToggleProfile={setToggleProfile} />
                )}
              </div>
            ) : (
              <Dropdown title="Login">
                <GoogleLoginButton
                  onSuccess={(credential: any) => handleLoginSuccess(credential.credential)}
                  onError={handleLoginError}
                />
              </Dropdown>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
