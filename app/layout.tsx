import type { Metadata } from 'next'
import './globals.css'
import logo from "@/public/img/logo.png"
import Footer from '@/components/Footer'
import Navigation from '@/components/Navigation'
import 'flag-icon-css/css/flag-icons.min.css';
export const metadata: Metadata = {
  title: 'ConnectAngles - Fresh Minds, Fierce Missions',
  description: 'Submit your startup, find the right opportunities, and get discovered by the right people.',
  keywords: 'startup, innovation, networking, events, training, entrepreneurship',
  authors: [{ name: 'ConnectAngles' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',

  // Open Graph for WhatsApp, Facebook, etc.
  openGraph: {
    title: 'ConnectAngles - Fresh Minds, Fierce Missions',
    description: 'Submit your startup, find the right opportunities, and get discovered by the right people.',
    type: 'website',
    locale: 'en_US',
    // path to your thumbnail in public/img
    images: [
      {
        url: "https://raw.githubusercontent.com/infisparks/images/refs/heads/main/connectangle.png",
        width: 800,
        height: 600,
        alt: 'ConnectAngles – Fresh Minds, Fierce Missions'
      }
    ]
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'ConnectAngles - Fresh Minds, Fierce Missions',
    description: 'Submit your startup, find the right opportunities, and get discovered by the right people.',
    images: ['https://raw.githubusercontent.com/infisparks/images/refs/heads/main/connectangle.png']
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
        {/* Preconnects */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Favicon / Thumbnail */}
        <link rel="icon" href="/img/whatsapp-thumbnail.png" />
      </head>
      <body className="font-poppins antialiased">
        <Navigation/>
        {children}
        <Footer/>
      </body>
    </html>
  )
}
