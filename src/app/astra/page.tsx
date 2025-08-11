"use client"
import React, { Suspense } from 'react'
import AstraSearch from './astramaincomponent'
import NavBar from '@/components/molecules/navbar/navbar'
import styles from './astrasearch.module.scss'
import BackBtn from '@/components/atoms/(buttons)/backbtn/backbtn'
export default function AstraComponent() {
  return (
    <>
      <Suspense fallback={
        <div>Search</div>
      }>
        <div className={styles.wraper}>
          <NavBar />

          <div className={styles.container}>
            <BackBtn />
            <AstraSearch />
          </div>
        </div>
      </Suspense>
    </>
  )
}
