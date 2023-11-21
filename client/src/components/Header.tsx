import { CSSProperties, MouseEvent, useCallback, useEffect, useRef, useState } from 'react'

import { css } from '@emotion/react'
import { useNavigate } from 'react-router-dom'

import { Unnamed } from '@/assets/images'
import { ProfileModal } from '@/components/ProfileModal'
import { VITE_BASE_URL } from '@/configs/env'
import axios from '@/configs/http'
import { useAuthStore } from '@/hooks/useStore'
import { getLocalStorageItem, storeDataInLocalStorage } from '@/utils/localStorage'
import { decodeGoogleJWT } from '@/utils/string'
import { GoogleJWTPayload } from '@/validations/auth.validation'

import Dropdown from './Dropdown'
import { GoogleLoginButton } from './buttons/GoogleLoginButton'

interface HeaderProps {
  style?: CSSProperties
  enterGuestMode?: () => void
}

export const Header = ({ style, enterGuestMode }: HeaderProps) => {
  const [windowWidth, setWindowWidth] = useState<number>(globalThis.innerWidth)
  const [toggleProfile, setToggleProfile] = useState<boolean>(false)
  const { isAuthenticated, setIsAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(globalThis.innerWidth)
    }
    globalThis.addEventListener('resize', handleResize)

    return () => {
      globalThis.removeEventListener('resize', handleResize)
    }
  }, [])

  const userData = useCallback(() => {
    return getLocalStorageItem<GoogleJWTPayload>('user')
  }, [])

  const handleLoginSuccess = useCallback(async (credential: string) => {
    try {
      const { payload } = decodeGoogleJWT(credential)
      storeDataInLocalStorage<GoogleJWTPayload>('user', {
        email: payload.email,
        family_name: payload.family_name,
        given_name: payload.given_name,
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
    console.error('Google login error:', error)
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
    <header
      css={css`
        position: fixed;
        width: 100%;
        height: 60px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        -webkit-box-shadow: 0 0 6px 2px rgba(60, 64, 67, 0.3);
        -moz-box-shadow: 0 0 6px 2px rgba(60, 64, 67, 0.3);
        box-shadow: 0 0 6px 2px rgba(60, 64, 67, 0.3);
      `}
      style={style}
    >
      <div
        css={css`
          display: flex;
          align-items: center;
          margin-right: auto;
          margin-left: 2vw;
        `}
      >
        <h1 onClick={() => navigate('/')}>Zigoom</h1>
      </div>
      <nav>
        <ul
          css={css`
            padding: 0;
            display: flex;
            list-style-type: none;
          `}
        >
          <li
            css={css`
              text-align: center;
              padding: 12px;
            `}
          >
            page
          </li>
        </ul>
      </nav>
      <div
        css={css`
          display: flex;
          align-items: center;
          margin-left: auto;
          margin-right: 2vw;
        `}
      >
        {!isAuthenticated && enterGuestMode && (
          <div
            css={css`
              display: flex;
              align-items: center;
              border-radius: 8px;
              cursor: pointer;
              transition: background-color 0.2s;
              white-space: nowrap;
              overflow: hidden;

              &:hover button {
                background-color: #f8f9fa;
                color: #202124;
              }
            `}
          >
            <button
              type="button"
              css={css`
                padding: 1rem;
                font-weight: 600;
                border: none;
                cursor: pointer;
                color: #5f6368;
                background-color: inherit;
                text-transform: uppercase;
              `}
              onClick={handleEnterGuestMode}
            >
              GUEST
            </button>
          </div>
        )}
        <div
          css={css`
            display: flex;
            align-items: center;
            width: fit-content;
            padding: 0.5rem;
          `}
        >
          {isAuthenticated ? (
            <div>
              {userData() !== null && (
                <div
                  ref={profileRef}
                  onClick={handleClickProfile}
                  css={css`
                    display: flex;
                    align-items: center;
                    position: relative;
                    cursor: pointer;
                  `}
                >
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
