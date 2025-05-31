"use client";
import React from 'react'
import Lottie from 'lottie-react'
import animationData from '../../../../public/Essentials/lottie/success.json'

const Loader = () => {
    return (
        <>
            <Lottie animationData={animationData} style={{ height: '96px', padding: '4rem', boxSizing: 'content-box', width: '96px' }} autoplay />
        </>
    )
}

export default Loader