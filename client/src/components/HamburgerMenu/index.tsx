import styles from './index.module.css'

export const HamburgerMenu = () => {
  return (
    <div className={styles.container}>
      <div>
        <label className={styles.label} htmlFor="check">
          <input type="checkbox" id="check" />
          <span></span>
          <span></span>
          <span></span>
          <div className={styles.menu}></div>
        </label>
      </div>
    </div>
  )
}
