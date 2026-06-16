import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Package, Heart, ShoppingBag,
  TrendingUp, ChevronRight, Gem, Star, User
} from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Order } from '@/lib/types'
import { formatCurrency, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'My Dashboard' }

async function getDashboardData(userId: string) {
  const supabase = await createSupabaseServerClient()
  const [
    { data: orders, count: orderCount },
    { count: wishCount },
    { count: cartCount },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .limit(1),
    supabase.from('wishlists').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('cart_items').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('profiles').select('*').eq('id', userId).single(),
  ])

  const totalSpent = (orders ?? []).reduce((s: number, o: Order) => s + o.total, 0)

  return {
    orderCount: orderCount ?? 0,
    wishCount: wishCount ?? 0,
    cartCount: cartCount ?? 0,
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
    { label: 'Orders', value: data.orderCount, icon: ShoppingBag, color: 'text-blue-400', href: '/orders' },
    { label: 'Spent', value: formatCurrency(data.totalSpent), icon: TrendingUp, color: 'text-gold-400', href: '/orders' },
    { label: 'Wishlist', value: data.wishCount, icon: Heart, color: 'text-red-400', href: '/wishlist' },
    { label: 'Cart', value: data.cartCount, icon: Package, color: 'text-green-400', href: '/cart' },
  ]

  const quickActions = [
    { label: 'Browse Marketplace', href: '/marketplace', icon: Gem },
    { label: 'My Wishlist', href: '/wishlist', icon: Heart },
    { label: 'My Orders', href: '/orders', icon: Package },
    { label: 'My Reviews', href: '/profile/reviews', icon: Star },
    { label: 'Edit Profile', href: '/profile', icon: User },
  ]

  return (
    <div className="min-h-screen bg-luxury py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-silver-100">
            Hi, {data.profile?.full_name?.split(' ')[0] ?? 'Collector'} 👋
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, color, href }) => (
            <Link key={label} href={href} className="glass rounded-xl p-4 flex flex-col items-center justify-center text-center border border-white/6 hover:border-gold-400/20 hover:bg-white/5 transition-all">
              <div className={cn('p-3 rounded-full mb-3 bg-black-900', color)}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-xl font-bold text-silver-100">{value}</div>
              <div className="text-[10px] text-silver-500 mt-1 uppercase tracking-wider font-semibold">{label}</div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="glass rounded-2xl border border-white/6 divide-y divide-white/6">
          {quickActions.map(({ label, href, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-all group">
              <div className="w-9 h-9 rounded-xl bg-gold-400/10 flex items-center justify-center shrink-0">
                <Icon className="w-4.5 h-4.5 text-gold-400" />
              </div>
              <span className="text-sm font-medium text-silver-300 group-hover:text-silver-100 transition-colors">{label}</span>
              <ChevronRight className="w-4 h-4 text-silver-600 ml-auto group-hover:text-gold-400 transition-colors" />
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
