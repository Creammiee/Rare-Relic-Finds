import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: 'Rare Relic Finds — Premium Collectibles Marketplace',
    template: '%s | Rare Relic Finds',
  },
  description:
    'Discover and acquire the world\'s rarest collectibles, trading cards, vintage items, memorabilia, antiques, and limited-edition relics. Authenticated. Curated. Exceptional.',
  keywords: ['collectibles', 'rare items', 'trading cards', 'vintage', 'memorabilia', 'antiques', 'funko pop', 'comics', 'coins', 'stamps'],
  openGraph: {
    title: 'Rare Relic Finds — Premium Collectibles Marketplace',
    description: 'The world\'s premier marketplace for rare collectibles and extraordinary relics.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} bg-black-900 text-silver-200 antialiased`}>
        <Navbar />
        <main className="min-h-screen pt-[72px]">
          {children}
        </main>
        <Footer />
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: 'rgba(10,10,11,0.95)',
              border: '1px solid rgba(212,175,55,0.2)',
              color: '#e2e8f0',
            },
          }}
        />
      </body>
    </html>
  )
}
