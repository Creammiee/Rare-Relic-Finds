import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Category } from '@/lib/types'
import { Grid3X3 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Categories',
  description: 'Browse all collectible categories — trading cards, vintage toys, coins, memorabilia, antiques and more.',
}

const categoryEmojis: Record<string, string> = {
  'Trading Cards': '🃏', 'Action Figures': '🤖', 'Funko Pops': '🎭',
  'Comics': '📚', 'Vintage Toys': '🪀', 'Coins': '🪙', 'Stamps': '✉️',
  'Sports Memorabilia': '🏆', 'Movie Memorabilia': '🎬', 'Rare Books': '📖',
  'Antiques': '🏺', 'Jewelry': '💎', 'Art': '🖼️', 'Music Memorabilia': '🎵',
  'Gaming': '🎮', 'Pottery': '🫙', 'Watches': '⌚', 'Posters': '📜',
}

const gradients = [
  'from-amber-500/20 to-orange-500/10',
  'from-purple-500/20 to-blue-500/10',
  'from-blue-500/20 to-cyan-500/10',
  'from-green-500/20 to-emerald-500/10',
  'from-red-500/20 to-pink-500/10',
  'from-yellow-500/20 to-amber-500/10',
  'from-indigo-500/20 to-purple-500/10',
  'from-teal-500/20 to-green-500/10',
  'from-rose-500/20 to-red-500/10',
  'from-cyan-500/20 to-blue-500/10',
]

export default async function CategoriesPage() {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('categories')
    .select('*, product_count:products(count)')
    .is('parent_id', null)
    .order('name')

  const categories = (data as (Category & { product_count: { count: number }[] })[]) ?? []

  return (
    <div className="min-h-screen bg-luxury py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 glass-gold rounded-full px-4 py-1.5 mb-5">
            <Grid3X3 className="w-4 h-4 text-gold-400" />
            <span className="text-xs font-semibold text-gold-400 uppercase tracking-wider">All Categories</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-silver-100 mb-4">
            Browse the <span className="text-shimmer">Vault</span>
          </h1>
          <p className="text-silver-400 max-w-xl mx-auto">
            Every category of rare and extraordinary collectible, expertly curated and authenticated.
          </p>
        </div>

        {/* Category Grid */}
        {categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {categories.map((cat, i) => {
              const count = cat.product_count?.[0]?.count ?? 0
              return (
                <Link key={cat.id} href={`/categories/${cat.slug}`} className="group">
                  <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${gradients[i % gradients.length]} border border-white/8 p-6 text-center hover-lift hover:border-gold-400/30 transition-all duration-300 min-h-[160px] flex flex-col items-center justify-center`}>
                    <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">
                      {categoryEmojis[cat.name] ?? '🏺'}
                    </div>
                    <h3 className="text-sm font-semibold text-silver-100 group-hover:text-gold-400 transition-colors mb-1">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-silver-500">
                      {count > 0 ? `${count} items` : 'Coming soon'}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-24 glass rounded-2xl">
            <Grid3X3 className="w-14 h-14 text-silver-600 mx-auto mb-4" />
            <p className="text-silver-400">Categories are being set up. Check back shortly.</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center glass-gold rounded-2xl p-10 border border-gold-400/20">
          <h2 className="font-display text-2xl font-bold text-silver-100 mb-3">Don&apos;t see your category?</h2>
          <p className="text-silver-400 text-sm mb-6">We&apos;re constantly expanding. Reach out and we&apos;ll add your niche.</p>
          <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-400/20 border border-gold-400/40 text-gold-400 font-semibold hover:bg-gold-400/30 transition-all">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
}
