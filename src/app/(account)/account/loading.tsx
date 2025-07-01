import React from 'react'
import styles from './account.module.scss';
import NavBar from '@/components/molecules/navbar/navbar';
import ShimmerLoader from '@/components/atoms/loading/loadingbox';

function Loading() {
    return (
        <div className={styles.wraper}>
            <NavBar />
            <div className={styles.container}>
                <div className={styles.top} >
                    <ShimmerLoader height="5.2rem" width="5.2rem" borderRadius="1.6rem" />
                </div>
                <div className={styles.layoutgrid}>

                    <div className={styles.portion} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        <ShimmerLoader height="5.2rem" width="100%" borderRadius="1rem" />
                        <ShimmerLoader height="5.2rem" width="100%" style={{ opacity: 0.8 }} borderRadius="1rem" />
                        <ShimmerLoader height="5.2rem" width="100%" style={{ opacity: 0.6 }} borderRadius="1rem" />
                    </div>

                    <div className={styles.formlayout}>
                        <div className={styles.portion} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <ShimmerLoader height="6rem" width="30%" borderRadius="1rem" style={{ marginBottom: '4rem' }} />
                            <ShimmerLoader height="12.2rem" width="100%" style={{ opacity: 0.8 }} borderRadius="1rem" />
                            <ShimmerLoader height="12.2rem" width="100%" style={{ opacity: 0.6 }} borderRadius="1rem" />
                        </div>
                        <div className={styles.portion}>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Loading
