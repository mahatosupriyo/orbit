import NavBar from '@/components/molecules/navbar/navbar'
import React from 'react'
import styles from './garage.module.scss'
import ShimmerLoader from '@/components/atoms/loading/loadingbox';


function Loading() {
    return (
        <div className={styles.wraper}>
            <NavBar />
            <div className={styles.container}>
                <div className={styles.capsulegrid}>
                    <div className={styles.deengineering}>
                        <div className={styles.drops}>
                            <ShimmerLoader
                                className={styles.dropcard}
                                height='100%'
                                width='100%'
                                aspect-ratio='1/1'
                                borderRadius='1rem'
                            />

                            <ShimmerLoader
                                className={styles.dropcard}
                                height='100%'
                                width='100%'
                                aspect-ratio='1/1'
                                borderRadius='1rem'
                            />

                            <ShimmerLoader
                                className={styles.dropcard}
                                height='100%'
                                width='100%'
                                aspect-ratio='1/1'
                                borderRadius='1rem'
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Loading