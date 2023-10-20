import { ReactNode, useEffect, useState } from 'react'

import { css } from '@emotion/react'
// import { useLocation, useParams } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import { validate } from 'uuid'

import { EmptyLoader } from '@/components/EmptyLoader'
import { Header } from '@/components/Header'
import { Session } from '@/components/Session'
import { WaitingRoom } from '@/components/WaitingRoom'
import { VITE_BASE_URL } from '@/configs/env'
import axios from '@/configs/http'

// import { verifySession } from '@/utils/check'
import NotFound from './NotFound'

export default function Room() {
  const { roomId = '' } = useParams<{ roomId: string }>()
  // const location = useLocation()
  // const params = new URLSearchParams(location.search)
  // const adhoc = params.get('adhoc')

  const [loading, setLoading] = useState(true)
  const [roomComponent, setRoomComponent] = useState<ReactNode>(<EmptyLoader />)

  useEffect(() => {
    setLoading(true)

    const loadingTimeout = setTimeout(async () => {
      await checkAndSetRoomComponent()
      setLoading(false)
    }, 1000)

    return () => {
      clearTimeout(loadingTimeout)
    }
  }, [roomId])

  const checkAndSetRoomComponent = async () => {
    if (roomId !== '' && !validate(roomId)) {
      setRoomComponent(<NotFound />)
      return
    }

    // const verified = await verifySession({ params }, roomId)
    const sessionData = sessionStorage.getItem(`session_${roomId}`)

    if (sessionData) {
      setRoomComponent(
        <HeaderWrapper>
          <WaitingRoom roomId={roomId} data={JSON.parse(sessionData)} />
        </HeaderWrapper>
      )
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
      setRoomComponent(
        <HeaderWrapper>
          <WaitingRoom roomId={roomId} data={res.data} />
        </HeaderWrapper>
      )
    }
  }

  return (
    <div
      css={css`
        margin: 0;
        padding: 0;
        height: 100vh;
        width: 100vw;
      `}
    >
      {loading ? <EmptyLoader /> : roomComponent}
    </div>
  )
}

const HeaderWrapper = ({ children }: { children?: ReactNode }) => {
  return (
    <>
      <Header />
      {children}
    </>
  )
}
