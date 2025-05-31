import React from 'react'
import styles from './success.module.scss'
import Logo from '@/components/atoms/icons'
import SuccessAnimation from '@/components/atoms/lotties/success'
import Link from 'next/link'

const SuccessPage = () => {
    return (
        <div className={styles.wraper}>
            <div className={styles.container}>
                <Logo size={40} name='oto' />

                <div className={styles.mainwraper}>
                    <SuccessAnimation />
                    <h3 className={styles.heading}>
                        Woohoo! Payment successful
                    </h3>
                    <p className={styles.subheading}>
                        you're On the Orbit.
                    </p>
                </div>
                <p className={styles.highpriority}>
                    you can go to <Link style={{textDecoration: 'none', color: '#fff'}} href="/">Home</Link>
                </p>
            </div>
        </div>
    )
}

export default SuccessPage
