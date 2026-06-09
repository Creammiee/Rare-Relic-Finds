import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import {
  Heart, Package, ArrowRight, Gem
} from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { WishlistItem } from '@/lib/types'
import { formatCurrency, getRarityLabel, getRarityColor, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'My Wishlist' }

export default async function WishlistPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('wishlists')
    .select('*, product:products(*, seller:sellers(store_name, verified), category:categories(name, slug))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const items = (data as WishlistItem[]) ?? []

  return (
    <div className="min-h-screen bg-luxury py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-silver-100 flex items-center gap-3">
              <Heart className="w-7 h-7 text-red-400" />
              My Wishlist
            </h1>
            <p className="text-silver-500 text-sm mt-1">{items.length} saved relics</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/marketplace"><Gem className="w-4 h-4" /> Discover More</Link>
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24 glass rounded-2xl">
            <Heart className="w-16 h-16 text-silver-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-silver-300 mb-2">Your wishlist is empty</h3>
            <p className="text-silver-500 mb-6">Save relics you love by clicking the heart icon.</p>
            <Button asChild>
              <Link href="/marketplace">Browse the Vault <ArrowRight className="w-4 h-4" /></Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {items.map((item) => {
              const product = item.product
              if (!product) return null
              const rarityLabel = getRarityLabel(product.rarity_score)
              const rarityColor = getRarityColor(product.rarity_score)
              return (
                <div key={item.id} className="glass rounded-2xl overflow-hidden border border-white/6 hover-lift group">
                  <Link href={`/products/${product.id}`}>
                    <div className="relative aspect-square bg-black-800">
                      <Image
                        src={product.images?.[0] ?? '/placeholder-relic.jpg'}
                        alt={product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="300px"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-relic.jpg' }}
                      />
                      <div className="absolute top-3 left-3">
                        <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full border',
                          product.rarity_score >= 9 ? 'rarity-ultra' :
                          product.rarity_score >= 7 ? 'rarity-very' :
                          product.rarity_score >= 5 ? 'rarity-rare' :
                          product.rarity_score >= 3 ? 'rarity-uncommon' : 'rarity-common'
                        )}>
                          {rarityLabel}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-silver-600 mb-1">{product.category?.name}</p>
                      <h3 className="text-sm font-semibold text-silver-100 group-hover:text-gold-400 transition-colors line-clamp-2 mb-2">
                        {product.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-gold-400 font-bold">{formatCurrency(product.price)}</span>
                        {product.stock === 0 && <span className="text-xs text-red-400">Sold Out</span>}
                      </div>
                    </div>
                  </Link>
                  <div className="px-4 pb-4 flex gap-2">
                    <Button size="sm" className="flex-1" asChild disabled={product.stock === 0}>
                      <Link href={`/products/${product.id}`}>
                        <Package className="w-3 h-3" /> View Item
                      </Link>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
