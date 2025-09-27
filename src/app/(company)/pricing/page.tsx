import React from 'react'
import styles from './pricing.module.scss'
import Pricingtable from '@/components/layout/lander/pricingtable/pricingtable'
import NavBar from '@/components/molecules/navbar/navbar'

function PricingPage() {
    return (
        <div className={styles.wraper}>
            <NavBar />
            <div className={styles.container}>
                <Pricingtable />
            </div>
        </div>
    )
}

export default PricingPage
