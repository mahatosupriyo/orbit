import { auth } from "@/auth";
import { db } from "@/server/db";
import React from "react";
import styles from "./history.module.scss";
import NavBar from "@/components/molecules/navbar/navbar";
import PaymentTable from "./historytable";
import { redirect } from "next/navigation";

const PaymentHistoryPage = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return redirect("/");
  }

  const payments = await db.payment.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className={styles.wraper}>
      <NavBar />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Payment history</h1>
        </div>
        <div className={styles.paymentwraper}>
          <PaymentTable payments={payments} />
        </div>
      </div>
    </div>
  );
};

export default PaymentHistoryPage;
