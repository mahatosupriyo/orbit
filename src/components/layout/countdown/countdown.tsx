"use client";

import React, { useEffect, useState } from "react";
import styles from "./countdown.module.scss";
import Icon from "@/components/atoms/icons";
import Link from "next/link";

type CountdownProps = {
  targetDate: string | Date; // e.g. "2025-12-31T23:59:59"
};

const Countdown: React.FC<CountdownProps> = ({ targetDate }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {
      days: "00",
      hours: "00",
      minutes: "00",
      seconds: "00",
    };

    if (difference > 0) {
      timeLeft = {
        days: String(Math.floor(difference / (1000 * 60 * 60 * 24))).padStart(2, "0"),
        hours: String(Math.floor((difference / (1000 * 60 * 60)) % 24)).padStart(2, "0"),
        minutes: String(Math.floor((difference / 1000 / 60) % 60)).padStart(2, "0"),
        seconds: String(Math.floor((difference / 1000) % 60)).padStart(2, "0"),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className={styles.container}>
      <p className={styles.heading}>Registration closing soon.</p>

      <div className={styles.grid}>
        <div className={styles.timeBox}>
          <p className={styles.value}>{timeLeft.days}</p>
          <span className={styles.label}>Day</span>
        </div>
        <div className={styles.timeBox}>
          <p className={styles.value}>{timeLeft.hours}</p>
          <span className={styles.label}>Hour</span>
        </div>
        <div className={styles.timeBox}>
          <p className={styles.value}>{timeLeft.minutes}</p>
          <span className={styles.label}>Min.</span>
        </div>
        <div className={styles.timeBox}>
          <p className={styles.value}>{timeLeft.seconds}</p>
          <span className={styles.label}>Sec.</span>
        </div>
      </div>

      <Link href="/" className={styles.button}>
        Book your seat now
        <Icon name="rightarrowbig" fill="#fff" size={10} />
        </Link>
    </div>
  );
};

export default Countdown;
