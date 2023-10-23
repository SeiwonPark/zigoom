import { useContext, useEffect, useState } from 'react'

import { css } from '@emotion/react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

import { VideoAddIcon } from '@/assets/icons'
// import { KeyboardIcon } from '@/assets/icons'
import { Header } from '@/components/Header'
import { TextButton } from '@/components/buttons'
import { ElevatedButton } from '@/components/buttons/ElevatedButton'
import { SocketContext } from '@/contexts/SocketContext'
import type { LocalOptions } from '@/typings/index'
import { getLocalStorageItem, storeDataInLocalStorage } from '@/utils/index'

export default function Home() {
  const socket = useContext(SocketContext)
  const navigate = useNavigate()
  const [isNavigating, setIsNavigating] = useState<boolean>(false)
  const [inputSessionId, setInputSessionId] = useState<string>('')

  useEffect(() => {
    const currentLocalOptions = getLocalStorageItem<LocalOptions>('local')

    if (!currentLocalOptions) {
      storeDataInLocalStorage<LocalOptions>('local', { isVideoOn: false, isAudioOn: false })
    }
  }, [])

  const enterSessionWithId = async () => {
    if (socket) {
      setIsNavigating(true)
      setTimeout(() => {
        socket.connect()
        navigate(`/room/${inputSessionId}?adhoc=false&ts=${Date.now()}`)
        setIsNavigating(false)
      }, 1000)
    }
  }

  const enterSession = async () => {
    if (socket) {
      setIsNavigating(true)
      setTimeout(() => {
        socket.connect()
        navigate(`/room/${uuidv4()}?adhoc=true&ts=${Date.now()}`)
        setIsNavigating(false)
      }, 1000)
    }
  }

  const enterGuest = () => {
    if (socket) {
      setIsNavigating(true)
      setTimeout(() => {
        socket.connect()
        navigate(`/room/${uuidv4()}?adhoc=true&ts=${Date.now()}`)
        setIsNavigating(false)
      }, 1000)
    }
  }

  return (
    <>
      <Header
        enterGuestMode={enterGuest}
        style={{
          backgroundColor: isNavigating ? 'rgba(0, 0, 0, 0.8)' : '#fff',
          transition: 'background-color 1s',
        }}
      />
      <div
        css={css`
          width: 100vw;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: ${isNavigating ? 'rgba(0, 0, 0, 0.8)' : 'transparent'};
          transition: background-color 1s;
        `}
      >
        <section
          css={css`
            // FIXME: responsive test
            @media screen and (max-width: 1440px) {
              max-width: 1296px;
              margin: 0 auto;
            }

            @media screen and (max-width: 1024px) {
              margin: 72px;
            }

            @media screen and (max-width: 600px) {
              margin: 40px;
            }
          `}
        >
          <h1
            css={css`
              font-size: 3rem;
              font-weight: 400;
            `}
          >
            Video calls and meetings for everyone.
          </h1>
          <div
            css={css`
              display: flex;
              gap: 30px;

              @media screen and (max-width: 600px) {
                flex-direction: column;
              }
            `}
          >
            <ElevatedButton
              Icon={VideoAddIcon}
              text="Start a meeting"
              onClick={enterSession}
              style={{ width: 'fit-content', color: '' }}
            />
            <div
              css={css`
                display: flex;
                gap: 10px;
              `}
            >
              <div
                css={css`
                  display: flex;
                  gap: 10px;
                `}
              >
                <input
                  css={css`
                    border: 1px solid #80868a;
                    border-radius: 6px;
                    padding: 1rem 1.5rem 1rem 2.5rem;
                    font-size: 1rem;
                    background-image: url('../assets/icons/keyboard.svg'); // FIXME:
                    background-position: 10px center;
                    background-repeat: no-repeat;
                  `}
                  type="text"
                  placeholder="Enter a code or link"
                  onChange={(e) => setInputSessionId(e.target.value)}
                />
                <TextButton
                  text="Enter"
                  onClick={enterSessionWithId}
                  style={{
                    color: inputSessionId.trim() === '' ? '#B5B6B7' : 'rgb(26, 115, 232)',
                    pointerEvents: inputSessionId.trim() === '' ? 'none' : 'auto',
                  }}
                />
              </div>
            </div>
          </div>
        </section>
        {isNavigating && (
          <div
            css={css`
              position: absolute;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #fff;
              font-size: 2rem;
              font-weight: 500;
            `}
          >
            Loading...
          </div>
        )}
      </div>
    </>
  )
}
