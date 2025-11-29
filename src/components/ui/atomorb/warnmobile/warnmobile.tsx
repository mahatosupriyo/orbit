import React from 'react'
import styles from './warnmobile.module.scss'

export default function WarnMobile() {
    return (
        <div className={styles.wraper}>
            <div className={styles.container}>
                <svg xmlns="http://www.w3.org/2000/svg" className={styles.icondesktop} viewBox="0 0 84 71" fill="none">
                    <path d="M74.9999 0H8.3359C3.7382 0 0 3.7344 0 8.332V45.832C0 50.4297 3.7383 54.164 8.332 54.164H29.164V66.664H16.668V70.832H66.668V66.664H54.164L54.1679 54.164H74.9999C79.5976 54.164 83.3319 50.4257 83.3319 45.832L83.3358 8.332C83.3358 3.7343 79.5975 0 74.9999 0ZM49.9959 66.664H33.3279V54.164H49.9959V66.664ZM79.1679 45.832C79.1679 48.1328 77.3007 50 74.9999 50H8.3359C6.0351 50 4.1679 48.1328 4.1679 45.832V8.332C4.1679 6.0312 6.0351 4.164 8.3359 4.164H75.0039C77.3047 4.164 79.1719 6.0312 79.1719 8.332L79.1679 45.832Z" />
                </svg>
                <h3 className={styles.warning}>
                    Designed for desktop.
                </h3>
            </div>
        </div>
    )
}
