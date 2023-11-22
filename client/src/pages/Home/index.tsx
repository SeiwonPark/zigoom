import { useContext, useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

import { VideoAddIcon } from '@/assets/icons'
import { TextButton } from '@/components/Buttons'
import { ElevatedButton } from '@/components/Buttons/ElevatedButton'
import { Header } from '@/components/Header'
import { SocketContext } from '@/contexts/SocketContext'
import type { LocalOptions } from '@/typings/index'
import { getLocalStorageItem, storeDataInLocalStorage } from '@/utils/index'

import styles from './index.module.css'

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
          transition: 'background 1s',
        }}
      />
      <div className={`${styles.container} ${isNavigating ? styles.navigating : styles.default}`}>
        <section className={styles.section}>
          <h1 className={styles.title}>Video calls and meetings for everyone.</h1>
          <div className={styles.actionContainer}>
            <ElevatedButton
              Icon={VideoAddIcon}
              text="Start a meeting"
              onClick={enterSession}
              style={{ width: 'fit-content', minWidth: 'fit-content' }}
            />
            <div className={styles.wrapper}>
              <div className={styles.wrapper}>
                <input
                  className={styles.roomInput}
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
        {isNavigating && <div className={styles.loading}>Loading...</div>}
      </div>
    </>
  )
}
