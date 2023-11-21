import { MouseEvent } from 'react'

import { CloseIcon } from '@/assets/icons'
import { IconButton } from '@/components/Buttons/IconButton'
import { OutlinedButton } from '@/components/Buttons/OutlinedButton'
import { VITE_BASE_URL } from '@/configs/env'
import axios from '@/configs/http'
import { GoogleJWTPayload } from '@/validations/auth.validation'

import styles from './index.module.css'

interface ProfileModalProps {
  userData: GoogleJWTPayload | null
  onClose: (event: MouseEvent) => void
  setIsAuthenticated: (value: boolean) => void
  setToggleProfile: React.Dispatch<React.SetStateAction<boolean>>
}

export const ProfileModal = ({ userData, onClose, setIsAuthenticated, setToggleProfile }: ProfileModalProps) => {
  const handleLogout = async () => {
    const res = await axios.post(`${VITE_BASE_URL}/v1/auth/logout`, { method: 'POST', credentials: 'include' })

    if (res.status === 200) {
      setIsAuthenticated(false)
      setToggleProfile(false)
      localStorage.clear()
      console.log('Successfully logged out.')
    }
  }

  return (
    <>
      <div className={styles.container} onClick={onClose}></div>
      <div className={styles.overlapContainer}>
        <div className={styles.modal}>
          <span className={styles.email}>{userData?.email}</span>
          <div className={styles.iconContainer}>
            <IconButton Icon={CloseIcon} fill="#444746" hoverBackground="rgba(200, 200, 200, 0.4)" onClick={onClose} />
          </div>
        </div>
        <div className={styles.content}>
          <img className={styles.profileImage} src={userData?.picture} alt="profile-image" />
          <span className={styles.greeting}>Hi, {userData?.given_name || 'there'}!</span>
        </div>
        <div className={styles.buttonContainer}>
          <OutlinedButton text="Sign out" onClick={handleLogout} />
        </div>
      </div>
    </>
  )
}
