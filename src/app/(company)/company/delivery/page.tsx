"use client";
import React from 'react'
import styles from './delivery.module.scss'
import { motion } from 'framer-motion'
import CompanyNav from '../components/companynav/companynav'
import CompanyHeader from '../components/header/header'
import Footer from '@/components/molecules/footer/footer';

const DeliveryPage = () => {
    return (
        <div className={styles.wraper}>
            <div className={styles.container}>
                <CompanyNav />
                <div className={styles.content}>
                    <CompanyHeader
                        titleone='shipping'
                        titletwo='& delivery'
                        update='Aug 28th 2024'
                    />

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: .25, delay: 0.2 }}
                        className={styles.maincontent}>

                        For International buyers, orders are shipped and delivered through registered international courier companies and/or International speed post only.
                        <br />
                        <br />
                        For domestic buyers, orders are shipped through registered domestic courier companies and /or speed post only. Orders are shipped within 0-7 days or as per the delivery date agreed at the time of order confirmation and delivering of the shipment subject to Courier Company / post office norms. Edu Burner is not liable for any delay in delivery by the courier company / postal authorities and only guarantees to hand over the consignment to the courier company or postal authorities within 0-7 days rom the date of the order and payment or as per the delivery date agreed at the time of order confirmation.
                        <br />
                        <br />
                        Delivery of all orders will be to the address provided by the buyer. Delivery of our services will be confirmed on your mail ID as specified during registration. For any issues in utilizing our services you may contact our helpdesk on 7029008284 or hello@eduburner.org
                    </motion.div>
                </div>

            </div>
            <Footer />
        </div >
    )
}

export default DeliveryPage
