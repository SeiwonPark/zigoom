import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { css } from '@emotion/react'
import { v4 as uuidv4 } from 'uuid'
import { SocketContext } from '../contexts/SocketContext'
import { Button } from '../components/Button'
import VideoAddIcon from '../assets/icons/video_add.svg'

export default function Home() {
  const socket = useContext(SocketContext)
  const naviagte = useNavigate()
  const [isNavigating, setIsNavigating] = useState<boolean>(false)

  const enterRoom = () => {
    if (socket) {
      setIsNavigating(true)
      setTimeout(() => {
        socket.connect()
        naviagte(`/room/${uuidv4()}`)
      }, 1000)
    }
  }

  return (
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
        <Button Icon={VideoAddIcon} text="Start a meeting" onClick={enterRoom} />
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
  )
}
