import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import GaragePostView from './garageposts'
import { Metadata } from 'next';

export default async function GaragePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  if (session.user.role !== 'ADMIN') redirect('/')

  return (
    <div>
      <GaragePostView />
    </div>
  )
}