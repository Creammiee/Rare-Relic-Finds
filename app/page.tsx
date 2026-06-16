import React from 'react'
import Link from 'next/link'
import { ArrowRight, Shield, Star, Zap, Globe, Award, Gem, TrendingUp, Package } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Product, Category } from '@/lib/types'
import ProductCard from '@/components/cards/ProductCard'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('products')
    .select('*, seller:sellers(store_name, verified), category:categories(name, slug)')
    .eq('status', 'approved')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(8)
  return (data as Product[]) ?? []
}

async function getCategories(): Promise<Category[]> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .is('parent_id', null)
    .order('name')
    .limit(10)
  return (data as Category[]) ?? []
}



const categoryIcons: Record<string, string> = {
  'Trading Cards': '🃏',
  'Action Figures': '🤖',
  'Funko Pops': '🎭',
  'Comics': '📚',
  'Vintage Toys': '🪀',
  'Coins': '🪙',
  'Stamps': '✉️',
  'Sports Memorabilia': '🏆',
  'Movie Memorabilia': '🎬',
  'Rare Books': '📖',
  'Antiques': '🏺',
  'Jewelry': '💎',
}

const features = [
  {
    icon: Shield,
    title: 'Authenticated & Verified',
    description: 'Every relic is professionally graded and authenticated by our expert team before listing.',
  },
  {
    icon: Star,
    title: 'Rarity Scoring System',
    description: 'Our proprietary rarity engine scores each item 1–10, ensuring you know exactly what you\'re acquiring.',
  },
  {
    icon: Globe,
    title: 'Worldwide Delivery',
    description: 'Secure, insured shipping to over 120 countries with real-time tracking on every order.',
  },
  {
    icon: Award,
    title: 'Expert Curation',
    description: 'Our specialists hand-curate every category to surface only the most extraordinary finds.',
  },
]

const testimonials = [
  {
    name: 'Marcus Chen',
    role: 'Trading Card Collector',
    comment: 'Rare Relic Finds completely transformed my collection. The authentication process is top-tier and I\'ve found pieces I never thought I\'d own.',
    rating: 5,
  },
  {
    name: 'Elena Vasquez',
    role: 'Vintage Toy Enthusiast',
    comment: 'The rarity scores are genuinely accurate. I\'ve built an incredible vintage toy collection and the platform experience is unmatched.',
    rating: 5,
  },
  {
    name: 'James Whitfield',
    role: 'Sports Memorabilia Investor',
    comment: 'As a serious collector, I demand authenticity. This platform delivers. My investment portfolio is up 40% from items purchased here.',
    rating: 5,
  },
]

export default async function LandingPage() {
  const [featured, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ])

  return (
    <div className="bg-luxury">
      {/* ── Hero Section ── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-400/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold-600/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-400/3 rounded-full blur-3xl" />
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-4xl mx-auto text-center stagger-children">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 glass-gold rounded-full px-4 py-1.5 mb-8">
              <Gem className="w-4 h-4 text-gold-400" />
              <span className="text-xs font-semibold text-gold-400 tracking-wider uppercase">
                The Premium Relic Marketplace
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-silver-100 mb-6 leading-tight">
              Discover the World&apos;s{' '}
              <span className="text-shimmer">Rarest Relics</span>
            </h1>

            <p className="text-xl text-silver-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              From graded trading cards to authenticated memorabilia, rare coins to 
              limited-edition figures — your extraordinary collection starts here.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button size="xl" asChild>
                <Link href="/marketplace">
                  Explore the Vault
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link href="/seller/apply">
                  Sell Your Relics
                </Link>
              </Button>
            </div>


          </div>
        </div>
      </section>

      {/* ── Categories Section ── */}
      {categories.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-silver-100 mb-4">
              Browse by <span className="text-shimmer">Category</span>
            </h2>
            <p className="text-silver-500 max-w-xl mx-auto">
              Every genre of collectible, curated and graded by our expert team.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/categories/${cat.slug}`} className="group">
                <div className="relative rounded-2xl overflow-hidden bg-card border border-white/6 p-6 text-center hover-lift hover:border-gold-400/30 transition-all duration-300">
                  <div className="text-4xl mb-3">{categoryIcons[cat.name] ?? '🏺'}</div>
                  <h3 className="text-sm font-semibold text-silver-200 group-hover:text-gold-400 transition-colors">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-xs text-silver-600 mt-1 line-clamp-2">{cat.description}</p>
                  )}
                </div>
              </Link>
            ))}
            <Link href="/categories" className="group">
              <div className="relative rounded-2xl overflow-hidden glass-gold border border-gold-400/20 p-6 text-center hover-lift hover:border-gold-400/50 transition-all duration-300">
                <div className="text-4xl mb-3">✨</div>
                <h3 className="text-sm font-semibold text-gold-400">View All</h3>
                <p className="text-xs text-gold-600 mt-1">All Categories</p>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* ── Featured Collectibles ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-gold-400" />
              <span className="text-xs font-semibold text-gold-400 uppercase tracking-widest">Curated Picks</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-silver-100">
              Featured <span className="text-shimmer">Relics</span>
            </h2>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/marketplace?featured=true">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass rounded-2xl">
            <Gem className="w-12 h-12 text-gold-400/40 mx-auto mb-4" />
            <p className="text-silver-500">Featured relics coming soon. Check back shortly.</p>
          </div>
        )}
      </section>

      {/* ── Features Grid ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-silver-100 mb-4">
            Why <span className="text-shimmer">Rare Relic Finds</span>
          </h2>
          <p className="text-silver-500 max-w-xl mx-auto">
            We built the platform we always wished existed for serious collectors.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="glass rounded-2xl p-6 border border-white/6 hover:border-gold-400/20 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-gold-400/10 border border-gold-400/20 flex items-center justify-center mb-4 group-hover:glow-gold-sm transition-all">
                <Icon className="w-6 h-6 text-gold-400" />
              </div>
              <h3 className="font-semibold text-silver-100 mb-2">{title}</h3>
              <p className="text-sm text-silver-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-silver-100 mb-4">
            Collector <span className="text-shimmer">Stories</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="glass rounded-2xl p-6 border border-white/6 hover:border-gold-400/15 transition-all duration-300">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-gold-400 fill-current" />
                ))}
              </div>
              <p className="text-silver-300 text-sm leading-relaxed mb-4 italic">&ldquo;{t.comment}&rdquo;</p>
              <div>
                <p className="text-silver-100 font-semibold text-sm">{t.name}</p>
                <p className="text-silver-500 text-xs">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-10">
        <div className="relative rounded-3xl overflow-hidden glass-gold border border-gold-400/20 p-12 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.1),transparent_70%)]" />
          <div className="relative">
            <Gem className="w-12 h-12 text-gold-400 mx-auto mb-6 animate-float" />
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-silver-100 mb-4">
              Ready to Start Your <span className="text-shimmer">Collection</span>?
            </h2>
            <p className="text-silver-400 max-w-xl mx-auto mb-8">
              Join thousands of passionate collectors discovering extraordinary relics every day.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="xl" asChild>
                <Link href="/signup">Create Free Account</Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link href="/marketplace">Browse Marketplace</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
