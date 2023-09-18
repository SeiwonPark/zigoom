import { useNavigate } from 'react-router-dom'
import { css } from '@emotion/react'
import { Button } from '../components/buttons/Button'
import { Header } from '../components/Header'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <>
      <Header />
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
        <div
          css={css`
            place-items: center;
          `}
        >
          <span
            css={css`
              font-size: 2.25rem;
              line-height: 2.75rem;
              letter-spacing: 0;
              color: rgb(60, 64, 67);
              text-align: center;
            `}
          >
            Can't find the room.
          </span>
        </div>
        <div
          css={css`
            margin: 1.75rem;
          `}
        ></div>
        <div>
          <Button text="Back to Home" onClick={() => navigate('/')} />
        </div>
      </div>
    </>
  )
}
