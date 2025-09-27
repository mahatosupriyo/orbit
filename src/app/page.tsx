import React from 'react'
import Lander from '@/components/layout/lander/lander'
// import OrbitNavigator from './orbitnavigator'
import { auth } from '@/auth'
import GaragePage from './(main)/garage/page';

export default async function HomePage() {
    const session = await auth();

    if (session?.user?.id) {
        return <GaragePage />
    } else {
        return <Lander />
    }
}
