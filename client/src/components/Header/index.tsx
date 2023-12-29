import { CSSProperties, MouseEvent, useCallback, useEffect, useRef, useState } from 'react'

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
import { decodeGoogleJWT } from '@/utils/string'
import { GoogleJWTPayload, GoogleJWTRequestPayload } from '@/validations/auth.validation'

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
  const { isAuthenticated, setIsAuthenticated } = useAuthStore()
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

  const userData = useCallback(() => {
    return getLocalStorageItem<GoogleJWTPayload>('user')
  }, [])

  // FIXME: This should be fixed to use adapters properly.
  const handleLoginSuccess = useCallback(async (credential: string) => {
    try {
      const { payload } = decodeGoogleJWT(credential)
      storeDataInLocalStorage<GoogleJWTRequestPayload>('user', {
        authProvider: 'google',
        email: payload.email,
        familyName: payload.family_name,
        givenName: payload.given_name,
        locale: payload.locale,
        name: payload.name,
        picture: payload.picture,
        sub: payload.sub,
      })

      const res = await axios.post(`${VITE_BASE_URL}/v1/auth/verify`, JSON.stringify({ token: credential }), {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      setIsAuthenticated(res.status === 200)
    } catch (e) {
      console.error(e)
    }
  }, [])

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
      <nav>
        {/* <ul className={styles.menuList}>
          <li className={styles.menu}>page</li>
        </ul> */}
      </nav>
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
              {userData() !== null && (
                <div className={styles.profileImage} ref={profileRef} onClick={handleClickProfile}>
                  <img
                    src={userData()!.picture.replace('=s96-c', '=l96-c') || Unnamed}
                    alt="user"
                    style={{ width: '40px', borderRadius: '20px' }}
                  />
                </div>
              )}
              {toggleProfile && (
                <ProfileModal
                  userData={userData()}
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
