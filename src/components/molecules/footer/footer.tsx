"use client"
import Link from 'next/link';
import styles from './footer.module.scss'
import Icon from '@/components/atoms/icons';
import { motion } from 'framer-motion';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <svg xmlns="http://www.w3.org/2000/svg" className={styles.logo} height="44" viewBox="0 0 59 22" fill="none">
                <path d="M8.13446 9.42857C6.90196 9.42857 5.85434 9.85995 4.9916 10.7227C4.12885 11.5854 3.69748 12.6331 3.69748 13.8655C3.69748 15.0775 4.12885 16.1148 4.9916 16.9776C5.40243 17.409 5.87488 17.7376 6.40896 17.9636C6.96359 18.169 7.53875 18.2717 8.13446 18.2717C8.73016 18.2717 9.29505 18.169 9.82913 17.9636C10.3632 17.7376 10.8459 17.409 11.2773 16.9776C12.1401 16.1148 12.5714 15.0775 12.5714 13.8655C12.5714 12.6331 12.1401 11.5854 11.2773 10.7227C10.3735 9.85995 9.32587 9.42857 8.13446 9.42857ZM8.13446 5.73109C9.26424 5.73109 10.3221 5.94678 11.3081 6.37815C12.2941 6.78898 13.1569 7.36415 13.8964 8.10364C14.6359 8.84314 15.211 9.70588 15.6218 10.6919C16.0532 11.6779 16.2689 12.7358 16.2689 13.8655C16.2689 14.9748 16.0532 16.0224 15.6218 17.0084C15.211 17.9944 14.6359 18.8571 13.8964 19.5966C13.1569 20.3361 12.2941 20.9216 11.3081 21.3529C10.3221 21.7638 9.26424 21.9692 8.13446 21.9692C7.00467 21.9692 5.94678 21.7638 4.96079 21.3529C3.97479 20.9216 3.11205 20.3361 2.37255 19.5966C1.63305 18.8571 1.04762 17.9944 0.616247 17.0084C0.205416 16.0224 0 14.9748 0 13.8655C0 12.7358 0.205416 11.6779 0.616247 10.6919C1.04762 9.70588 1.63305 8.84314 2.37255 8.10364C3.11205 7.36415 3.97479 6.78898 4.96079 6.37815C5.94678 5.94678 7.00467 5.73109 8.13446 5.73109Z" fill="white" />
                <path d="M21.364 7.33333C21.9392 6.86088 22.5862 6.47059 23.3052 6.16247C24.0447 5.85434 24.8766 5.70028 25.801 5.70028V9.39776C24.5685 9.39776 23.5209 9.82913 22.6581 10.6919C21.7954 11.5957 21.364 12.6433 21.364 13.8347V21.5686H17.6665V6.13165H21.364V7.33333Z" fill="white" />
                <path d="M35.6405 5.76191C36.7703 5.76191 37.8076 5.97759 38.7525 6.40896C39.718 6.8198 40.5499 7.39496 41.2483 8.13446C41.9467 8.87395 42.4911 9.7367 42.8814 10.7227C43.2717 11.7087 43.4668 12.7666 43.4668 13.8964C43.4668 15.0056 43.2717 16.0532 42.8814 17.0392C42.4911 18.0252 41.9467 18.888 41.2483 19.6275C40.5499 20.3669 39.718 20.9524 38.7525 21.3838C37.8076 21.7946 36.7703 22 35.6405 22C34.4285 22 33.3295 21.7638 32.3436 21.2913L33.6685 17.9944C34.1615 18.1998 34.7161 18.3025 35.3324 18.3025C36.5854 18.3025 37.633 17.8711 38.4752 17.0084C39.338 16.1457 39.7693 15.1083 39.7693 13.8964C39.7693 12.6639 39.338 11.6162 38.4752 10.7535C37.6125 9.89076 36.5648 9.45938 35.3324 9.45938C34.1409 9.45938 33.0933 9.89076 32.1895 10.7535C31.3267 11.6162 30.8954 12.6639 30.8954 13.8964V21.5994H27.1979V0H30.8954V7.39496C31.4911 6.9225 32.1792 6.53221 32.9598 6.22409C33.7404 5.91597 34.6339 5.76191 35.6405 5.76191Z" fill="white" />
                <path d="M44.8536 21.5686V6.16247H48.5511V21.5686H44.8536ZM44.8536 0H48.5511V3.69748H44.8536V0Z" fill="white" />
                <path d="M58.5475 21.5686H55.1582C54.4597 21.5686 53.8024 21.4351 53.1862 21.1681C52.5699 20.901 52.0358 20.5416 51.5839 20.0896C51.132 19.6172 50.7725 19.0728 50.5055 18.4566C50.2385 17.8403 50.1049 17.183 50.1049 16.4846V3.05042L53.8024 2.12605V8.0112H55.9593L56.8836 11.7087H53.8024V16.4846C53.8024 16.8749 53.9359 17.2035 54.203 17.4706C54.47 17.7376 54.7884 17.8711 55.1582 17.8711H57.6231L58.5475 21.5686Z" fill="white" />
                <path d="M44.8536 21.5686V6.16247H48.5511V21.5686H44.8536ZM44.8536 0H48.5511V3.69748H44.8536V0Z" fill="white" />
                <path d="M58.5476 21.5687H55.1582C54.4598 21.5687 53.8025 21.4352 53.1862 21.1682C52.57 20.9011 52.0359 20.5417 51.584 20.0897C51.1321 19.6173 50.7726 19.0729 50.5056 18.4567C50.2385 17.8404 50.105 17.1831 50.105 16.4847V3.05053L53.8025 2.12616V8.01131H55.9593L56.8837 11.7088H53.8025V16.4847C53.8025 16.875 53.936 17.2037 54.203 17.4707C54.4701 17.7377 54.7885 17.8713 55.1582 17.8713H57.6232L58.5476 21.5687Z" fill="white" />
            </svg>
            <div className={styles.footerwraper}>





                <div className={styles.footercontent}>


                    <div className={styles.socialscontainer}>

                        <div className={styles.socials}>
                            <Link target="_blank" draggable="false" href="https://www.linkedin.com/company/weareontheorbit" className={styles.socialmedialink}>
                                <Icon name='linkedin' fill={'#ccc'} size={34} />
                            </Link>

                            <Link target="_blank" draggable="false" href="https://www.instagram.com/weareontheorbit/" className={styles.socialmedialink}>
                                <Icon name='instagram' fill={'#ccc'} size={34} />
                            </Link>

                            <Link target="_blank" draggable="false" href="https://www.x.com/@weareontheorbit" className={styles.socialmedialink}>
                                <Icon name='x' fill={'#ccc'} size={34} />
                            </Link>
                        </div>

                    </div>

                </div>
                <div className={styles.footercontent}>

                    <div className={styles.legalwraper}>
                        <div className={styles.inlinewraper}>
                            <Link className={styles.linksinline} href="/">Privacy Policy</Link>
                        </div>
                        &
                        <div className={styles.inlinewraper}>
                            <Link className={styles.linksinline} href="/">Legal Terms</Link>
                        </div>
                    </div>
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

