import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Product, Category } from '@/lib/types'
import ProductCard from '@/components/cards/ProductCard'
import { Package, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.from('categories').select('name, description').eq('slug', slug).single()
  if (!data) return { title: 'Category Not Found' }
  return { title: data.name, description: data.description ?? `Browse ${data.name} collectibles` }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: category } = await supabase.from('categories').select('*').eq('slug', slug).single()
  if (!category) notFound()

  const { data: products } = await supabase
    .from('products')
    .select('*, seller:sellers(store_name, verified), category:categories(name, slug)')
    .eq('category_id', category.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(24)

  const items = (products as Product[]) ?? []

  return (
    <div className="min-h-screen bg-luxury py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-silver-500 mb-8">
          <Link href="/" className="hover:text-silver-300 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/categories" className="hover:text-silver-300 transition-colors">Categories</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-silver-300">{category.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <h1 className="font-display text-4xl font-bold text-silver-100 mb-3">{category.name}</h1>
          {category.description && <p className="text-silver-400 max-w-xl">{category.description}</p>}
          <p className="text-silver-500 text-sm mt-2">{items.length} items available</p>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {items.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="text-center py-24 glass rounded-2xl">
            <Package className="w-14 h-14 text-silver-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-silver-300 mb-2">No items in this category yet</h3>
            <p className="text-silver-500 mb-6">Check back soon — sellers are adding new relics daily.</p>
            <Link href="/marketplace" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-400/20 border border-gold-400/40 text-gold-400 text-sm font-medium hover:bg-gold-400/30 transition-all">
              Browse All Relics
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
