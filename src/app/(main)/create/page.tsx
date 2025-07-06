import React from 'react'
import GaragePostUploader from './createlayout'
import { auth } from '@/auth'
import { redirect } from "next/navigation";


export default async function CreatePage() {
    const session = await auth()

    if (!session) {
        redirect("/auth"); // 🔐 not logged in
    }
    if (session.user.role !== "ADMIN") {
        redirect("/"); // 🚫 not an admin
    }

    return (
        <GaragePostUploader />
    )
}