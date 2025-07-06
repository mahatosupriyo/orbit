import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import GaragePostView from './garageposts'
import { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://ontheorbit.com'),
  title: "Orbit Garage",
  keywords: ["eduburner", "on the orbit", "oto", "Ontheorbit", "On the orbit", "On The Orbit", "design", "design education", "graphics designing", "design courses", "ux designing", "ui ux", "courses", "tutorials", "graphics"],
  authors: [{ name: "On The Orbit Team" }],
  creator: "On The Orbit",
  publisher: "On The Orbit",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  openGraph: {
    title: "On The Orbit - Launchpad for designers",
    description: "Learn, create, and inspire — this is your Stage.",
    url: 'https://ontheorbit.com',
    siteName: 'On The Orbit',
    images: [
      {
        url: 'https://ontheorbit.com/essentials/og.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};


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
