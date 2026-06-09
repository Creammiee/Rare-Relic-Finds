import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Product, Seller } from '@/lib/types'
import ProductCard from '@/components/cards/ProductCard'
import { Shield, Star, Package, ChevronRight } from 'lucide-react'
import { getInitials, formatDate } from '@/lib/utils'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.from('sellers').select('store_name, description').eq('id', id).single()
  if (!data) return { title: 'Seller Not Found' }
  return { title: data.store_name, description: data.description ?? `Shop from ${data.store_name}` }
}

export default async function SellerStorefrontPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const { data: seller } = await supabase
    .from('sellers')
    .select('*, profile:profiles(full_name, avatar_url, created_at)')
    .eq('id', id)
    .eq('status', 'approved')
    .single()

  if (!seller) notFound()

  const { data: products } = await supabase
    .from('products')
    .select('*, seller:sellers(store_name, verified), category:categories(name, slug)')
    .eq('seller_id', id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  const items = (products as Product[]) ?? []
  const s = seller as Seller & { profile?: { created_at: string } }

  return (
    <div className="min-h-screen bg-luxury">
      {/* Banner */}
      <div className="relative h-48 bg-gradient-to-r from-black-950 via-black-800 to-black-950 border-b border-white/6">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Seller Info */}
        <div className="relative -mt-12 mb-10">
          <div className="glass rounded-2xl p-6 border border-white/8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold-600 to-gold-400 flex items-center justify-center text-black-950 font-bold text-2xl shrink-0 glow-gold-sm">
              {s.logo_url ? (
                <img src={s.logo_url} alt={s.store_name} className="w-full h-full object-cover rounded-2xl" />
              ) : getInitials(s.store_name)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="font-display text-2xl font-bold text-silver-100">{s.store_name}</h1>
                {s.verified && (
                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-400/10 border border-green-400/30 text-green-400">
                    <Shield className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
              {s.description && <p className="text-silver-400 text-sm mb-3">{s.description}</p>}
              <div className="flex flex-wrap gap-4 text-xs text-silver-500">
                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />{s.rating?.toFixed(1) ?? '—'} rating</span>
                <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5 text-gold-400/60" />{s.total_sales ?? 0} sales</span>
                <span>{items.length} listings</span>
                {s.profile?.created_at && <span>Member since {formatDate(s.profile.created_at)}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Products */}
        <nav className="flex items-center gap-2 text-xs text-silver-500 mb-6">
          <Link href="/" className="hover:text-silver-300 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/sellers" className="hover:text-silver-300 transition-colors">Sellers</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-silver-300">{s.store_name}</span>
        </nav>

        <h2 className="font-display text-2xl font-bold text-silver-100 mb-6">
          Products <span className="text-silver-500 font-normal text-lg">({items.length})</span>
        </h2>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-20">
            {items.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="text-center py-16 glass rounded-2xl mb-20">
            <Package className="w-12 h-12 text-silver-600 mx-auto mb-3" />
            <p className="text-silver-400">This seller hasn&apos;t listed any items yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
