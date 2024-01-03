import styles from './index.module.css'

export const Footer = () => {
  return (
    <div className={styles.container}>
      <a href="/terms-of-use" className={styles.termsOfUse}>
        <span>Terms of Use</span>
      </a>
      <a href="/privacy-statement" className={styles.privacy}>
        <span>Privacy</span>
      </a>
    </div>
  )
}
