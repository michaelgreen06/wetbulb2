import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Wetbulb Temperature Calculator',
  description: 'Calculate and monitor wetbulb temperatures for any location',
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      }
    ]
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Script src="https://analytics.ahrefs.com/analytics.js" data-key="3I22XXvbGakzvXR4aAEzfg" strategy="afterInteractive" />
        <main className="min-h-screen bg-gray-50 py-8 px-4">
          {children}
        </main>
      </body>
    </html>
  )
}
