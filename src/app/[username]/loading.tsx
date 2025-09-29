import React from "react";
import NavBar from "@/components/molecules/navbar/navbar";
import BackBtn from "@/components/atoms/(buttons)/backbtn/backbtn";
import ShimmerLoader from "@/components/atoms/loading/loadingbox";
import styles from "./username.module.scss";

export default function Loading() {
    return (
        <div>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6rem'
            }}>
                <BackBtn />

                <div className={styles.userProfile}>
                    <ShimmerLoader height="100px" width="100px" borderRadius="50rem" />
                </div>

                {/* Posts */}
                <div className={styles.postsSection}>
                    <h2 className={styles.sectionTitle}></h2>
                    <div className={styles.gridpostlayout}>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <ShimmerLoader
                                key={i}
                                className={styles.dropcard}
                                height="100%"
                                width="100%"
                                aspect-ratio="4/5"
                                borderRadius="1.6rem"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
