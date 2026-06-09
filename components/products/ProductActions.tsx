'use client'

import React, { useState, useEffect } from 'react'
import { ShoppingCart, Heart, Share2, CheckCircle } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import type { Product } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Props {
  product: Product
}

export default function ProductActions({ product }: Props) {
  const [qty, setQty] = useState(1)
  const [inCart, setInCart] = useState(false)
  const [inWish, setInWish] = useState(false)
  const [loadingCart, setLoadingCart] = useState(false)
  const [loadingWish, setLoadingWish] = useState(false)
  const supabase = createSupabaseBrowserClient()
  const router = useRouter()

  useEffect(() => {
    const checkStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [{ data: cart }, { data: wish }] = await Promise.all([
        supabase.from('cart_items').select('id').eq('user_id', user.id).eq('product_id', product.id).single(),
        supabase.from('wishlists').select('id').eq('user_id', user.id).eq('product_id', product.id).single(),
      ])
      setInCart(!!cart)
      setInWish(!!wish)
    }
    checkStatus()
  }, [product.id])

  const handleAddToCart = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Please sign in to add to cart.'); router.push('/login'); return }
    setLoadingCart(true)

    if (inCart) {
      await supabase.from('cart_items').update({ quantity: qty }).eq('user_id', user.id).eq('product_id', product.id)
    } else {
      await supabase.from('cart_items').insert({ user_id: user.id, product_id: product.id, quantity: qty })
    }

    setInCart(true)
    setLoadingCart(false)
    toast.success('Added to cart!', { description: product.title })
  }

  const handleToggleWishlist = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Please sign in first.'); router.push('/login'); return }
    setLoadingWish(true)

    if (inWish) {
      await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', product.id)
      setInWish(false)
      toast.success('Removed from wishlist.')
    } else {
      await supabase.from('wishlists').insert({ user_id: user.id, product_id: product.id })
      setInWish(true)
      toast.success('Added to wishlist!', { description: product.title })
    }

    setLoadingWish(false)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.title, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  const isSoldOut = product.stock === 0

  return (
    <div className="space-y-4">
      {/* Quantity */}
      {!isSoldOut && (
        <div className="flex items-center gap-4">
          <label className="text-xs font-medium text-silver-400 uppercase tracking-wider">Quantity</label>
          <div className="flex items-center border border-white/10 rounded-xl overflow-hidden">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="w-10 h-10 flex items-center justify-center text-silver-400 hover:text-silver-200 hover:bg-white/5 transition-all"
            >
              −
            </button>
            <span className="w-12 text-center text-sm font-semibold text-silver-100">{qty}</span>
            <button
              onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
              className="w-10 h-10 flex items-center justify-center text-silver-400 hover:text-silver-200 hover:bg-white/5 transition-all"
            >
              +
            </button>
          </div>
          <span className="text-xs text-silver-500">{product.stock} in stock</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          size="lg"
          className="flex-1"
          onClick={handleAddToCart}
          disabled={isSoldOut || loadingCart}
        >
          {inCart ? (
            <><CheckCircle className="w-4 h-4" /> In Cart</>
          ) : isSoldOut ? (
            'Sold Out'
          ) : loadingCart ? (
            'Adding...'
          ) : (
            <><ShoppingCart className="w-4 h-4" /> Add to Cart</>
          )}
        </Button>

        <Button
          size="lg"
          variant={inWish ? 'destructive' : 'outline'}
          onClick={handleToggleWishlist}
          disabled={loadingWish}
          className={inWish ? 'text-red-400 border-red-500/50' : ''}
        >
          <Heart className={`w-5 h-5 ${inWish ? 'fill-current' : ''}`} />
        </Button>

        <Button size="lg" variant="secondary" onClick={handleShare}>
          <Share2 className="w-5 h-5" />
        </Button>
      </div>

      {isSoldOut && (
        <p className="text-sm text-red-400 text-center">This item is currently out of stock.</p>
      )}
    </div>
  )
}
