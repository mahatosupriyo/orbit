import React from 'react'
import styles from './backbtn.module.scss'
import Link from 'next/link'

function BackBtn() {
    return (
        <div className={styles.backbtnwraper}>
            <Link draggable="false" href="/" className={styles.backbtn}>

                <svg xmlns="http://www.w3.org/2000/svg" className={styles.backbtnicon} viewBox="0 0 28 28">
                    <path d="M9.86957 15.3043H16.9L13.8196 18.3848C13.4804 18.7239 13.4804 19.2739 13.8196 19.6152C13.9891 19.7848 14.2109 19.8696 14.4348 19.8696C14.6587 19.8696 14.8804 19.7848 15.05 19.6152L18.1304 16.5348C18.6913 15.9739 19 15.2283 19 14.4348C19 13.6413 18.6913 12.8957 18.1304 12.3348L15.05 9.25435C14.7109 8.91522 14.1587 8.91522 13.8196 9.25435C13.4804 9.59348 13.4804 10.1457 13.8196 10.4848L16.9 13.5652H9.86957C9.38913 13.5652 9 13.9543 9 14.4348C9 14.9152 9.38913 15.3043 9.86957 15.3043Z" />
                </svg>

            </Link>
        </div>
    )
}

export default BackBtn
