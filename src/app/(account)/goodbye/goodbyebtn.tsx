"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteAccount } from "./goodbye"; // Adjust import if needed
import styles from "./goodbye.module.scss"; // SCSS module for styles

export default function DeleteAccountButton() {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleDelete = () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete your account? This action is permanent and cannot be undone."
        );

        if (!confirmed) return;

        startTransition(async () => {
            const res = await deleteAccount();

            if (res.success) {
                // Optionally replace this with a toast
                console.log("Account deleted successfully");
                router.replace("/auth"); // Redirect to auth page after deletion
            } else {
                alert(res.message || "Something went wrong. Try again.");
            }
        });
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className={styles.deleteButton}
        >
            {isPending ? "Deleting..." : "Delete my account"}
        </button>
    );
}
