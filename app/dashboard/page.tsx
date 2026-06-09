import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Package, Heart, ShoppingBag, User, Bell, Star,
  TrendingUp, Clock, ChevronRight, Gem
} from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Order, WishlistItem } from '@/lib/types'
import { formatCurrency, formatRelativeTime, getStatusColor, cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'My Dashboard' }

async function getDashboardData(userId: string) {
  const supabase = await createSupabaseServerClient()
  const [
    { data: orders, count: orderCount },
    { data: wishItems, count: wishCount },
    { count: cartCount },
    { data: notifications },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('*, items:order_items(*, product:products(title, images))', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('wishlists')
      .select('*, product:products(id, title, price, images, rarity_score)', { count: 'exact' })
      .eq('user_id', userId)
      .limit(4),
    supabase.from('cart_items').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('profiles').select('*').eq('id', userId).single(),
  ])

  const totalSpent = (orders ?? []).reduce((s: number, o: Order) => s + o.total, 0)

  return {
    orders: (orders as Order[]) ?? [],
    orderCount: orderCount ?? 0,
    wishItems: (wishItems as WishlistItem[]) ?? [],
    wishCount: wishCount ?? 0,
    cartCount: cartCount ?? 0,
    notifications: notifications ?? [],
    profile,
    totalSpent,
  }
}

export default async function UserDashboardPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const data = await getDashboardData(user.id)

  const stats = [
    { label: 'Total Orders', value: data.orderCount, icon: ShoppingBag, color: 'text-blue-400' },
    { label: 'Total Spent', value: formatCurrency(data.totalSpent), icon: TrendingUp, color: 'text-gold-400' },
    { label: 'Wishlist Items', value: data.wishCount, icon: Heart, color: 'text-red-400' },
    { label: 'Cart Items', value: data.cartCount, icon: Package, color: 'text-green-400' },
  ]

  return (
    <div className="min-h-screen bg-luxury py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-silver-100 mb-1">
              Welcome back, {data.profile?.full_name?.split(' ')[0] ?? 'Collector'} 👋
            </h1>
            <p className="text-silver-500 text-sm">Your collector dashboard</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/marketplace"><Gem className="w-4 h-4" /> Browse Vault</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="glass rounded-2xl p-5 border border-white/6">
              <Icon className={cn('w-6 h-6 mb-3', color)} />
              <div className="text-2xl font-bold text-silver-100 font-display">{value}</div>
              <div className="text-xs text-silver-500 mt-1">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-silver-100">Recent Orders</h2>
              <Link href="/orders" className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1 transition-colors">
                View All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {data.orders.length > 0 ? (
              <div className="space-y-3">
                {data.orders.map((order) => (
                  <div key={order.id} className="glass rounded-xl p-4 border border-white/6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-5 h-5 text-gold-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-silver-200 font-mono">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className={cn('text-xs px-2 py-0.5 rounded-full', getStatusColor(order.status))}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-silver-500">{formatRelativeTime(order.created_at)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-gold-400 font-bold">{formatCurrency(order.total)}</p>
                      <Link href={`/orders/${order.id}`} className="text-xs text-silver-500 hover:text-gold-400 transition-colors">
                        Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 glass rounded-2xl">
                <Package className="w-10 h-10 text-silver-600 mx-auto mb-3" />
                <p className="text-silver-400 text-sm">No orders yet. Start collecting!</p>
                <Button size="sm" className="mt-4" asChild>
                  <Link href="/marketplace">Shop Now</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Notifications + Quick Links */}
          <div className="space-y-4">
            {/* Notifications */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-bold text-silver-100">Notifications</h2>
                <Bell className="w-4 h-4 text-gold-400" />
              </div>
              <div className="space-y-2">
                {data.notifications.length > 0 ? data.notifications.map((n: { id: string; title: string; message: string; read: boolean; created_at: string }) => (
                  <div key={n.id} className={cn('glass rounded-xl p-3 border transition-all', n.read ? 'border-white/5' : 'border-gold-400/20')}>
                    {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-gold-400 mb-1" />}
                    <p className="text-xs font-semibold text-silver-200">{n.title}</p>
                    <p className="text-xs text-silver-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-xs text-silver-600 mt-1">{formatRelativeTime(n.created_at)}</p>
                  </div>
                )) : (
                  <p className="text-xs text-silver-600 text-center py-4">No new notifications</p>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="glass rounded-2xl p-5 border border-white/6">
              <h3 className="text-sm font-semibold text-silver-300 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { label: 'My Wishlist', href: '/wishlist', icon: Heart },
                  { label: 'My Orders', href: '/orders', icon: Package },
                  { label: 'Edit Profile', href: '/profile', icon: User },
                  { label: 'My Reviews', href: '/profile/reviews', icon: Star },
                ].map(({ label, href, icon: Icon }) => (
                  <Link key={href} href={href} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-silver-400 hover:text-silver-200 transition-all group">
                    <Icon className="w-4 h-4 text-gold-400/60 group-hover:text-gold-400 transition-colors" />
                    <span className="text-sm">{label}</span>
                    <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Wishlist Preview */}
        {data.wishItems.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-silver-100">Wishlist</h2>
              <Link href="/wishlist" className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1">
                View All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {data.wishItems.map((item) => (
                <Link key={item.id} href={`/products/${item.product_id}`} className="glass rounded-xl p-3 border border-white/6 hover:border-gold-400/20 transition-all group">
                  <div className="text-gold-400 font-bold text-sm group-hover:text-gold-300 transition-colors line-clamp-2 mb-1">
                    {item.product?.title}
                  </div>
                  <div className="text-gold-400/80 font-semibold text-xs">{formatCurrency(item.product?.price ?? 0)}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
