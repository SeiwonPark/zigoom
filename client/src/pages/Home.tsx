import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { css } from '@emotion/react'
import { v4 as uuidv4 } from 'uuid'
import { SocketContext } from '../contexts/SocketContext'
import { Button } from '../components/Button'
import VideoAddIcon from '../assets/icons/video_add.svg'

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
    </div>
  )
}
