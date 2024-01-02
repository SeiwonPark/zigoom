import { CSSProperties, MouseEvent, useCallback, useEffect, useRef, useState } from 'react'

import { AxiosError } from 'axios'
import { useNavigate } from 'react-router-dom'

import { LogoIcon } from '@/assets/icons'
import { Unnamed } from '@/assets/images'
import { GoogleLoginButton } from '@/components/Buttons/GoogleLoginButton'
import Dropdown from '@/components/Dropdown'
import { ProfileModal } from '@/components/ProfileModal'
import { VITE_BASE_URL } from '@/configs/env'
import axios from '@/configs/http'
import { useAuthStore } from '@/hooks/useStore'
import { getLocalStorageItem, storeDataInLocalStorage } from '@/utils/localStorage'
import { GetUserResponse } from '@/validations/user.validation'

import { SVGIcon } from '../Buttons'
import { HamburgerMenu } from '../HamburgerMenu'
import styles from './index.module.css'

interface HeaderProps {
  style?: CSSProperties
  enterGuestMode?: () => void
}

export const Header = ({ style, enterGuestMode }: HeaderProps) => {
  const [toggleProfile, setToggleProfile] = useState<boolean>(false)
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth)
  const [userData, setUserData] = useState<GetUserResponse>()
  const { isAuthenticated, setIsAuthenticated, setAuthToken } = useAuthStore()
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
        setUserData(res.data)
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      const token = getLocalStorageItem<string>('authToken')
      if (token) {
        setAuthToken(token)
        setIsAuthenticated(true)
        await getUserData()
      } else {
        const res = await axios.post(
          `${VITE_BASE_URL}/v1/auth/verify`,
          JSON.stringify({ provider: 'google', token: token })
        )
        if (res.status === 200) {
          setIsAuthenticated(true)
          await getUserData()
        }
      }
    }

    init()
  }, [getUserData, setAuthToken, setIsAuthenticated])

  const handleLoginSuccess = useCallback(
    async (credential: string) => {
      try {
        setAuthToken(credential)
        storeDataInLocalStorage('authToken', credential)

        const res = await axios.post(
          `${VITE_BASE_URL}/v1/auth/verify`,
          JSON.stringify({ provider: 'google', token: credential })
        )
        if (res.status === 200) {
          setIsAuthenticated(true)
          await getUserData()
        }
      } catch (e) {
        const error = e as AxiosError
        if (error.response && error.response.status === 303) {
          navigate('/register')
        } else {
          console.error(error)
          setIsAuthenticated(false)
        }
      }
    },
    [getUserData, navigate, setIsAuthenticated, setAuthToken]
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
      <nav>{/* Navigation menu can be added here */}</nav>
      <div className={styles.authContainer}>
        {!isAuthenticated && enterGuestMode && (
          <div className={styles.guestContainer}>
            <button className={styles.guestButton} id="guestButton" type="button" onClick={handleEnterGuestMode}>
              GUEST
            </button>
          </div>
        )}
        <div className={styles.userContainer}>
          {isAuthenticated ? (
            <div>
              {userData !== null && (
                <div className={styles.profileImage} ref={profileRef} onClick={handleClickProfile}>
                  <img
                    src={userData?.profileThumbnail || Unnamed}
                    alt="user"
                    style={{ width: '40px', borderRadius: '20px' }}
                  />
                </div>
              )}
              {toggleProfile && (
                <ProfileModal
                  userData={userData}
                  onClose={handleClickProfile}
                  setIsAuthenticated={setIsAuthenticated}
                  setToggleProfile={setToggleProfile}
                />
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
      </div>
    </header>
  )
}
