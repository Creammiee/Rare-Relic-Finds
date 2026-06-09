import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Package, ChevronRight, MapPin, Clock } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Order } from '@/lib/types'
import { formatCurrency, formatDate, getStatusColor, cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'My Orders' }

export default async function OrdersPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('orders')
    .select('*, items:order_items(*, product:products(title, images, price))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const orders = (data as Order[]) ?? []

  const statusSteps: Record<string, number> = {
    pending: 0, confirmed: 1, shipped: 2, delivered: 3,
  }

  return (
    <div className="min-h-screen bg-luxury py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold text-silver-100 mb-8 flex items-center gap-3">
          <Package className="w-7 h-7 text-gold-400" />
          My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="text-center py-24 glass rounded-2xl">
            <Package className="w-16 h-16 text-silver-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-silver-300 mb-2">No orders yet</h3>
            <p className="text-silver-500 mb-6">Your order history will appear here.</p>
            <Link href="/marketplace" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-400/20 border border-gold-400/40 text-gold-400 text-sm font-medium hover:bg-gold-400/30 transition-all">
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const step = statusSteps[order.status] ?? 0
              const isActive = !['cancelled', 'refunded'].includes(order.status)

              return (
                <div key={order.id} className="glass rounded-2xl border border-white/6 overflow-hidden">
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-white/6">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono text-sm font-bold text-silver-200">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className={cn('text-xs px-2.5 py-0.5 rounded-full font-semibold', getStatusColor(order.status))}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-silver-500">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(order.created_at)}</span>
                        <span>{order.items?.length ?? 0} items</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gold-400 font-bold text-lg">{formatCurrency(order.total)}</p>
                      <Link href={`/orders/${order.id}`} className="text-xs text-silver-500 hover:text-gold-400 transition-colors flex items-center gap-1 justify-end mt-1">
                        View Details <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  {/* Progress Tracker */}
                  {isActive && (
                    <div className="px-5 py-4 border-b border-white/5">
                      <div className="flex items-center gap-0">
                        {['Confirmed', 'Shipped', 'Delivered'].map((label, i) => (
                          <React.Fragment key={label}>
                            <div className="flex flex-col items-center gap-1 flex-1">
                              <div className={cn(
                                'w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all',
                                step > i
                                  ? 'border-gold-400 bg-gold-400 text-black-950'
                                  : step === i
                                  ? 'border-gold-400 bg-gold-400/20 text-gold-400 animate-pulse-glow'
                                  : 'border-white/15 text-silver-600'
                              )}>
                                {step > i ? '✓' : i + 1}
                              </div>
                              <span className={cn('text-xs', step >= i ? 'text-silver-300' : 'text-silver-600')}>{label}</span>
                            </div>
                            {i < 2 && (
                              <div className={cn('flex-1 h-0.5 mb-5 transition-all', step > i ? 'bg-gold-400' : 'bg-white/10')} />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Items Preview */}
                  <div className="p-5">
                    <div className="flex flex-wrap gap-2">
                      {order.items?.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center gap-2 bg-white/4 rounded-lg px-3 py-2 text-xs text-silver-300">
                          <Package className="w-3 h-3 text-gold-400/60" />
                          <span className="max-w-[140px] truncate">{item.product?.title}</span>
                          <span className="text-silver-500 font-medium">×{item.quantity}</span>
                        </div>
                      ))}
                      {(order.items?.length ?? 0) > 3 && (
                        <div className="flex items-center px-3 py-2 text-xs text-silver-500">
                          +{(order.items?.length ?? 0) - 3} more
                        </div>
                      )}
                    </div>

                    {order.shipping_address && (
                      <div className="flex items-center gap-1.5 mt-3 text-xs text-silver-500">
                        <MapPin className="w-3 h-3" />
                        {order.shipping_address.city}, {order.shipping_address.country}
                      </div>
                    )}
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
