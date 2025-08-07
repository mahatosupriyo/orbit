"use client"
import Link from 'next/link';
import styles from './footer.module.scss'
import Icon from '@/components/atoms/icons';
import { motion } from 'framer-motion';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerwraper}>


                <div className={styles.footercontent}>

                    <motion.h2
                        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                        className={styles.tag}>Future belongs to the curious
                    </motion.h2>

                    <div className={styles.linklist}>

                        {/* <Link href="/" className={styles.linkitem}>console</Link> */}
                        <Link href="/" className={styles.linkitem}>contact</Link>
                        <Link href="/brandkit" className={styles.linkitem}>brand kit</Link>
                        <Link href="/company/legals" className={styles.linkitem}>legals</Link>
                        {/* <Link href="/" className={styles.linkitem}>faq</Link> */}

                    </div>

                    <div className={styles.socialscontainer}>

                        <div className={styles.socials}>
                            <Link target="_blank" draggable="false" href="https://www.linkedin.com/company/weareontheorbit" className={styles.socialmedialink}>
                                <Icon name='linkedin' fill={'#fff'} size={34} />
                            </Link>

                            <Link target="_blank" draggable="false" href="https://www.instagram.com/weareontheorbit/" className={styles.socialmedialink}>
                                <Icon name='instagram' fill={'#fff'} size={34} />
                            </Link>

                            <Link target="_blank" draggable="false" href="https://www.x.com/@weareontheorbit" className={styles.socialmedialink}>
                                <Icon name='x' fill={'#fff'} size={34} />
                            </Link>
                        </div>
                    </div>

                </div>
                <div className={styles.footercontent}>
                    <h4 className={styles.passiontxt}>
                        Made with
                        Love
                        in India  © 2025 On The Orbit • formerly Edu Burner
                    </h4>
                    <p className={styles.copyrighttxt}>
                        All rights reserved. No part of this website or its content may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of On The Orbit, except in the case of brief quotations embodied in critical reviews and certain other noncommercial uses permitted by copyright law. For permission requests, contact On The Orbit.
                    </p>
                </div>

            </div>
        </footer>
    );
}

