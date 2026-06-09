import React from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Shield, Star, Heart, ShoppingCart, Package, Store, Eye, ChevronRight, Award } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Product, Review } from '@/lib/types'
import {
  formatCurrency, getConditionLabel, getRarityLabel, getRarityColor,
  formatDate, getInitials, cn
} from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import ProductCard from '@/components/cards/ProductCard'
import ProductActions from '@/components/products/ProductActions'
import ProductGallery from '@/components/products/ProductGallery'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.from('products').select('title, description').eq('id', id).single()
  if (!data) return { title: 'Product Not Found' }
  return {
    title: data.title,
    description: data.description?.slice(0, 160),
  }
}

async function getProduct(id: string): Promise<Product | null> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('products')
    .select(`
      *,
      seller:sellers(*, profile:profiles(full_name, avatar_url, email)),
      category:categories(name, slug),
      reviews:reviews(*, profile:profiles(full_name, avatar_url))
    `)
    .eq('id', id)
    .eq('status', 'approved')
    .single()

  if (!data) return null

  // Increment view count
  await supabase.from('products').update({ view_count: (data.view_count ?? 0) + 1 }).eq('id', id)

  const avgRating = data.reviews?.length
    ? data.reviews.reduce((s: number, r: Review) => s + r.rating, 0) / data.reviews.length
    : 0

  return { ...(data as Product), avg_rating: avgRating }
}

async function getRelatedProducts(categoryId: string, productId: string): Promise<Product[]> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('products')
    .select('*, seller:sellers(store_name, verified), category:categories(name, slug)')
    .eq('category_id', categoryId)
    .eq('status', 'approved')
    .neq('id', productId)
    .limit(4)
  return (data as Product[]) ?? []
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) notFound()

  const related = await getRelatedProducts(product.category_id, id)
  const rarityLabel = getRarityLabel(product.rarity_score)
  const rarityColor = getRarityColor(product.rarity_score)

  return (
    <div className="min-h-screen bg-luxury">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-silver-500 mb-8">
          <Link href="/" className="hover:text-silver-300 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/marketplace" className="hover:text-silver-300 transition-colors">Marketplace</Link>
          <ChevronRight className="w-3 h-3" />
          {product.category && (
            <>
              <Link href={`/categories/${product.category.slug}`} className="hover:text-silver-300 transition-colors">
                {product.category.name}
              </Link>
              <ChevronRight className="w-3 h-3" />
            </>
          )}
          <span className="text-silver-400 truncate max-w-xs">{product.title}</span>
        </nav>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Gallery */}
          <ProductGallery images={product.images ?? []} title={product.title} />

          {/* Info */}
          <div className="space-y-6">
            {/* Status badges */}
            <div className="flex flex-wrap gap-2">
              <span className={cn('text-xs font-semibold px-3 py-1 rounded-full border', rarityColor,
                product.rarity_score >= 9 ? 'rarity-ultra' :
                product.rarity_score >= 7 ? 'rarity-very' :
                product.rarity_score >= 5 ? 'rarity-rare' :
                product.rarity_score >= 3 ? 'rarity-uncommon' : 'rarity-common'
              )}>
                ★ {rarityLabel} · Score {product.rarity_score}/10
              </span>
              {product.authentication_status === 'authenticated' && (
                <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 rounded-full px-3 py-1 text-xs text-green-400">
                  <Shield className="w-3 h-3" />
                  Authenticated
                </div>
              )}
              {product.is_featured && (
                <Badge variant="default" className="text-xs">Featured</Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-silver-100 leading-tight">
              {product.title}
            </h1>

            {/* Rating */}
            {product.reviews && product.reviews.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn('w-4 h-4', i < Math.round(product.avg_rating ?? 0) ? 'text-yellow-400 fill-current' : 'text-silver-600')} />
                  ))}
                </div>
                <span className="text-sm text-silver-400">
                  {product.avg_rating?.toFixed(1)} ({product.reviews.length} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-end gap-4">
              <div className="text-4xl font-display font-bold text-gold-400">
                {formatCurrency(product.price)}
              </div>
              {product.original_price && product.original_price > product.price && (
                <div>
                  <span className="text-silver-500 line-through text-lg">{formatCurrency(product.original_price)}</span>
                  <span className="ml-2 text-green-400 text-sm font-semibold">
                    {Math.round((1 - product.price / product.original_price) * 100)}% off
                  </span>
                </div>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Condition', value: getConditionLabel(product.condition) },
                { label: 'Stock', value: product.stock > 0 ? `${product.stock} available` : 'Sold Out' },
                { label: 'Category', value: product.category?.name ?? '—' },
                {
                  label: 'Market Value',
                  value: product.estimated_market_value ? formatCurrency(product.estimated_market_value) : '—',
                },
                { label: 'Authentication', value: product.authentication_status === 'authenticated' ? 'Verified ✓' : 'Unverified' },
                { label: 'Views', value: product.view_count?.toLocaleString() ?? '0' },
              ].map(({ label, value }) => (
                <div key={label} className="glass rounded-xl p-3">
                  <div className="text-xs text-silver-500 mb-0.5">{label}</div>
                  <div className="text-sm font-semibold text-silver-200">{value}</div>
                </div>
              ))}
            </div>

            {/* Actions (client component) */}
            <ProductActions product={product} />

            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-silver-400 uppercase tracking-wider mb-3">Description</h3>
              <p className="text-silver-400 text-sm leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/marketplace?q=${encodeURIComponent(tag)}`}
                    className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/8 text-silver-400 hover:text-gold-400 hover:border-gold-400/30 transition-all"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Seller Info */}
            {product.seller && (
              <div className="glass rounded-xl p-4 border border-white/8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-600 to-gold-400 flex items-center justify-center text-black-950 font-bold text-sm">
                      {getInitials(product.seller.store_name)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-silver-200">{product.seller.store_name}</span>
                        {product.seller.verified && <Shield className="w-3.5 h-3.5 text-gold-400" />}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-silver-500">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        {product.seller.rating?.toFixed(1) ?? '—'} · {product.seller.review_count ?? 0} reviews
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/sellers/${product.seller.id}`}>Visit Store</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        {product.reviews && product.reviews.length > 0 && (
          <section className="mb-16">
            <h2 className="font-display text-2xl font-bold text-silver-100 mb-6">
              Customer Reviews ({product.reviews.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.reviews.map((review: Review & { profile?: { full_name: string; avatar_url: string } }) => (
                <div key={review.id} className="glass rounded-xl p-5 border border-white/8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-600 to-gold-400 flex items-center justify-center text-black-950 font-bold text-xs">
                      {getInitials(review.profile?.full_name ?? 'U')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-silver-200">{review.profile?.full_name ?? 'Anonymous'}</p>
                      <p className="text-xs text-silver-500">{formatDate(review.created_at)}</p>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={cn('w-3.5 h-3.5', i < review.rating ? 'text-yellow-400 fill-current' : 'text-silver-600')} />
                      ))}
                    </div>
                  </div>
                  {review.comment && <p className="text-sm text-silver-400 leading-relaxed">{review.comment}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related Products */}
        {related.length > 0 && (
          <section>
            <div className="flex items-end justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-silver-100">Related Relics</h2>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/categories/${product.category?.slug}`}>View Category</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
