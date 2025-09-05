"use client";

import { useEffect, useState } from "react";
import NumberFlow from "@number-flow/react";

import Icon from '@/components/atoms/icons';
import styles from './contact.module.scss';
import Footer from "@/components/molecules/footer/footer";

export default function ContactPage() {

    const [time, setTime] = useState(new Date());
    const [showColon, setShowColon] = useState(true);


    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        const colonBlink = setInterval(() => setShowColon((c) => !c), 500);

        return () => {
            clearInterval(timer);
            clearInterval(colonBlink);
        };
    }, []);

    const hours = time.getHours() % 12 || 12;
    const minutes = time.getMinutes();
    const ampm = time.getHours() >= 12 ? "PM" : "AM";

    return (
        <div className={styles.wraper}>

            <div className={styles.container}>
                <a style={{ textDecoration: 'none' }} href="/" target="_blank">
                    <Icon name='oto' fill="#fff" size={40} />
                </a>

                <div className={styles.pagewraper}>
                    <div className={styles.pagecontainer}>
                        <div className={styles.heading}>
                            <h1 className={styles.pagetitle}>
                                Reach out
                                <br />
                                to Orbit
                            </h1>
                            <h5 className={styles.pagedescription}>
                                India
                            </h5>
                        </div>

                        <div className={styles.clock}>
                            <span className={styles.bar}></span>

                            <div className={styles.time}>
                                <NumberFlow value={hours} />
                                {showColon ? ":" : " "}
                                <NumberFlow value={minutes} />
                                <span> {ampm}</span>
                                <br />
                                <span>
                                    Indian Standard Time
                                </span>
                            </div>

                        </div>

                        <div className={styles.framewaper}>
                            <span className={styles.subheading}>
                                Support / Partner
                            </span>
                            <h2 className={styles.subdescription}>
                                <span className={styles.prefixspace}></span>Whether you need support, have a question, or want to partner with us, our team is here to connect with you.
                            </h2>
                        </div>

                        <div className={styles.framewaper}>
                            <span></span>
                            <div className={styles.subfrwrap}>

                                <div className={styles.wrapeven}>
                                    <span className={styles.subheading}>
                                        Mail us at
                                    </span>
                                    <h2 className={styles.email}>
                                        [contact@ontheorbit.com]
                                    </h2>
                                </div>

                                <div className={styles.wrapeven}>
                                    <span className={styles.subheading}>
                                        Call us at
                                    </span>
                                    <h2 className={styles.email}>
                                        [03252356616]
                                    </h2>
                                </div>

                                <div className={styles.wrapeven}>
                                    <span className={styles.subheading}>
                                        Address
                                    </span>
                                    <h2 className={styles.email}>
                                        Kolkata, Newtown, West Bengal 700135
                                    </h2>
                                </div>
                            </div>
                        </div>

                        <div className={styles.socialwraper}>
                            <span></span>
                            <span></span>
                            <div className={styles.socialsfr}>
                                <span className={styles.subheading}>
                                    Socials
                                </span>
                                <div className={styles.sociallist}>
                                    <a target="_blank" className={styles.sociallink} href="https://instagram.com/weareontheorbit">Instagram</a>
                                    <a target="_blank" className={styles.sociallink} href="https://youtube.com/@weareontheorbit">YouTube</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer/>
        </div>
    )
}