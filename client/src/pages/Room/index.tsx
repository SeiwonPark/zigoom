import { ReactNode, useEffect, useState } from 'react'

// import { useLocation, useParams } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import { validate } from 'uuid'

import { EmptyLoader } from '@/components/EmptyLoader'
import { Header } from '@/components/Header'
import { Session } from '@/components/Session'
import { WaitingRoom } from '@/components/WaitingRoom'
import { VITE_BASE_URL } from '@/configs/env'
import axios from '@/configs/http'
import { useSessionStore } from '@/hooks/useStore'
// import { verifySession } from '@/utils/check'
import NotFound from '@/pages/NotFound'
import { sleep } from '@/utils/time'

import styles from './index.module.css'

export default function Room() {
  const { roomId = '' } = useParams<{ roomId: string }>()
  // const location = useLocation()
  // const params = new URLSearchParams(location.search)
  // const adhoc = params.get('adhoc')

  const [loading, setLoading] = useState(true)
  const [roomComponent, setRoomComponent] = useState<ReactNode>(<EmptyLoader />)
  const { isGranted } = useSessionStore()

  useEffect(() => {
    setLoading(true)

    const loadData = async () => {
      await sleep(800)
      await checkAndSetRoomComponent()
      setLoading(false)
    }

    loadData()
  }, [roomId, isGranted])

  const checkAndSetRoomComponent = async () => {
    /**
     * Checks if `roomId` is uuid format.
     */
    if (roomId !== '' && !validate(roomId)) {
      setRoomComponent(<NotFound />)
      return
    }

    // const verified = await verifySession({ params }, roomId)
    const sessionData = sessionStorage.getItem(`session_${roomId}`)

    if (sessionData) {
      if (isGranted) {
        setRoomComponent(<Session roomId={roomId} />)
      } else {
        setRoomComponent(
          <HeaderWrapper>
            <WaitingRoom roomId={roomId} data={JSON.parse(sessionData)} />
          </HeaderWrapper>
        )
      }
      return
    }

    const payload = {
      sessionId: roomId,
      title: `${roomId}'s room`,
      isPrivate: false,
    }

    const res = await axios.post(`${VITE_BASE_URL}/v1/session`, payload)
    sessionStorage.setItem(`session_${roomId}`, JSON.stringify(res.data))

    if (res.data.isHost) {
      setRoomComponent(<Session roomId={roomId} />)
    } else {
      if (isGranted) {
        setRoomComponent(<Session roomId={roomId} />)
      } else {
        setRoomComponent(
          <HeaderWrapper>
            <WaitingRoom roomId={roomId} data={res.data} />
          </HeaderWrapper>
        )
      }
    }
  }

  return <div className={styles.container}>{loading ? <EmptyLoader /> : roomComponent}</div>
}

const HeaderWrapper = ({ children }: { children?: ReactNode }) => {
  return (
    <>
      <Header />
      {children}
    </>
  )
}
