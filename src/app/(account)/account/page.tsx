import { getAuthUser } from '@/lib/getAuthUser'
import { db } from '@/server/db'
import { z } from 'zod'
import styles from './account.module.scss'
import NavBar from '@/components/molecules/navbar/navbar'
import AccountForm from './accountform'

export default async function AccountPage() {
  const sessionUser = await getAuthUser()
  if (!sessionUser.email) throw new Error('User email not found')

  const accountUser = await db.user.findUnique({
    where: { email: sessionUser.email },
    select: {
      name: true,
      email: true,
      username: true,
      image: true,
    },
  })

  if (!accountUser) throw new Error('User not found')

  const AccountUserSchema = z.object({
    name: z.string().nullable(),
    email: z.string().email(),
    username: z.string().nullable(),
    image: z.string().nullable(),
  })

  const parsedUser = AccountUserSchema.parse(accountUser)

  return (
    <div className={styles.wraper}>
      <NavBar />
      <div className={styles.container}>
        <AccountForm user={parsedUser} />
      </div>
    </div>
  )
}
