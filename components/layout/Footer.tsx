import React from 'react'
import Link from 'next/link'
import { Gem, Mail, Globe, Share2, Play, X } from 'lucide-react'

const footerLinks = {
  Marketplace: [
    { label: 'Browse All', href: '/marketplace' },
    { label: 'Categories', href: '/categories' },
    { label: 'Featured Relics', href: '/marketplace?featured=true' },
    { label: 'New Arrivals', href: '/marketplace?sort=newest' },
    { label: 'Trending', href: '/marketplace?sort=trending' },
  ],
  Sellers: [
    { label: 'Become a Seller', href: '/seller/apply' },
    { label: 'Seller Dashboard', href: '/seller/dashboard' },
    { label: 'Seller Directory', href: '/sellers' },
    { label: 'Seller Guidelines', href: '/about#sellers' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Authentication', href: '/about#authentication' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
  Support: [
    { label: 'Help Center', href: '/contact' },
    { label: 'Track Order', href: '/orders' },
    { label: 'Returns', href: '/contact' },
    { label: 'Shipping Info', href: '/about#shipping' },
  ],
}

const socials = [
  { icon: X, href: '#', label: 'X (Twitter)' },
  { icon: Share2, href: '#', label: 'Instagram' },
  { icon: Globe, href: '#', label: 'Facebook' },
  { icon: Play, href: '#', label: 'YouTube' },
  { icon: Mail, href: 'mailto:hello@rarerelicfinds.com', label: 'Email' },
]

export default function Footer() {
  return (
    <footer className="bg-black-950 border-t border-white/6 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-600 to-gold-400 flex items-center justify-center shadow-lg">
                <Gem className="w-5.5 h-5.5 text-black-950" />
              </div>
              <div>
                <div className="font-display font-bold text-xl text-shimmer">Rare Relic Finds</div>
              </div>
            </Link>
            <p className="text-silver-500 text-sm leading-relaxed mb-6 max-w-xs">
              The world&apos;s premier marketplace for rare collectibles, vintage treasures, 
              trading cards, and extraordinary relics. Authenticated. Curated. Exceptional.
            </p>
            <div className="flex items-center gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-silver-500 hover:text-gold-400 hover:border-gold-400/40 hover:bg-gold-400/8 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-display text-sm font-semibold text-gold-400 uppercase tracking-wider mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-silver-500 hover:text-silver-200 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="divider-gold mb-8" />

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
          {['Authenticated Products', 'Secure Payments', 'Buyer Protection', 'Expert Grading', 'Worldwide Shipping'].map((badge) => (
            <div key={badge} className="flex items-center gap-2 text-xs text-silver-600">
              <div className="w-1.5 h-1.5 rounded-full bg-gold-400/60" />
              {badge}
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-silver-600">
          <p>&copy; {new Date().getFullYear()} Rare Relic Finds. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-silver-400 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-silver-400 transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-silver-400 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
