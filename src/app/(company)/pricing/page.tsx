import React from 'react'
import styles from './pricing.module.scss'
import Pricingtable from '@/app/lander/pricingtable/pricingtable'

function PricingPage() {
    return (
        <div className={styles.wraper}>
            <div className={styles.container}>
                <Pricingtable />
            </div>
        </div>
    )
}

export default PricingPage
