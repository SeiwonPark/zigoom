import styles from './index.module.css'

export const HamburgerMenu = () => {
  return (
    <div className={styles.container}>
      <label className={styles.label} htmlFor="check">
        <input type="checkbox" id="check" />
        <span className={styles.bar}></span>
        <span className={styles.bar}></span>
        <span className={styles.bar}></span>
        <div className={styles.menu}></div>
      </label>
    </div>
  )
}
