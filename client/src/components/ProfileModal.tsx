import { MouseEvent } from 'react'
import { css } from '@emotion/react'
import { googleLogout } from '@react-oauth/google'
import { GoogleJWTPayload } from '../validations/auth.validation'
import { VITE_BASE_URL } from '../configs/env'
import { IconButton } from './buttons/IconButton'
import CloseIcon from '../assets/icons/close.svg'
import { OutlinedButton } from './buttons/OutlinedButton'

interface ProfileModalProps {
  userData: GoogleJWTPayload | null
  onClose: (event: MouseEvent) => void
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
  setToggleProfile: React.Dispatch<React.SetStateAction<boolean>>
}

export const ProfileModal = ({ userData, onClose, setAuthenticated, setToggleProfile }: ProfileModalProps) => {
  const handleLogout = async () => {
    const res = await fetch(`${VITE_BASE_URL}/v1/auth/logout`, { method: 'POST', credentials: 'include' })

    if (res.ok) {
      googleLogout()
      setAuthenticated(false)
      setToggleProfile(false)
      localStorage.clear()
      console.log('Successfully logged out.')
    }
  }

  return (
    <>
      <div
        onClick={onClose}
        css={css`
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100vw;
          height: 100vh;
          z-index: 1;
          background-color: transparent;
        `}
      ></div>
      <div
        css={css`
          position: absolute;
          z-index: 999;
          top: 70px;
          right: 4vw;
          width: 350px;
          padding-bottom: 1rem;
          max-width: 436px;
          min-width: 240px;
          height: auto;
          border: none;
          overflow-x: hidden;
          border-radius: 28px;
          background-color: #dde3ea;
          box-shadow: 0 4px 8px 3px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.3);
        `}
      >
        <div
          css={css`
            display: flex;
            align-items: center;
            width: 100%;
            text-align: center;
          `}
        >
          <span
            css={css`
              display: flex;
              max-width: calc(100% - 64px);
              align-items: center;
              padding-left: 56px;
              margin-left: auto;
              margin-right: auto;
              font-size: 14px;
              font-weight: 500;
              line-height: 20px;
              letter-spacing: normal;
              text-overflow: ellipsis;
            `}
          >
            {userData?.email}
          </span>
          <div
            css={css`
              display: flex;
              align-items: center;
            `}
          >
            <IconButton Icon={CloseIcon} fill="#444746" hoverBackground="rgba(200, 200, 200, 0.4)" onClick={onClose} />
          </div>
        </div>
        <div
          css={css`
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            margin: 22px auto 0 auto;
          `}
        >
          <img
            src={userData?.picture}
            alt="profile-image"
            css={css`
              width: 80px;
              height: 80px;
              border-radius: 50%;
            `}
          />
          <span
            css={css`
              font-weight: 400;
              font-size: 22px;
              line-height: 28px;
              letter-spacing: normal;
              margin: 8px 0;
              text-align: center;
            `}
          >
            Hi, {userData?.given_name || 'there'}!
          </span>
        </div>
        <div
          css={css`
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          `}
        >
          <OutlinedButton text="Sign out" onClick={handleLogout} />
        </div>
      </div>
    </>
  )
}
