
import styles from './loaderbar.module.scss'

export default function LoaderBar() {
  return (
    <div className={styles.gradientBarWraper}>
        <div className={styles.gradientBar}></div>
        <div className={styles.gradientLine}></div>
    </div>
  )
}
