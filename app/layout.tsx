import type { Metadata } from 'next'
import './globals.css'
import logo from '@/public/img/logo.png'

export const metadata: Metadata = {
  title: 'ConnectAngles - Fresh Minds, Fierce Missions',
  description: 'Submit your startup, find the right opportunities, and get discovered by the right people.',
  keywords: 'startup, innovation, networking, events, training, entrepreneurship',
  authors: [{ name: 'ConnectAngles' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',

  openGraph: {
    title: 'ConnectAngles - Fresh Minds, Fierce Missions',
    description: 'Submit your startup, find the right opportunities, and get discovered by the right people.',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: logo.src,           // ← use .src
        width: 800,
        height: 600,
        alt: 'ConnectAngles – Fresh Minds, Fierce Missions'
      }
    ]
  },

  twitter: {
    card: 'summary_large_image',
    title: 'ConnectAngles - Fresh Minds, Fierce Missions',
    description: 'Submit your startup, find the right opportunities, and get discovered by the right people.',
    images: [logo.src]          // ← or [ '/img/logo.png' ]
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Preconnects for Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Favicon */}
        <link rel="icon" href={logo.src} />
      </head>
      <body className="font-poppins antialiased">
        {children}
      </body>
    </html>
  )
}
