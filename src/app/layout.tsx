import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import NextTopLoader from 'nextjs-toploader'
import { Analytics } from '@vercel/analytics/react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './globals.css'
import ReactQueryProvider from '@/providers/ReactQueryProvider'

const defaultUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: 'Custom Artwork | Turn a Place You Love into Timeless Art',
    template: '%s | Custom Artwork',
  },
  description:
    'Commission a bespoke artwork from a photo of a place you love. Hand-drawn in the UK, printed and framed to order.',
  keywords: [
    'custom artwork',
    'bespoke art',
    'commissioned art',
    'UK art prints',
    'framed prints',
    'coastal art',
    'landscape art',
  ],
  authors: [{ name: 'Holly' }],
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    siteName: 'Custom Artwork',
    title: 'Turn a Place You Love into Timeless Art',
    description:
      'Commission a bespoke artwork from a photo of a place you love. Hand-drawn in the UK, printed and framed to order.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Custom Artwork',
    description: 'Turn a place you love into timeless art',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const geistSans = Geist({
  variable: '--font-geist-sans',
  display: 'swap',
  subsets: ['latin'],
})

type RootLayoutProps = {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <NextTopLoader showSpinner={false} height={2} color="#4A90A4" />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            {children}
            <Analytics />
            <ReactQueryDevtools initialIsOpen={false} />
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
