"use client";
import React from 'react'
import Lottie from 'lottie-react'
import animationData from '../../../../public/Essentials/lottie/loader.json'

const BurnerLoader = () => {
    return (
        <>
            <Lottie animationData={animationData} style={{ height: '30px', padding: '4rem', boxSizing: 'content-box', width: '96px' }} autoplay />
        </>
    )
}

export default BurnerLoader