import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import GarageFeed from './components/garage-feed'
import GaragePostCard from './components/garage-card'
import GaragePostView from './garageposts'

export default async function GaragePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  return (
    <div className="container mx-auto px-4 py-8">

      <GaragePostView/>
      {/* <GarageFeed userId={session.user.id} /> */}
    </div>
  )
}
