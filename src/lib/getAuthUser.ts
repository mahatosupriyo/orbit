import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export async function getAuthUser() {
    const session = await auth()

    if (!session?.user?.email) {
        redirect('/auth')
    }

    return session.user
}