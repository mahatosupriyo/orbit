import React from 'react'
import styles from './pricingtable.module.scss'
import Link from 'next/link'
import Icon from '@/components/atoms/icons'

const proFeatures = [
    "Browse all garage",
    "Odyssey access"
];

const exclusiveFeatures = [
    "Our exclusive community",
    "On ground work — to fuel your portfolio",
    "Get Adobe creative cloud for one year",
    "Godaddy (.com) domain for one year",
    "Spotify Premium for one year"
];

export default function Pricingtable() {
    return (
        <div className={styles.pricingtablecontainer}>
            <div className={styles.pricingtable}>
                <div className={styles.plan}>
                    <div className={styles.plantitle}>Pro</div>
                    <p className={styles.planprice}>₹12,499</p>
                    <button className={styles.planbtn}>
                        get started
                    </button>
                    <p className={styles.plandescription}>
                        Perfect for college students, and working creatives who prefer to learn on their own time and build skills solo.
                    </p>

                    <div className={styles.featureslist}>
                        <h1 className={styles.featuretitle}>Pro features</h1>

                        {proFeatures.map((feature, idx) => (
                            <span className={styles.feature} key={idx}>
                                <Icon name='check' size={8} />
                                {feature}
                            </span>
                        ))}
                    </div>
                </div>

                <div className={styles.plan}>
                    <div className={styles.plantitle}>Exclusive <div className={styles.tag}>Popular</div></div>
                    <p className={styles.planprice}>
                        ₹72,499
                    </p>
                    <button className={styles.planbtn}>
                        get started
                    </button>
                    <p className={styles.plandescription}>
                        Those who want to stay ahead of trends, and build a portfolio that actually opens doors. <br />
                        Those who believe on-ground experience matters more than theory. <br />
                        And those who know that design schools won’t get them there—but orbit will.
                    </p>

                    <div className={styles.featureslist}>
                        <h1 className={styles.featuretitle}>Everything in Pro plus</h1>
                        {exclusiveFeatures.map((feature, idx) => (
                            <span className={styles.feature} key={idx}>
                                <Icon name='check' size={8} />
                                {feature}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}


