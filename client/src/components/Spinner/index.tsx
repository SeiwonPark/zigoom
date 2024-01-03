/**
 * Code from https://loading.io/css/
 */
import styles from './index.module.css'

export const Spinner = () => {
  return (
    <div className={styles.container}>
      <div className={styles.spinner}></div>
      <div className={styles.spinner}></div>
      <div className={styles.spinner}></div>
      <div className={styles.spinner}></div>
    </div>
  )
}
