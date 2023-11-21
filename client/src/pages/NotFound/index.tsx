import { useNavigate } from 'react-router-dom'

import { ElevatedButton } from '@/components/Buttons'
import { Header } from '@/components/Header'

import styles from './index.module.css'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <span className={styles.content}>Can't find the room.</span>
        </div>
        <div className={styles.spacer}></div>
        <div>
          <ElevatedButton text="Back to Home" onClick={() => navigate('/')} />
        </div>
      </div>
    </>
  )
}
