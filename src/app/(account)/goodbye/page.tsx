import React from 'react'
import styles from './goodbye.module.scss'
import DeleteAccountButton from './goodbyebtn'
import NavBar from '@/components/molecules/navbar/navbar'
import BackBtn from '@/components/atoms/(buttons)/backbtn/backbtn'
import AccountNav from '../accountnav/accountnav'

function GoodBye() {
    return (
        <div className={styles.wraper}>
            <NavBar />
            <div className={styles.container}>
                <BackBtn />
                <div className={styles.layoutgrid}>
                    <AccountNav />
                    <div className={styles.content}>
                        <div className={styles.header}>
                            <div className={styles.headerdata}>
                                <h1 className={styles.title}>Data privacy</h1>
                            </div>
                        </div>
                        <DeleteAccountButton />
                        <p className={styles.warning}>
                            * This action is permanent and cannot be undone.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GoodBye
