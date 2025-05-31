"use client";
import React from 'react'
import styles from './terms.module.scss'
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
                        titleone='terms &'
                        titletwo='conditions'
                        update='Aug 28th 2024'
                    />

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: .25, delay: 0.2 }}
                        className={styles.maincontent}>

                        For the purpose of these Terms and Conditions, The term "we", "us", "our" used anywhere on this page shall mean Edu Burner, whose registered/operational office is Kolkata, Newtown Newtown WEST BENGAL 700135 . "you", “your”, "user", “visitor” shall mean any natural or legal person who is visiting our website and/or agreed to purchase from us.
                        <br />
                        <br />
                        <h3 className={styles.subheading}>
                            Your use of the website and/or purchase from us are governed by following Terms and Conditions:
                        </h3>
                        <br />
                        <ul className={styles.listdiv}>
                            <li className={styles.listitem}>
                                The content of the pages of this website is subject to change without notice.
                            </li>

                            <li className={styles.listitem}>
                                Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness or suitability of the information and materials found or offered on this website for any particular purpose. You acknowledge that such information and materials may contain inaccuracies or errors and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law.
                            </li>

                            <li className={styles.listitem}>
                                Your use of any information or materials on our website and/or product pages is entirely at your own risk, for which we shall not be liable. It shall be your own responsibility to ensure that any products, services or information available through our website and/or product pages meet your specific requirements.
                            </li>

                            <li className={styles.listitem}>
                                Our website contains material which is owned by or licensed to us. This material includes, but are not limited to, the design, layout, look, appearance and graphics. Reproduction is prohibited other than in accordance with the copyright notice, which forms part of these terms and conditions.
                            </li>

                            <li className={styles.listitem}>
                                All trademarks reproduced in our website which are not the property of, or licensed to, the operator are acknowledged on the website.
                            </li>

                            <li className={styles.listitem}>
                                Unauthorized use of information provided by us shall give rise to a claim for damages and/or be a criminal offense.
                            </li>

                            <li className={styles.listitem}>
                                From time to time our website may also include links to other websites. These links are provided for your convenience to provide further information.
                            </li>

                            <li className={styles.listitem}>
                                You may not create a link to our website from another website or document without Edu Burner’s prior written consent.
                            </li>

                            <li className={styles.listitem}>
                                Any dispute arising out of use of our website and/or purchase with us and/or any engagement with us is subject to the laws of India .
                            </li>

                            <li className={styles.listitem}>
                                We, shall be under no liability whatsoever in respect of any loss or damage arising directly or indirectly out of the decline of authorization for any Transaction, on Account of the Cardholder having exceeded the preset limit mutually agreed by us with our acquiring bank from time to time
                            </li>
                        </ul>
                    </motion.div>
                </div>

            </div>
            <Footer/>
        </div >
    )
}

export default DeliveryPage
