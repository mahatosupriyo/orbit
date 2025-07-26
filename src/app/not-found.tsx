import SplashCursor from '@/utils/splashcursor'
import Link from 'next/link'
import styles from './essential.module.scss'
import NavBar from '@/components/molecules/navbar/navbar'

export default function NotFound() {
    return (
        <div className={styles.wraper}>
            <NavBar/>
            <SplashCursor />
            <div className={styles.container}>
                <h1 className={styles.title}>404</h1>
                <Link className={styles.homelink} href="/">
                    Something went wrong.
                </Link>
            </div>

        </div>
    )
}