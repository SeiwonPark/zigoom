import { useContext, useEffect, useState } from 'react'

import { css } from '@emotion/react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

import { VideoAddIcon } from '@/assets/icons'
import { Header } from '@/components/Header'
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

  const enterRoom = async () => {
    if (socket) {
      setIsNavigating(true)
      socket.connect()

      setTimeout(() => {
        navigate(`/room/${inputSessionId}?adhoc=false&ts=${Date.now()}`)
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
          <input type="text" placeholder="sessionId" onChange={(e) => setInputSessionId(e.target.value)} />
          <ElevatedButton Icon={VideoAddIcon} text="Start a meeting" onClick={enterRoom} />
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
