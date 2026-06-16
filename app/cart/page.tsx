'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight, Package } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import type { CartItem } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseBrowserClient()

  const fetchCart = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('cart_items')
      .select('*, product:products(*, seller:sellers(store_name), category:categories(name))')
      .eq('user_id', user.id)
    setItems((data as CartItem[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    let mounted = true
    const loadCart = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        if (mounted) setLoading(false)
        return
      }
      const { data } = await supabase
        .from('cart_items')
        .select('*, product:products(*, seller:sellers(store_name), category:categories(name))')
        .eq('user_id', user.id)
      if (mounted) {
        setItems((data as CartItem[]) ?? [])
        setLoading(false)
      }
    }
    loadCart()
    return () => { mounted = false }
  }, [supabase])

  const updateQty = async (id: string, qty: number) => {
    if (qty < 1) return removeItem(id)
    await supabase.from('cart_items').update({ quantity: qty }).eq('id', id)
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity: qty } : i))
  }

  const removeItem = async (id: string) => {
    await supabase.from('cart_items').delete().eq('id', id)
    setItems((prev) => prev.filter((i) => i.id !== id))
    toast.success('Item removed from cart.')
  }

  const subtotal = items.reduce((sum, i) => sum + (i.product?.price ?? 0) * i.quantity, 0)
  const shipping = subtotal > 200 ? 0 : 15
  const total = subtotal + shipping

  if (loading) return (
    <div className="min-h-screen bg-luxury flex items-center justify-center">
      <div className="text-silver-500 text-sm">Loading your cart...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-luxury py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold text-silver-100 mb-8 flex items-center gap-3">
          <ShoppingCart className="w-7 h-7 text-gold-400" />
          Your Cart
          {items.length > 0 && <span className="text-silver-500 text-lg font-normal">({items.length} items)</span>}
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-24 glass rounded-2xl">
            <Package className="w-16 h-16 text-silver-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-silver-300 mb-2">Your cart is empty</h3>
            <p className="text-silver-500 mb-6">Start discovering rare relics to add to your collection.</p>
            <Button asChild>
              <Link href="/marketplace">Browse the Vault <ArrowRight className="w-4 h-4" /></Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="glass rounded-2xl p-5 border border-white/6 flex gap-4">
                  {/* Image */}
                  <Link href={`/products/${item.product_id}`} className="relative w-24 h-24 rounded-xl overflow-hidden bg-black-800 shrink-0">
                    <Image
                      src={item.product?.images?.[0] ?? '/placeholder-relic.jpg'}
                      alt={item.product?.title ?? ''}
                      fill
                      className="object-cover"
                      sizes="96px"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-relic.jpg' }}
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.product_id}`}>
                      <h3 className="text-sm font-semibold text-silver-100 hover:text-gold-400 transition-colors line-clamp-2">
                        {item.product?.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-silver-500 mt-1">{item.product?.category?.name}</p>
                    <p className="text-xs text-silver-600">by {item.product?.seller?.store_name}</p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-white/10 rounded-lg overflow-hidden">
                        <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-silver-400 hover:text-silver-200 hover:bg-white/5 transition-all">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm text-silver-100">{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-silver-400 hover:text-silver-200 hover:bg-white/5 transition-all">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-gold-400 font-bold">
                          {formatCurrency((item.product?.price ?? 0) * item.quantity)}
                        </p>
                        <p className="text-xs text-silver-600">{formatCurrency(item.product?.price ?? 0)} each</p>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="p-2 text-silver-600 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="glass rounded-2xl p-6 border border-white/8 sticky top-24">
                <h2 className="font-display text-lg font-bold text-silver-100 mb-5">Order Summary</h2>
                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-silver-400">Subtotal</span>
                    <span className="text-silver-200">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-silver-400">Shipping</span>
                    <span className={shipping === 0 ? 'text-green-400' : 'text-silver-200'}>
                      {shipping === 0 ? 'FREE' : formatCurrency(shipping)}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-silver-600">Free shipping on orders over $200</p>
                  )}
                  <div className="divider-gold" />
                  <div className="flex justify-between">
                    <span className="font-semibold text-silver-200">Total</span>
                    <span className="font-bold text-xl text-gold-400">{formatCurrency(total)}</span>
                  </div>
                </div>
                <Button size="lg" className="w-full" asChild>
                  <Link href="/checkout">
                    Proceed to Checkout <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                  <Link href="/marketplace">Continue Shopping</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
