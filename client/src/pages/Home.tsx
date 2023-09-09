import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { css } from '@emotion/react'
import { v4 as uuidv4 } from 'uuid'
import { SocketContext } from '../contexts/SocketContext'
import { Button } from '../components/Button'
import VideoIcon from '../assets/icons/video-add.svg'

export default function Home() {
  const socket = useContext(SocketContext)
  const naviagte = useNavigate()

  const enterRoom = () => {
    if (socket) {
      naviagte(`/room/${uuidv4()}`)
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
      `}
    >
      <section
        css={css`
          margin: 72px;
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
        <Button Icon={VideoIcon} text="Start a meeting" onClick={enterRoom} />
      </section>
    </div>
  )
}
