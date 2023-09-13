import { useParams } from 'react-router-dom'
import { Video } from '../components/Video'
import { css } from '@emotion/react'

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>()

  return (
    <div
      css={css`
        margin: 0;
        padding: 0;
        height: 100vh;
        width: 100vw;
      `}
    >
      <Video roomId={roomId} />
    </div>
  )
}
