import { MouseEvent } from 'react'

import { CloseIcon } from '@/assets/icons'
import { IconButton } from '@/components/Buttons/IconButton'
import { OutlinedButton } from '@/components/Buttons/OutlinedButton'
import { VITE_BASE_URL } from '@/configs/env'
import axios from '@/configs/http'
import { useAuth } from '@/contexts/AuthContext'
import { GetUserResponse } from '@/validations/user.validation'

import styles from './index.module.css'

interface ProfileModalProps {
  userData: GetUserResponse | undefined
  onClose: (event: MouseEvent) => void
  setToggleProfile: React.Dispatch<React.SetStateAction<boolean>>
}

export const ProfileModal = ({ userData, onClose, setToggleProfile }: ProfileModalProps) => {
  const { authState, setAuthState } = useAuth()

  const handleLogout = async () => {
    const res = await axios.post(`${VITE_BASE_URL}/v1/auth/logout`)

    if (res.status === 200) {
      setAuthState({ ...authState, isAuthenticated: false })
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
          <span className={styles.email}>{userData?.profile?.email}</span>
          <div className={styles.iconContainer}>
            <IconButton Icon={CloseIcon} fill="#444746" hoverBackground="rgba(200, 200, 200, 0.4)" onClick={onClose} />
          </div>
        </div>
        <div className={styles.content}>
          <img className={styles.profileImage} src={userData?.profileThumbnail} alt="profile-image" />
          <span className={styles.greeting}>Hi, {userData?.name || 'there'}!</span>
        </div>
        <div className={styles.buttonContainer}>
          <OutlinedButton text="Sign out" onClick={handleLogout} />
        </div>
      </div>
    </>
  )
}
