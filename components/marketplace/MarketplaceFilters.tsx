'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Filter, X, ChevronDown } from 'lucide-react'
import type { Category } from '@/lib/types'

interface Props {
  categories: Category[]
  searchParams: Record<string, string | undefined>
}

const conditions = [
  { value: 'mint', label: 'Mint' },
  { value: 'near_mint', label: 'Near Mint' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
]

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rarity', label: 'Rarity Score' },
  { value: 'trending', label: 'Trending' },
]

const rarityOptions = [
  { value: '9', label: 'Ultra Rare (9-10)' },
  { value: '7', label: 'Very Rare (7+)' },
  { value: '5', label: 'Rare (5+)' },
  { value: '3', label: 'Uncommon (3+)' },
  { value: '1', label: 'All Rarities' },
]

export default function MarketplaceFilters({ categories, searchParams }: Props) {
  const router = useRouter()

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams()
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v && k !== key && k !== 'page') params.set(k, v)
    })
    if (value) params.set(key, value)
    router.push(`/marketplace?${params.toString()}`)
  }

  const clearAll = () => router.push('/marketplace')
  const hasFilters = Object.keys(searchParams).some((k) => k !== 'page' && searchParams[k])

  return (
    <div className="space-y-6 sticky top-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-silver-300 font-semibold">
          <Filter className="w-4 h-4 text-gold-400" />
          Filters
        </div>
        {hasFilters && (
          <button onClick={clearAll} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors">
            <X className="w-3 h-3" /> Clear All
          </button>
        )}
      </div>

      {/* Sort */}
      <div>
        <label className="block text-xs font-semibold text-silver-500 uppercase tracking-wider mb-2">Sort By</label>
        <select
          value={searchParams.sort ?? 'newest'}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className="w-full h-9 rounded-lg bg-white/5 border border-white/10 text-sm text-silver-200 px-3 focus:outline-none focus:ring-2 focus:ring-gold-400/50 cursor-pointer"
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value} className="bg-black-800">{o.label}</option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-semibold text-silver-500 uppercase tracking-wider mb-2">Category</label>
        <div className="space-y-1">
          <button
            onClick={() => updateFilter('category', null)}
            className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-all ${
              !searchParams.category ? 'text-gold-400 bg-gold-400/10' : 'text-silver-400 hover:text-silver-200 hover:bg-white/5'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateFilter('category', cat.id)}
              className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-all ${
                searchParams.category === cat.id ? 'text-gold-400 bg-gold-400/10' : 'text-silver-400 hover:text-silver-200 hover:bg-white/5'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-xs font-semibold text-silver-500 uppercase tracking-wider mb-2">Price Range</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            defaultValue={searchParams.min_price}
            onBlur={(e) => updateFilter('min_price', e.target.value || null)}
            className="w-full h-9 rounded-lg bg-white/5 border border-white/10 text-sm text-silver-200 px-3 focus:outline-none focus:ring-2 focus:ring-gold-400/50"
          />
          <span className="text-silver-600">–</span>
          <input
            type="number"
            placeholder="Max"
            defaultValue={searchParams.max_price}
            onBlur={(e) => updateFilter('max_price', e.target.value || null)}
            className="w-full h-9 rounded-lg bg-white/5 border border-white/10 text-sm text-silver-200 px-3 focus:outline-none focus:ring-2 focus:ring-gold-400/50"
          />
        </div>
      </div>

      {/* Condition */}
      <div>
        <label className="block text-xs font-semibold text-silver-500 uppercase tracking-wider mb-2">Condition</label>
        <div className="space-y-1">
          <button
            onClick={() => updateFilter('condition', null)}
            className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-all ${
              !searchParams.condition ? 'text-gold-400 bg-gold-400/10' : 'text-silver-400 hover:text-silver-200 hover:bg-white/5'
            }`}
          >
            Any Condition
          </button>
          {conditions.map((c) => (
            <button
              key={c.value}
              onClick={() => updateFilter('condition', c.value)}
              className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-all ${
                searchParams.condition === c.value ? 'text-gold-400 bg-gold-400/10' : 'text-silver-400 hover:text-silver-200 hover:bg-white/5'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rarity */}
      <div>
        <label className="block text-xs font-semibold text-silver-500 uppercase tracking-wider mb-2">Rarity</label>
        <div className="space-y-1">
          {rarityOptions.map((r) => (
            <button
              key={r.value}
              onClick={() => updateFilter('rarity', r.value === '1' ? null : r.value)}
              className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-all ${
                (r.value === '1' && !searchParams.rarity) || searchParams.rarity === r.value
                  ? 'text-gold-400 bg-gold-400/10'
                  : 'text-silver-400 hover:text-silver-200 hover:bg-white/5'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
