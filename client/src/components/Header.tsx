import { CSSProperties, useCallback, useEffect, useState } from 'react'
import { css } from '@emotion/react'
import { GoogleLogin, googleLogout } from '@react-oauth/google'
import { GoogleJWTPayload, isCredentialResponse } from '../validations/auth.validation'
import { VITE_BASE_URL } from '../configs/env'
import { decodeGoogleJWT } from '../utils/string'
import { getLocalStorageItem, storeDataInLocalStorage } from '../utils/localStorage'

interface HeaderProps {
  style?: CSSProperties
}

export const Header = ({ style }: HeaderProps) => {
  const [authenticated, setAuthenticated] = useState<boolean>(false)
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth)

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const checkAuthenticated = useCallback(async () => {
    const res = await fetch(`${VITE_BASE_URL}/v1/auth/check`, {
      method: 'GET',
      credentials: 'include',
    })

    if (res.ok) {
      setAuthenticated(true)
    } else {
      setAuthenticated(false)
    }
  }, [])

  const userData = useCallback(() => {
    return getLocalStorageItem<GoogleJWTPayload>('user')
  }, [])

  const handleLogout = async () => {
    const res = await fetch(`${VITE_BASE_URL}/v1/auth/logout`, { method: 'POST', credentials: 'include' })

    if (res.ok) {
      googleLogout()
      setAuthenticated(false)
      localStorage.clear()
      console.log('Successfully logged out.')
    }
  }

  return (
    <header
      css={css`
        position: fixed;
        width: 100%;
        height: 60px;
        display: flex;
        align-items: center;
        -webkit-box-shadow: 0 0 6px 2px rgba(60, 64, 67, 0.3);
        -moz-box-shadow: 0 0 6px 2px rgba(60, 64, 67, 0.3);
        box-shadow: 0 0 6px 2px rgba(60, 64, 67, 0.3);
      `}
      style={style}
    >
      <button onClick={checkAuthenticated}>check</button>
      <button onClick={handleLogout}>logout</button>
      <div
        css={css`
          display: flex;
          align-items: center;
          margin-left: auto;
        `}
      >
        {!authenticated && (
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
            margin-right: 2vw;
          `}
        >
          {authenticated ? (
            <div>
              {userData() !== null && (
                <div
                  css={css`
                    display: flex;
                    align-items: center;
                  `}
                >
                  <img src={userData()!.picture} alt="user" style={{ width: '40px', borderRadius: '20px' }} />
                </div>
              )}
            </div>
          ) : (
            <GoogleLogin
              useOneTap
              type={windowWidth > 500 ? 'standard' : 'icon'}
              theme={windowWidth > 500 ? 'filled_blue' : 'outline'}
              onSuccess={async (credentialResponse) => {
                try {
                  if (!isCredentialResponse(credentialResponse)) {
                    throw Error(
                      'Invalid credential response. Received "success" response, but failed to validate the response object. Check Google API or GoogleLogin component for more details.'
                    )
                  }

                  const { payload } = decodeGoogleJWT(credentialResponse.credential)
                  storeDataInLocalStorage<GoogleJWTPayload>('user', payload)

                  const res = await fetch(`${VITE_BASE_URL}/v1/auth/verify`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token: credentialResponse.credential }),
                  })

                  if (res.ok) {
                    setAuthenticated(true)
                  } else {
                    setAuthenticated(false)
                  }
                } catch (e) {
                  console.error(e)
                }
              }}
              onError={() => {
                console.log('Login Failed')
              }}
            />
          )}
        </div>
      </div>
    </header>
  )
}
