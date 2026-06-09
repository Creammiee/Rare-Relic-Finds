'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Star, ShoppingCart, Shield, Eye } from 'lucide-react'
import type { Product } from '@/lib/types'
import { formatCurrency, getRarityLabel, getRarityColor, getConditionLabel, cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface ProductCardProps {
  product: Product
  onAddToCart?: (productId: string) => void
  onToggleWishlist?: (productId: string) => void
  isWishlisted?: boolean
}

export default function ProductCard({ product, onAddToCart, onToggleWishlist, isWishlisted = false }: ProductCardProps) {
  const [hovered, setHovered] = useState(false)
  const [wishActive, setWishActive] = useState(isWishlisted)
  const rarityLabel = getRarityLabel(product.rarity_score)
  const rarityColor = getRarityColor(product.rarity_score)
  const mainImage = product.images?.[0] ?? '/placeholder-relic.jpg'
  const hoverImage = product.images?.[1] ?? mainImage

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    setWishActive(!wishActive)
    onToggleWishlist?.(product.id)
  }

  const handleCart = (e: React.MouseEvent) => {
    e.preventDefault()
    onAddToCart?.(product.id)
  }

  return (
    <Link href={`/products/${product.id}`} className="block group">
      <div
        className="relative rounded-2xl overflow-hidden bg-card border border-white/6 hover-lift transition-all duration-300"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-black-800">
          <Image
            src={hovered && product.images?.length > 1 ? hoverImage : mainImage}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-relic.jpg' }}
          />

          {/* Overlay on hover */}
          <div className={cn(
            'absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300',
            hovered ? 'opacity-100' : 'opacity-60'
          )} />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.is_featured && (
              <Badge variant="default" className="text-xs">Featured</Badge>
            )}
            {product.authentication_status === 'authenticated' && (
              <div className="flex items-center gap-1 bg-green-500/20 border border-green-500/40 rounded-full px-2 py-0.5 text-xs text-green-400">
                <Shield className="w-3 h-3" />
                Verified
              </div>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className={cn(
              'absolute top-3 right-3 p-2 rounded-full transition-all duration-200',
              wishActive
                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                : 'bg-black/40 text-white/60 hover:text-red-400 hover:bg-red-500/20 border border-white/10'
            )}
          >
            <Heart className={cn('w-4 h-4', wishActive && 'fill-current')} />
          </button>

          {/* Rarity Score */}
          <div className="absolute bottom-3 left-3">
            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full border', rarityColor, 
              product.rarity_score >= 9 ? 'rarity-ultra' :
              product.rarity_score >= 7 ? 'rarity-very' :
              product.rarity_score >= 5 ? 'rarity-rare' :
              product.rarity_score >= 3 ? 'rarity-uncommon' : 'rarity-common'
            )}>
              {rarityLabel}
            </span>
          </div>

          {/* Quick Actions on hover */}
          {hovered && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 animate-fade-in-up">
              <button
                onClick={handleCart}
                className="p-2 rounded-full bg-gold-400 text-black-950 hover:bg-gold-300 transition-all shadow-lg"
                title="Add to Cart"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category + Views */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-silver-600 uppercase tracking-wider">
              {product.category?.name ?? 'Collectible'}
            </span>
            <div className="flex items-center gap-1 text-xs text-silver-600">
              <Eye className="w-3 h-3" />
              {product.view_count ?? 0}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-silver-100 mb-1 line-clamp-2 group-hover:text-gold-400 transition-colors">
            {product.title}
          </h3>

          {/* Condition + Rating */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-silver-500">
              {getConditionLabel(product.condition)}
            </span>
            {product.avg_rating !== undefined && product.avg_rating > 0 && (
              <div className="flex items-center gap-1 text-xs text-yellow-400">
                <Star className="w-3 h-3 fill-current" />
                {product.avg_rating.toFixed(1)}
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-gold-400 font-bold text-lg font-display">
                {formatCurrency(product.price)}
              </p>
              {product.original_price && product.original_price > product.price && (
                <p className="text-silver-600 text-xs line-through">
                  {formatCurrency(product.original_price)}
                </p>
              )}
            </div>
            {product.stock <= 3 && product.stock > 0 && (
              <span className="text-xs text-orange-400 font-medium">
                {product.stock} left!
              </span>
            )}
            {product.stock === 0 && (
              <span className="text-xs text-red-400 font-medium">Sold Out</span>
            )}
          </div>

          {/* Seller */}
          {product.seller && (
            <div className="mt-3 pt-3 border-t border-white/6 text-xs text-silver-600">
              by <span className="text-silver-400">{product.seller.store_name}</span>
              {product.seller.verified && <Shield className="inline w-3 h-3 text-gold-400 ml-1" />}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
