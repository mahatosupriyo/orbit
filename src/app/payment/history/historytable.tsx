"use client";

import type React from "react";
import { useState } from "react";
import { Collapse } from "react-collapse";
import styles from "./history.module.scss";
import Icon from "@/components/atoms/icons";

// Type definitions for each payment entry
interface Payment {
  id: string;
  plan: string;
  status: string;
  createdAt: Date;
  amount: number;
  razorpayOrderId: string;
  razorpayPaymentId?: string | null;
}

// Props for PaymentTable component
interface PaymentTableProps {
  payments: Payment[];
}




/**
 * PaymentTable displays a list of user payments with expandable detail view.
 */
export default function PaymentTable({ payments }: PaymentTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Toggle accordion behavior
  const toggleCard = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  // Format date (e.g., 30 June 25)
  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "2-digit",
    });

  // Format time (e.g., 07.32 PM)
  const formatTime = (date: Date) =>
    new Date(date)
      .toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace(":", ".");

  // Handle empty payment state
  if (payments.length === 0) {
    return <p style={{ fontSize: "1.6rem" }}>No payments found.</p>;
  }

  return (
    <div className={styles.paymentwraper}>
      <div className={styles.portion}>
        <div className={styles.header}>
          <h1 className={styles.title}>Payments</h1>
        </div>

        <div className={styles.table}>
          {payments.map(payment => {
            const isOpen = expandedId === payment.id;

            let classNames = styles.tablehead;

            if (payment.status === "paid") {
              classNames += ` ${styles.paidtablehead}`;
            } else if (payment.status === "failed") {
              classNames += ` ${styles.failedtablehead}`;
            }

            return (
              <div
                key={payment.id}
                className={
                  payment.status === "paid"
                    ? styles.tablecontainer
                    : `${styles.tablecontainer} ${styles.failedcontainertable}`
                }
              >
                {/* Summary row */}
                <div
                  onClick={() => toggleCard(payment.id)}
                  style={{ cursor: "pointer" }}
                  className={classNames}
                >

                  <div className={styles.leftportion}>

                    <h2 className={styles.plan}>
                      {payment.plan === "pro" && "Pro Membership"}
                      {payment.plan === "exclusive" && "Exclusive Membership"}
                    </h2>

                  </div>

                  <div className={styles.rightportion}>
                    {/* Status Indicator */}
                    <div className={styles.status}>
                      <Icon
                        name={payment.status === "paid" ? "success" : "created"}
                        size={12}
                      />
                      <p className={styles.paymentstatus}>
                        {payment.status === "paid" ? "Paid" : "Failed"}
                      </p>
                    </div>

                    {/* Arrow toggle icon */}
                    <div
                      className={styles.toggleIcon}
                      style={{
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.3s ease",
                      }}
                    >
                      <Icon name="downarrow" size={28} fill="#000" />
                    </div>
                  </div>

                </div>

                {/* Expandable Details */}
                <Collapse isOpened={isOpen}>
                  <div className={styles.moreinfo}>

                    {/* Price and Plan */}
                    <h3 className={styles.price}>
                      <span className={styles.rupee}>₹</span>
                      {(payment.amount / 100).toFixed(2)}
                    </h3>


                    {/* Date & Time */}
                    <div className={styles.timing}>
                      <span className={styles.time}>{formatTime(payment.createdAt)}</span>
                      <span className={styles.date}>{formatDate(payment.createdAt)}</span>
                    </div>

                    <div className={styles.ids}>
                      <h2 className={styles.id}>
                        <span className={styles.label}>Order ID</span>
                        {payment.razorpayOrderId}
                      </h2>
                      <h2 className={styles.id}>
                        <span className={styles.label}>Payment ID</span>
                        {payment.razorpayPaymentId || "Not Available"}
                      </h2>
                    </div>
                  </div>
                </Collapse>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
