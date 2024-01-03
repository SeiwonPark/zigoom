import { useState } from 'react'

import { isAxiosError } from 'axios'
import { useNavigate } from 'react-router-dom'

import { CheckedIcon } from '@/assets/icons'
import { UncheckedIcon } from '@/assets/icons'
import { SVGIcon } from '@/components/Buttons'
import { Modal } from '@/components/Modal'
import { PrivacyStatement } from '@/components/Policy/PrivacyStatement'
import { TermsOfUse } from '@/components/Policy/TermsOfUse'
import { VITE_BASE_URL } from '@/configs/env'
import axios from '@/configs/http'

import styles from './index.module.css'

export default function Register() {
  const [checkTermsOfUse, setCheckTermsOfUse] = useState<boolean>(false)
  const [checkPrivacyStatement, setCheckPrivacyStatement] = useState<boolean>(false)
  const [viewTermsOfUse, setViewTermsOfUse] = useState<boolean>(false)
  const [viewPrivacyStatement, setViewPrivacyStatement] = useState<boolean>(false)

  const navigate = useNavigate()

  const handleClickTermsOfUse = () => {
    setCheckTermsOfUse(!checkTermsOfUse)
  }

  const handleClickPrivacyStatement = () => {
    setCheckPrivacyStatement(!checkPrivacyStatement)
  }

  const handleTermsOfUseViewClick = (e: any) => {
    e.stopPropagation()
    setViewPrivacyStatement(false)
    setViewTermsOfUse(!viewTermsOfUse)
  }

  const handlePrivacyStatementViewClick = (e: any) => {
    e.stopPropagation()
    setViewTermsOfUse(false)
    setViewPrivacyStatement(!viewPrivacyStatement)
  }

  const closeTermsOfUse = () => setViewTermsOfUse(false)

  const closePrivacyStatement = () => setViewPrivacyStatement(false)

  const allChecked = checkTermsOfUse && checkPrivacyStatement

  const handleRegisterUser = async () => {
    if (!allChecked) {
      return
    }

    const token = localStorage.getItem('authToken')

    const payload = {
      token: token,
      provider: 'google', // FIXME: should be dynamic value
    }

    try {
      const res = await axios.post(`${VITE_BASE_URL}/v1/user`, payload)

      if (res.status === 200) {
        navigate('/', { replace: true })
      }
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        console.error(error.response)

        switch (error.response.status) {
          case 400:
            alert('Please retry this from Home')
            break
          default:
            alert('Unexpected error occurred')
            break
        }
      } else {
        // FIXME: should be notified
        console.error('Something went wrong:', error)
      }
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <h2 className={styles.title}>Sign Up</h2>
        <div className={styles.checklist} onClick={handleClickTermsOfUse}>
          <SVGIcon Icon={checkTermsOfUse ? CheckedIcon : UncheckedIcon} />
          <span className={checkTermsOfUse ? styles.active : ''}>(Required) Terms of Use</span>
          <span className={styles.detailView} onClick={handleTermsOfUseViewClick}>
            View
          </span>
        </div>
        <div className={styles.checklist} onClick={handleClickPrivacyStatement}>
          <SVGIcon Icon={checkPrivacyStatement ? CheckedIcon : UncheckedIcon} />
          <span className={checkPrivacyStatement ? styles.active : ''}>(Required) Privacy Policy</span>
          <span className={styles.detailView} onClick={handlePrivacyStatementViewClick}>
            View
          </span>
        </div>
        <div className={`${styles.buttonContainer} ${!allChecked ? styles.noEvents : ''}`} onClick={handleRegisterUser}>
          <button className={styles.registerButton} disabled={!allChecked}>
            Complete
          </button>
        </div>
      </div>
      {viewTermsOfUse && (
        <Modal onClose={closeTermsOfUse}>
          <TermsOfUse />
        </Modal>
      )}
      {viewPrivacyStatement && (
        <Modal onClose={closePrivacyStatement}>
          <PrivacyStatement />
        </Modal>
      )}
    </div>
  )
}
