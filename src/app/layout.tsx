import type { Metadata } from "next";
import "./styles/global.scss";
import "./styles/global.css";
import Head from "next/head";
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast'


export const metadata: Metadata = {
  metadataBase: new URL('https://ontheorbit.com'),
  title: {
    default: "On The Orbit",
    template: "%s | On The Orbit",
  },
  description: "Learn, create, and inspire — this is your Stage.",
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
  twitter: {
    card: 'summary_large_image',
    title: 'On The Orbit - Launchpad for designers',
    description: 'Learn, create, and inspire — this is your Stage.',
    images: ['https://ontheorbit.org/essentials/og.png'],
    creator: '@ontheorbit',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <Head>
        
        <link rel="stylesheet" href="https://use.typekit.net/ika2qcu.css"></link>
        
      </Head>
      <body>
        <Toaster
          position="bottom-center"
          reverseOrder={false}
          toastOptions={{
            duration: 2000,
            style: {
              background: '#363636',
              color: '#fff',
              height: '5.4rem',
              paddingLeft: '1rem',
              display: 'flex',
              alignItems: 'center',
              fontWeight: 400,
              fontSize: '1.56rem',
              borderRadius: '10rem'
            },
          }}
        />
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}