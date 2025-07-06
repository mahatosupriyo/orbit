import { getAuthUser } from '@/lib/getAuthUser'
import { db } from '@/server/db'
import { z } from 'zod'
import styles from './account.module.scss'
import NavBar from '@/components/molecules/navbar/navbar'
import AccountForm from './accountform'
import { redirect } from 'next/navigation'
import AccountNav from '../accountnav/accountnav'
import BackBtn from '@/components/atoms/(buttons)/backbtn/backbtn'
import { Metadata } from 'next'


export const metadata: Metadata = {
  metadataBase: new URL('https://ontheorbit.com'),
  title: "Account Core",
};

/**
 * AccountPage - Server component for the account settings page.
 * - Fetches the authenticated user's data from the database.
 * - Validates user data using Zod schema for type safety.
 * - Renders the account form and navigation bar.
 * - Throws descriptive errors if user is not found or not authenticated.
 */
export default async function AccountPage() {
  // Get the authenticated user session
  const sessionUser = await getAuthUser()
  if (!sessionUser.email) {
    return redirect('/auth')
  }

  // Fetch user data from the database
  const accountUser = await db.user.findUnique({
    where: { email: sessionUser.email },
    select: {
      name: true,
      email: true,
      username: true,
      image: true,
    },
  })

  if (!accountUser) {
    return redirect('/auth')
  }

  // Zod schema for validating user data
  const AccountUserSchema = z.object({
    name: z.string().nullable(),
    email: z.string().email(),
    username: z.string().nullable(),
    image: z.string().nullable(),
  })

  // Validate user data
  const parsedUser = AccountUserSchema.parse(accountUser)

  // Render the account settings page
  return (
    <div className={styles.wraper}>
      <NavBar />
      <div className={styles.container}>
        <BackBtn />
        <div className={styles.layoutgrid}>
          <AccountNav />
          <AccountForm user={parsedUser} />
        </div>
      </div>
    </div>
  )
}