import { auth } from '@/auth'
import { redirect } from 'next/navigation'

/**
 * getAuthUser
 * - Retrieves the authenticated user's session.
 * - Redirects to the /auth page if the user is not authenticated or missing an email.
 * @returns The authenticated user object.
 */
export async function getAuthUser() {
    const session = await auth()

    // If no valid user session or email, redirect to auth page
    if (!session?.user?.email) {
        redirect('/auth')
    }

    // Return the authenticated user object
    return session.user
}