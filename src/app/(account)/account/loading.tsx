import NavBar from "@/components/molecules/navbar/navbar";
import styles from './account.module.scss'

export default function Loading() {
  return (
    <div className={styles.wraper}>
      <NavBar />
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerdata}>
            <h1 className={styles.title}>Account settings</h1>
          </div>
          <div
            className={styles.avatar}>
          </div>

        </div>

        <div className={styles.loaderwrapper}>
          <div className={styles.loader}>
          </div>

        </div>
      </div>

    </div>
  )
}