import { CSSProperties, MouseEvent, useCallback, useEffect, useRef, useState } from 'react'

import { css } from '@emotion/react'
import { CredentialResponse, GoogleLogin, googleLogout } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'

import { Unnamed } from '@/assets/images'
import { ProfileModal } from '@/components/ProfileModal'
import { SkeletonLoginButton } from '@/components/skeletons/SkeletonLoginButton'
import { VITE_BASE_URL } from '@/configs/env'
import axios from '@/configs/http'
import { useAuthStore } from '@/hooks/useStore'
import { getLocalStorageItem, storeDataInLocalStorage } from '@/utils/localStorage'
import { decodeGoogleJWT } from '@/utils/string'
import { GoogleJWTPayload, isCredentialResponse } from '@/validations/auth.validation'

interface HeaderProps {
  style?: CSSProperties
  enterGuestMode?: () => void
}

export const Header = ({ style, enterGuestMode }: HeaderProps) => {
  const [windowWidth, setWindowWidth] = useState<number>(globalThis.innerWidth)
  const [toggleProfile, setToggleProfile] = useState<boolean>(false)
  const [showSkeleton, setShowSkeleton] = useState<boolean>(true)
  const { isAuthenticated, setIsAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkeleton(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

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

  const handleLoginSuccess = useCallback(async (credentialResponse: CredentialResponse) => {
    try {
      if (!isCredentialResponse(credentialResponse)) {
        throw new Error(
          'Invalid credential response. Received "success" response, but failed to validate the response object. Check Google API or GoogleLogin component for more details.'
        )
      }

      const { payload } = decodeGoogleJWT(credentialResponse.credential)
      storeDataInLocalStorage<GoogleJWTPayload>('user', payload)

      const res = await axios.post(
        `${VITE_BASE_URL}/v1/auth/verify`,
        JSON.stringify({ token: credentialResponse.credential }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      setIsAuthenticated(res.status === 200)
    } catch (e) {
      console.error(e)
    }
  }, [])

  const handleClickProfile = (_: MouseEvent) => {
    setToggleProfile(!toggleProfile)
  }

  const handleEnterGuestMode = async () => {
    googleLogout()
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
        {!isAuthenticated && (
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
                padding: 0.6rem 1rem;
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
            <div
              css={css`
                display: flex;
                align-items: center;
                justify-content: center;
                width: ${windowWidth > 500 ? '200px' : '40px'};
              `}
            >
              {showSkeleton ? (
                <SkeletonLoginButton width={windowWidth > 500 ? '196px' : '40px'} />
              ) : (
                <GoogleLogin
                  useOneTap
                  type={windowWidth > 500 ? 'standard' : 'icon'}
                  theme="outline"
                  onSuccess={async (credentialResponse) => handleLoginSuccess(credentialResponse)}
                  onError={() => {
                    console.log('Login Failed')
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
