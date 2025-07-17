import React from 'react'
import Lander from './lander/page'
import OrbitNavigator from './orbitnavigator'
import { auth } from '@/auth'

export default async function HomePage() {
    const session = await auth();

    if (session?.user?.id) {
        return <OrbitNavigator />
    } else {
        return <Lander />
    }
}
