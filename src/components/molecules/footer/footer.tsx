"use client"
import Link from 'next/link';
import styles from './footer.module.scss'
import Icon from '@/components/atoms/icons';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerwraper}>


                <div className={styles.footercontent}>

                    <div className={styles.linklist}>

                        <div className={styles.linkcolumn}>
                            <p className={styles.linklabel}>Features</p>
                            <Link draggable="false" href="/" className={styles.linkitem}>Garage</Link>
                            <Link draggable="false" href="/" className={styles.linkitem}>Space</Link>
                            {/* <Link draggable="false" href="/" className={styles.linkitem}>Voyager</Link> */}
                        </div>

                        <div className={styles.linkcolumn}>
                            <p className={styles.linklabel}>Resources</p>

                            <Link draggable="false" href="/" className={styles.linkitem}>Blogs</Link>
                            <Link draggable="false" href="/" className={styles.linkitem}>Brand kit</Link>
                        </div>

                        <div className={styles.linkcolumn}>

                            <p className={styles.linklabel}>Company</p>

                            <Link draggable="false" href="/" className={styles.linkitem}>About us</Link>
                            <Link draggable="false" href="/" className={styles.linkitem}>Careers</Link>
                            <Link draggable="false" href="/" className={styles.linkitem}>Legals</Link>
                        </div>


                    </div>

                    <div className={styles.socialscontainer}>

                        <div className={styles.socials}>
                            <Link target="_blank" draggable="false" href="https://www.linkedin.com/company/ontheorbit" className={styles.socialmedialink}>
                                <Icon name='linkedin' fill={'#fff'} size={34} />
                            </Link>

                            <Link target="_blank" draggable="false" href="https://www.instagram.com/ontheorbitdotcom/" className={styles.socialmedialink}>
                                <Icon name='instagram' fill={'#fff'} size={34} />
                            </Link>

                            <Link target="_blank" draggable="false" href="https://www.youtube.com/@ontheorbitdotcom" className={styles.socialmedialink}>
                                <Icon name='x' fill={'#fff'} size={34} />
                            </Link>
                        </div>
                    </div>

                </div>
                <div className={styles.footercontent}>
                    <h4 className={styles.passiontxt} style={{ textWrap: 'nowrap', width: '100%', maxWidth: '50%' }}>
                        Made with
                        <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 56 56" fill="none">
                            <path d="M49.371 12.34V18.508V18.51V24.678H49.363H43.203V18.51V18.508V12.34H49.371V6.17H43.207V0H37.039V6.17H37.036H30.868V12.34H24.696V6.17H18.528V0H12.356V6.17H12.352H6.18V12.34H0.00800133V18.508V18.51V24.678H0V30.848H6.172V37.018H12.344V43.188H18.516V49.358H24.688V55.527H30.86V49.358H37.028V43.188H43.196V37.018H49.364V30.848H55.532V24.678H55.54V18.51V18.508V12.34H49.371ZM37.028 30.848V24.678H37.036H43.196V30.848H37.028Z" fill="#FF2A2A" />
                        </svg>
                        in India  © 2025 On The Orbit
                    </h4>
                    <p>
                        All rights reserved. No part of this website or its content may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of On The Orbit, except in the case of brief quotations embodied in critical reviews and certain other noncommercial uses permitted by copyright law. For permission requests, contact On The Orbit.
                    </p>
                </div>

            </div>
        </footer>
    );
}

