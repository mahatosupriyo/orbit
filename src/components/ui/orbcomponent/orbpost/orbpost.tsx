"use client"
import { motion } from 'framer-motion';
import OrbIcons from '../../atomorb/orbicons';
import styles from './orbpost.module.scss';
import Link from 'next/link';

const avatarSrc = "https://media.licdn.com/dms/image/v2/D5603AQF4o-W_kVz0KQ/profile-displayphoto-scale_200_200/B56ZgKMja6G0Ac-/0/1752517721166?e=2147483647&v=beta&t=FC81sV5NNZY2QbHkcDknyDyooXUub9Z44Fz41iadF_Q"

export default function OrbPost() {
    return (
        <div className={styles.orbpost}>
            <div className={styles.orbpostwraper}>
                <div className={styles.layer}>
                    <img
                        draggable="false"
                        src={avatarSrc}
                        className={styles.avatar} />

                    <div className={styles.postcontent}>
                        <Link draggable="false" href="/test" className={styles.username}>
                            supriyomahato
                            <OrbIcons name='verified' size={10} />
                        </Link>
                        <p className={styles.poststory}>
                            FigJam said boo
                            <br />
                            → Themed cursors and icons
                            <br />
                            → Spooky time music
                            <br />
                            → Washi tape
                            <br />
                            → Carve a pumpkin widget
                            <br /><br />
                            <a href="figma.com/fof" className={styles.inlinelink} target='_blank'>
                                figma.com/fof
                            </a>
                        </p>

                        <div className={styles.usercontrols}>
                            <motion.button
                                whileTap={{ scale: 0.98, opacity: 0.6 }}
                                className={styles.likebtn}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 9" fill="none" className={styles.hearticon}>
                                    <path d="M2.69336 0.500977C2.98464 0.500434 3.27336 0.557254 3.54199 0.669922C3.81044 0.782554 4.05319 0.948232 4.25684 1.15625H4.25781L4.99805 1.91016L4.99902 1.90918L5.73828 1.15723C5.94204 0.948922 6.18537 0.783572 6.4541 0.670898C6.72253 0.558356 7.011 0.501439 7.30176 0.501953H7.30273L7.30469 0.500977L7.30371 0.501953C7.59509 0.501388 7.88366 0.558141 8.15234 0.670898C8.3544 0.755745 8.54266 0.870473 8.70996 1.01074L8.87012 1.15918L8.87109 1.16016C9.27041 1.57131 9.49322 2.12215 9.49316 2.69531C9.4931 3.26857 9.26965 3.81937 8.87012 4.23047L8.86816 4.23242L5.68066 7.47656L5.68164 7.47754C5.59257 7.56898 5.48586 7.64196 5.36816 7.69141C5.25083 7.74065 5.12475 7.76482 4.99805 7.76465L4.99902 7.76562H4.99609V7.76465C4.8697 7.76461 4.74451 7.74029 4.62793 7.69141C4.51065 7.64217 4.40434 7.56944 4.31543 7.47852L1.12695 4.23438L1.125 4.2334C0.724212 3.82201 0.5 3.26966 0.5 2.69531C0.500065 2.12108 0.724301 1.56953 1.125 1.1582H1.12598C1.33003 0.949264 1.57346 0.782899 1.84277 0.669922C2.11141 0.557271 2.40013 0.500423 2.69141 0.500977V0.5H2.69434L2.69336 0.500977Z" />
                                </svg>
                                3m
                            </motion.button>
                        </div>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.98, opacity: 0.6 }}
                        className={styles.moreicon}>
                            more
                        {/* <OrbIcons name='more' fill='#fff' size={30} /> */}
                    </motion.button>
                </div>
            </div>
        </div>
    )
}