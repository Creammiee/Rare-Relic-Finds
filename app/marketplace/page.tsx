import React, { Suspense } from 'react'
import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Product, Category } from '@/lib/types'
import ProductCard from '@/components/cards/ProductCard'
import MarketplaceFilters from '@/components/marketplace/MarketplaceFilters'
import { SlidersHorizontal, Package } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Marketplace',
  description: 'Browse thousands of authenticated rare collectibles, trading cards, vintage items and more.',
}

interface SearchParams {
  q?: string
  category?: string
  condition?: string
  min_price?: string
  max_price?: string
  rarity?: string
  sort?: string
  featured?: string
  page?: string
  status?: string
}

async function getProducts(params: SearchParams): Promise<{ products: Product[]; total: number }> {
  const supabase = await createSupabaseServerClient()
  const page = parseInt(params.page ?? '1')
  const limit = 24
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('products')
    .select('*, seller:sellers(store_name, verified, id), category:categories(name, slug)', { count: 'exact' })
    .eq('status', 'approved')
    .range(from, to)

  if (params.q) query = query.ilike('title', `%${params.q}%`)
  if (params.category) query = query.eq('category_id', params.category)
  if (params.condition) query = query.eq('condition', params.condition)
  if (params.min_price) query = query.gte('price', parseFloat(params.min_price))
  if (params.max_price) query = query.lte('price', parseFloat(params.max_price))
  if (params.rarity) query = query.gte('rarity_score', parseInt(params.rarity))
  if (params.featured === 'true') query = query.eq('is_featured', true)

  switch (params.sort) {
    case 'price_asc': query = query.order('price', { ascending: true }); break
    case 'price_desc': query = query.order('price', { ascending: false }); break
    case 'rarity': query = query.order('rarity_score', { ascending: false }); break
    case 'newest': query = query.order('created_at', { ascending: false }); break
    case 'trending': query = query.order('view_count', { ascending: false }); break
    default: query = query.order('created_at', { ascending: false })
  }

  const { data, count } = await query
  return { products: (data as Product[]) ?? [], total: count ?? 0 }
}

async function getCategories(): Promise<Category[]> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.from('categories').select('*').is('parent_id', null).order('name')
  return (data as Category[]) ?? []
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const [{ products, total }, categories] = await Promise.all([
    getProducts(params),
    getCategories(),
  ])

  const page = parseInt(params.page ?? '1')
  const totalPages = Math.ceil(total / 24)

  return (
    <div className="min-h-screen bg-luxury">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-silver-100 mb-2">
              {params.q ? `Results for "${params.q}"` : params.featured ? 'Featured Relics' : 'The Vault'}
            </h1>
            <p className="text-silver-500 text-sm">{total.toLocaleString()} items found</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block w-64 shrink-0">
            <Suspense>
              <MarketplaceFilters categories={categories} searchParams={params as Record<string, string | undefined>} />
            </Suspense>
          </aside>

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
                      Math.max(0, page - 3),
                      Math.min(totalPages, page + 2)
                    ).map((p) => (
                      <a
                        key={p}
                        href={`?${new URLSearchParams({ ...params, page: String(p) })}`}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                          p === page
                            ? 'bg-gold-400/20 border border-gold-400/50 text-gold-400'
                            : 'bg-white/5 border border-white/8 text-silver-400 hover:text-silver-200 hover:bg-white/10'
                        }`}
                      >
                        {p}
                      </a>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-24 glass rounded-2xl">
                <Package className="w-16 h-16 text-silver-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-silver-300 mb-2">No relics found</h3>
                <p className="text-silver-500">Try adjusting your filters or search terms.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
