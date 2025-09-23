"use client";
import React from 'react'
import Lottie from 'lottie-react'
import animationData from '../../../../public/Essentials/lottie/loader.json'

const OrbitLoader = () => {
    return (
        <>
            <Lottie animationData={animationData} style={{ height: '200px', padding: '4rem', boxSizing: 'content-box' }} autoplay />
        </>
    )
}

export default OrbitLoader