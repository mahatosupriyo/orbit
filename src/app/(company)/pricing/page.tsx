import styles from "./pricing.module.scss"

interface IconProps {
    name: string
    size: string
}

const Icon = ({ name, size }: IconProps) => {
    if (name === "check") {
        return (
            <svg width={size} height={size} viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.63427 9.86576L4.2928 7.5243L3.12207 8.69503L5.46353 11.0365L6.63427 12.2072L7.805 11.0365L13.2684 5.57308L12.0977 4.40234L6.63427 9.86576Z" fill="black" />
            </svg>
        )
    }
    return null
}

export default function PricingPage() {
    return (
        <div className={styles.pricecontainer}>
            <div className={styles.leftpanel}>
                <div className={styles.leftcontent}>
                    <div className={styles.leftcontentheader}>
                        <h2 className={styles.lefttitle}>Try Orbit for free</h2>
                        <p className={styles.leftsubtitle}>for curious minds just getting started</p>
                    </div>

                    <div className={styles.featurelist}>
                        <div className={styles.featureitem}>
                            <Icon name="check" size="20" />
                            <span>Garage access - Design inspirations only</span>
                        </div>
                        <div className={styles.featureitem}>
                            <Icon name="check" size="20" />
                            <span>Limited Odyssey episodes</span>
                        </div>
                    </div>
                    <div>
                        <button className={styles.freebutton}>Get started</button>
                    </div>
                    <p className={styles.disclaimer}>Start learning today - no card required.</p>
                </div>
            </div>

            <div className={styles.rightpanel}>
                <div className={styles.rightcontent}>
                    <h1 className={styles.maintitle}>
                        Orbit Pro<sup>+</sup>
                    </h1>
                    <p className={styles.tagline}>Step Into Orbit. One Phase at a Time.</p>

                    <div className={styles.phasescontainer}>
                        <div className={styles.phase}>
                            <h3 className={styles.phasetitle}>Phase zero</h3>
                            <div className={styles.featurelist}>
                                <div className={styles.featureitem}>
                                    <Icon name="check" size="20" />
                                    <span>Garage access</span>
                                </div>
                                <div className={styles.featureitem}>
                                    <Icon name="check" size="20" />
                                    <span>Odyssey episodes</span>
                                </div>
                                <div className={styles.featureitem}>
                                    <Icon name="check" size="20" />
                                    <span>One Y of Adobe Creative Cloud</span>
                                </div>
                                <div className={styles.featureitem}>
                                    <Icon name="check" size="20" />
                                    <span>Personalized Feedback</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.phase}>
                            <h3 className={styles.phasetitle}>Phase one</h3>
                            <div className={styles.featurelist}>
                                <div className={styles.featureitem}>
                                    <Icon name="check" size="20" />
                                    <span>1 Y of Godaddy (.com) domain</span>
                                </div>
                                <div className={styles.featureitem}>
                                    <Icon name="check" size="20" />
                                    <span>1 Y of Spotify Subscription</span>
                                </div>
                                <div className={styles.featureitem}>
                                    <Icon name="check" size="20" />
                                    <span>On-field brand trips</span>
                                </div>
                                <div className={styles.featureitem}>
                                    <Icon name="check" size="20" />
                                    <span>Orbit Awards recognization</span>
                                </div>
                            </div>
                            <p className={styles.nopressure}>No pressure. You'll know when it's time to continue.</p>
                        </div>
                    </div>

                    <div className={styles.pricinginfo}>
                        <p className={styles.journeycost}>
                            Entire journey costs <span className={styles.strikethrough}>₹72,499</span> ₹61,624 for
                            limited time, including both phases.
                        </p>
                    </div>

                    <div className={styles.bottomsection}>
                        <div className={styles.pricingsection}>
                            <h2 className={styles.currentprice}>Only ₹30,812 now</h2>
                            <p className={styles.pricereturn}>Phase zero price returns to ₹36,249 after Aug 30</p>
                            <p className={styles.refund}>7-day refund guarantee</p>
                        </div>

                        <div className={styles.buttonsection}>
                            <div>
                                <button className={styles.probutton}>Be Pro</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
