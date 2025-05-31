"use client";

import React from "react";
import { motion } from 'framer-motion';
import styles from "./history.module.scss";

interface Payment {
    id: string;
    plan: string;
    status: string;
    createdAt: Date;
    amount: number;
    razorpayOrderId: string;
    razorpayPaymentId?: string | null;
}

interface PaymentTableProps {
    payments: Payment[];
}

const containerVariants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.15,
        },
    },
};

const childVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.785, 0.135, 0.15, 0.86],
        },
    },
};

const PaymentTable: React.FC<PaymentTableProps> = ({ payments }) => {
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "2-digit",
        });
    };

    const formatTime = (date: Date) => {
        return new Date(date)
            .toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            })
            .replace(":", ".");
    };

    if (payments.length === 0) {
        return <p>No payments found.</p>;
    }


    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className={styles.table}>
            {payments.map((payment) => (
                <motion.div className={styles.tablecontainer} key={payment.id} variants={childVariants}>
                    <div className={styles.tableinfo}>

                        {payment.plan === "pro" && (
                            <img
                                src="https://i.pinimg.com/736x/52/be/ce/52becefe0abc6b9da0f8a2ac2732cc29.jpg"  // Replace with your actual 'pro' image URL
                                alt="Orbit Pro Plan"
                                className={styles.banner}
                            />
                        )}
                        {payment.plan === "exclusive" && (
                            <img
                                src="https://i.pinimg.com/736x/5c/44/66/5c446611174b1419d36862e30978d10d.jpg"  // Replace with your actual 'exclusive' image URL
                                alt="Orbit Exclusive Plan"
                                className={styles.banner}
                            />
                        )}
                        <div className={styles.paymentinfo}>
                            <div className={styles.paymentdirectory}>
                                <div className={styles.status}>
                                    {payment.status === "paid" && (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="16" viewBox="0 0 16 16" fill="none">
                                            <path fillRule="evenodd" clipRule="evenodd" d="M8 16C10.1217 16 12.1566 15.1571 13.6569 13.6569C15.1571 12.1566 16 10.1217 16 8C16 5.87827 15.1571 3.84344 13.6569 2.34315C12.1566 0.842855 10.1217 0 8 0C5.87827 0 3.84344 0.842855 2.34315 2.34315C0.842855 3.84344 0 5.87827 0 8C0 10.1217 0.842855 12.1566 2.34315 13.6569C3.84344 15.1571 5.87827 16 8 16ZM11.857 6.191C11.9149 6.11129 11.9566 6.02095 11.9796 5.92514C12.0026 5.82933 12.0065 5.72994 11.991 5.63262C11.9756 5.5353 11.9412 5.44198 11.8897 5.35797C11.8382 5.27396 11.7707 5.20091 11.691 5.143C11.6113 5.08509 11.5209 5.04344 11.4251 5.02044C11.3293 4.99744 11.2299 4.99354 11.1326 5.00895C11.0353 5.02437 10.942 5.0588 10.858 5.11028C10.774 5.16176 10.7009 5.22929 10.643 5.309L7.16 10.099L5.28 8.219C5.21078 8.1474 5.128 8.0903 5.03647 8.05104C4.94495 8.01178 4.84653 7.99114 4.74694 7.99032C4.64736 7.9895 4.54861 8.00852 4.45646 8.04628C4.3643 8.08403 4.28059 8.13976 4.2102 8.21021C4.13982 8.28066 4.08417 8.36443 4.0465 8.45662C4.00883 8.54881 3.9899 8.64758 3.99081 8.74716C3.99173 8.84674 4.01246 8.94515 4.05181 9.03663C4.09116 9.12812 4.14834 9.21085 4.22 9.28L6.72 11.78C6.79663 11.8567 6.88896 11.9158 6.99065 11.9534C7.09233 11.9909 7.20094 12.006 7.30901 11.9975C7.41708 11.9891 7.52203 11.9573 7.61663 11.9044C7.71123 11.8515 7.79324 11.7787 7.857 11.691L11.857 6.191Z" fill="#34A853" />
                                        </svg>
                                    )}
                                    {payment.status === "created" && (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="16" viewBox="0 0 16 16" fill="none">
                                            <path fillRule="evenodd" clipRule="evenodd" d="M8 16C10.1217 16 12.1566 15.1571 13.6569 13.6569C15.1571 12.1566 16 10.1217 16 8C16 5.87827 15.1571 3.84344 13.6569 2.34315C12.1566 0.842855 10.1217 0 8 0C5.87827 0 3.84344 0.842855 2.34315 2.34315C0.842855 3.84344 0 5.87827 0 8C0 10.1217 0.842855 12.1566 2.34315 13.6569C3.84344 15.1571 5.87827 16 8 16ZM6.28 5.22C6.13782 5.08752 5.94978 5.0154 5.75548 5.01883C5.56118 5.02225 5.37579 5.10097 5.23838 5.23838C5.10097 5.37579 5.02225 5.56118 5.01883 5.75548C5.0154 5.94978 5.08752 6.13782 5.22 6.28L6.94 8L5.22 9.72C5.14631 9.78866 5.08721 9.87146 5.04622 9.96346C5.00523 10.0555 4.98319 10.1548 4.98141 10.2555C4.97963 10.3562 4.99816 10.4562 5.03588 10.5496C5.0736 10.643 5.12974 10.7278 5.20096 10.799C5.27218 10.8703 5.35701 10.9264 5.4504 10.9641C5.54379 11.0018 5.64382 11.0204 5.74452 11.0186C5.84523 11.0168 5.94454 10.9948 6.03654 10.9538C6.12854 10.9128 6.21134 10.8537 6.28 10.78L8 9.06L9.72 10.78C9.78866 10.8537 9.87146 10.9128 9.96346 10.9538C10.0555 10.9948 10.1548 11.0168 10.2555 11.0186C10.3562 11.0204 10.4562 11.0018 10.5496 10.9641C10.643 10.9264 10.7278 10.8703 10.799 10.799C10.8703 10.7278 10.9264 10.643 10.9641 10.5496C11.0018 10.4562 11.0204 10.3562 11.0186 10.2555C11.0168 10.1548 10.9948 10.0555 10.9538 9.96346C10.9128 9.87146 10.8537 9.78866 10.78 9.72L9.06 8L10.78 6.28C10.9125 6.13782 10.9846 5.94978 10.9812 5.75548C10.9777 5.56118 10.899 5.37579 10.7616 5.23838C10.6242 5.10097 10.4388 5.02225 10.2445 5.01883C10.0502 5.0154 9.86218 5.08752 9.72 5.22L8 6.94L6.28 5.22Z" fill="#EF3A3A" />
                                        </svg>
                                    )}
                                    <p className={styles.paymentstatus}>
                                        {payment.status === "paid" ? "Paid" : "Failed"}
                                    </p>
                                </div>

                                <h2 className={styles.plan}>
                                    {payment.plan === "pro" && "Orbit Pro"}
                                    {payment.plan === "exclusive" && "Orbit Exclusive"}
                                </h2>

                                <div className={styles.timing}>
                                    <h3 className={styles.time}>{formatTime(payment.createdAt)}</h3>
                                    <h3 className={styles.date}>{formatDate(payment.createdAt)}</h3>
                                </div>
                            </div>

                            <h3 className={styles.price}>
                                <span className={styles.rupee}>₹</span>
                                {(payment.amount / 100).toFixed(2)}
                            </h3>
                        </div>
                    </div>
                    <div className={styles.moreinfo}>
                        <h2 className={styles.id}>
                            <span className={styles.label}>Order ID</span>
                            {payment.razorpayOrderId}
                        </h2>
                        <h2 className={styles.id}>
                            <span className={styles.label}>Payment ID</span>
                            {payment.razorpayPaymentId || "Not Available"}
                        </h2>
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
};

export default PaymentTable;
