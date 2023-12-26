import styles from './index.module.css'

interface StatProps {
  stat: number
}

export const Stat = ({ stat }: StatProps) => {
  let dotColor

  if (stat < 0.15) {
    dotColor = styles.green
  } else if (stat >= 0.15 && stat <= 0.3) {
    dotColor = styles.orange
  } else {
    dotColor = styles.red
  }

  return <div className={`${styles.dot} ${dotColor}`}></div>
}
