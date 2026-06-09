import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Seller } from '@/lib/types'
import { Shield, Star, Package, Store } from 'lucide-react'
import { getInitials } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Sellers',
  description: 'Discover verified sellers on Rare Relic Finds — trusted collectors and dealers of rare items.',
}

export default async function SellersPage() {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('sellers')
    .select('*, profile:profiles(full_name, avatar_url)')
    .eq('status', 'approved')
    .order('rating', { ascending: false })

  const sellers = (data as Seller[]) ?? []

  return (
    <div className="min-h-screen bg-luxury py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold text-silver-100 mb-4">
            Verified <span className="text-shimmer">Sellers</span>
          </h1>
          <p className="text-silver-400 max-w-xl mx-auto">
            Browse our directory of trusted, verified sellers — each vetted and approved by our expert team.
          </p>
        </div>

        {sellers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {sellers.map((seller) => (
              <Link key={seller.id} href={`/sellers/${seller.id}`} className="group">
                <div className="glass rounded-2xl p-6 border border-white/6 hover-lift hover:border-gold-400/20 transition-all duration-300 text-center">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-600 to-gold-400 flex items-center justify-center text-black-950 font-bold text-xl mx-auto mb-4 group-hover:glow-gold-sm transition-all">
                    {seller.logo_url ? (
                      <img src={seller.logo_url} alt={seller.store_name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      getInitials(seller.store_name)
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <h3 className="text-sm font-bold text-silver-100 group-hover:text-gold-400 transition-colors">
                      {seller.store_name}
                    </h3>
                    {seller.verified && <Shield className="w-3.5 h-3.5 text-gold-400 shrink-0" />}
                  </div>

                  {seller.description && (
                    <p className="text-xs text-silver-500 mb-4 line-clamp-2">{seller.description}</p>
                  )}

                  <div className="flex items-center justify-center gap-4 text-xs text-silver-500">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      {seller.rating?.toFixed(1) ?? '—'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3 text-gold-400/60" />
                      {seller.total_sales ?? 0} sales
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 glass rounded-2xl">
            <Store className="w-14 h-14 text-silver-600 mx-auto mb-4" />
            <p className="text-silver-400">No sellers yet. Be the first to sell on Rare Relic Finds.</p>
            <Link href="/seller/apply" className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-gold-400/20 border border-gold-400/40 text-gold-400 text-sm font-medium hover:bg-gold-400/30 transition-all">
              Become a Seller
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
