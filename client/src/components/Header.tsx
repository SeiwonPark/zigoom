import { CSSProperties } from 'react'
import { css } from '@emotion/react'
import { GoogleLogin } from '@react-oauth/google'

interface HeaderProps {
  style?: CSSProperties
}

export const Header = ({ style }: HeaderProps) => {
  return (
    <header
      css={css`
        position: fixed;
        width: 100%;
        height: 60px;
        display: flex;
        align-items: center;
        -webkit-box-shadow: 0 0 6px 2px rgba(60, 64, 67, 0.3);
        -moz-box-shadow: 0 0 6px 2px rgba(60, 64, 67, 0.3);
        box-shadow: 0 0 6px 2px rgba(60, 64, 67, 0.3);
      `}
      style={style}
    >
      <div
        css={css`
          display: flex;
          align-items: center;
          width: 200px;
          padding: 0.5rem;
          margin-left: auto;
          margin-right: 1rem;
        `}
      >
        <GoogleLogin
          useOneTap
          onSuccess={(credentialResponse) => {
            console.log(credentialResponse)
          }}
          onError={() => {
            console.log('Login Failed')
          }}
        />
      </div>
    </header>
  )
}
