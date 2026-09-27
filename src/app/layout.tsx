import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import JsonLd from '@/components/JsonLd'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'MGL 365 Management | Premium Villa Rentals in Antigua',
  description:
    'Premium villa rentals & property management in Antigua. Where homes are cared for and dreams come true.',
  icons: {
    icon: '/favicon.png',
  },
  verification: {
    google: '7Q3pWm6YrP-UNXUsdFJv8I6gdO8On3UbsQ2iJyWLsDQ',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-[var(--font-inter)]">
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'MGL 365 Management',
          url: 'https://www.mgl365antigua.com',
          logo: 'https://www.mgl365antigua.com/logo.png',
          email: 'info@mgl365antigua.com',
          telephone: '+12687885675',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Antigua',
            addressCountry: 'AG',
          },
          sameAs: [],
        }} />
        {children}
      </body>
    </html>
  )
}
