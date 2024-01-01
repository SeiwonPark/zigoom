import { useContext, useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

import { Header } from '@/components/Header'
import { HomeSection } from '@/components/HomeSection'
import { SocketContext } from '@/contexts/SocketContext'
import type { LocalOptions } from '@/typings/index'
import { getLocalStorageItem, sleep, storeDataInLocalStorage } from '@/utils/index'

import styles from './index.module.css'

export default function Home() {
  const socket = useContext(SocketContext)
  const navigate = useNavigate()
  const [isNavigating, setIsNavigating] = useState<boolean>(false)
  const [inputSessionId, setInputSessionId] = useState<string>('')

  useEffect(() => {
    const currentLocalOptions = getLocalStorageItem<LocalOptions>('local')

    if (!currentLocalOptions) {
      storeDataInLocalStorage<LocalOptions>('local', {
        isVideoOn: false,
        isAudioOn: false,
        pinnedPeerId: '',
        isChatOpen: false,
      })
    }
  }, [])

  const enterSessionWithId = async () => {
    if (socket) {
      setIsNavigating(true)

      /**
       * Minimum exposure for 1000 ms
       */
      await sleep(1000)
      socket.connect()
      navigate(`/room/${inputSessionId}?adhoc=false&ts=${Date.now()}`)
      setIsNavigating(false)
    }
  }

  const enterSession = async () => {
    if (socket) {
      setIsNavigating(true)

      /**
       * Minimum exposure for 1000 ms
       */
      await sleep(1000)
      socket.connect()
      navigate(`/room/${uuidv4()}?adhoc=true&ts=${Date.now()}`)
      setIsNavigating(false)
    }
  }

  const enterGuest = async () => {
    if (socket) {
      setIsNavigating(true)

      /**
       * Minimum exposure for 1000 ms
       */
      await sleep(1000)
      socket.connect()
      navigate(`/room/${uuidv4()}?adhoc=true&ts=${Date.now()}`)
      setIsNavigating(false)
    }
  }

  return (
    <>
      <Header
        enterGuestMode={enterGuest}
        style={{
          backgroundColor: isNavigating ? 'rgba(0, 0, 0, 0.8)' : '#fff',
          transition: 'background 1s',
        }}
      />
      <div className={`${styles.container} ${isNavigating ? styles.navigating : styles.default}`}>
        <HomeSection
          onSessionStart={enterSession}
          onSessionIdChange={setInputSessionId}
          onSessionEnter={enterSessionWithId}
          inputSessionId={inputSessionId}
        />
        {isNavigating && <div className={styles.loading}>Loading...</div>}
      </div>
    </>
  )
}
