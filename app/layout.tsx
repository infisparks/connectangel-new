import type { Metadata } from 'next'
import './globals.css'

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
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ConnectAngles - Fresh Minds, Fierce Missions',
    description: 'Submit your startup, find the right opportunities, and get discovered by the right people.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-poppins antialiased">
        {children}
      </body>
    </html>
  )
}