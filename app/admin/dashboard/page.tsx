import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Users, Package, ShoppingBag, DollarSign, Store, TrendingUp,
  AlertCircle, Shield, ChevronRight, Settings, FileText,
  Activity, Tag, Image as ImageIcon, BarChart2, TicketIcon
} from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { formatCurrency, formatRelativeTime, getStatusColor, cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Admin Dashboard' }

async function getAdminData() {
  const supabase = await createSupabaseServerClient()

  const [
    { count: totalUsers },
    { count: totalSellers },
    { count: totalProducts },
    { count: pendingProducts },
    { count: pendingSellers },
    { count: totalOrders },
    { data: recentOrders },
    { data: recentUsers },
    { data: recentLogs },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('sellers').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('sellers').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase
      .from('orders')
      .select('*, profile:profiles(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('activity_logs')
      .select('*, profile:profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  // Revenue
  const { data: orderTotals } = await supabase.from('orders').select('total').neq('status', 'cancelled')
  const totalRevenue = (orderTotals ?? []).reduce((s: number, o: { total: number }) => s + o.total, 0)

  return {
    totalUsers: totalUsers ?? 0,
    totalSellers: totalSellers ?? 0,
    totalProducts: totalProducts ?? 0,
    pendingProducts: pendingProducts ?? 0,
    pendingSellers: pendingSellers ?? 0,
    totalOrders: totalOrders ?? 0,
    totalRevenue,
    recentOrders: recentOrders ?? [],
    recentUsers: recentUsers ?? [],
    recentLogs: recentLogs ?? [],
  }
}

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const data = await getAdminData()

  const stats = [
    { label: 'Total Revenue', value: formatCurrency(data.totalRevenue), icon: DollarSign, color: 'text-gold-400', change: '+12%' },
    { label: 'Total Users', value: data.totalUsers.toLocaleString(), icon: Users, color: 'text-blue-400', change: '+8%' },
    { label: 'Active Products', value: data.totalProducts.toLocaleString(), icon: Package, color: 'text-green-400', change: '+15%' },
    { label: 'Total Orders', value: data.totalOrders.toLocaleString(), icon: ShoppingBag, color: 'text-purple-400', change: '+6%' },
    { label: 'Active Sellers', value: data.totalSellers.toLocaleString(), icon: Store, color: 'text-orange-400', change: '+3%' },
    { label: 'Pending Review', value: data.pendingProducts + data.pendingSellers, icon: AlertCircle, color: 'text-red-400', change: '' },
  ]

  const adminNav = [
    { label: 'Manage Users', href: '/admin/users', icon: Users, desc: 'View and manage all accounts' },
    { label: 'Manage Sellers', href: '/admin/sellers', icon: Store, desc: 'Approve/reject seller apps' },
    { label: 'Manage Products', href: '/admin/products', icon: Package, desc: 'Review product listings' },
    { label: 'Manage Orders', href: '/admin/orders', icon: ShoppingBag, desc: 'Track all platform orders' },
    { label: 'Categories', href: '/admin/categories', icon: Tag, desc: 'Manage product categories' },
    { label: 'Banners', href: '/admin/banners', icon: ImageIcon, desc: 'Homepage banner management' },
    { label: 'Support Tickets', href: '/admin/support', icon: TicketIcon, desc: 'Handle user support' },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart2, desc: 'Platform-wide reporting' },
    { label: 'Activity Logs', href: '/admin/logs', icon: Activity, desc: 'Admin action history' },
    { label: 'Settings', href: '/admin/settings', icon: Settings, desc: 'Platform configuration' },
  ]

  return (
    <div className="min-h-screen bg-luxury py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gold-400/15 border border-gold-400/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-gold-400" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-silver-100">Admin Control Panel</h1>
            <p className="text-silver-500 text-sm">Rare Relic Finds — Platform Management</p>
          </div>
        </div>

        {/* Alerts */}
        {(data.pendingProducts > 0 || data.pendingSellers > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {data.pendingProducts > 0 && (
              <Link href="/admin/products?status=pending" className="flex items-center gap-3 p-4 rounded-xl bg-yellow-400/5 border border-yellow-400/20 hover:border-yellow-400/40 transition-all group">
                <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-yellow-300">{data.pendingProducts} products pending approval</p>
                  <p className="text-xs text-yellow-400/60">Click to review</p>
                </div>
                <ChevronRight className="w-4 h-4 text-yellow-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            )}
            {data.pendingSellers > 0 && (
              <Link href="/admin/sellers?status=pending" className="flex items-center gap-3 p-4 rounded-xl bg-orange-400/5 border border-orange-400/20 hover:border-orange-400/40 transition-all group">
                <Store className="w-5 h-5 text-orange-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-orange-300">{data.pendingSellers} seller applications pending</p>
                  <p className="text-xs text-orange-400/60">Click to review</p>
                </div>
                <ChevronRight className="w-4 h-4 text-orange-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, color, change }) => (
            <div key={label} className="glass rounded-2xl p-4 border border-white/6">
              <Icon className={cn('w-5 h-5 mb-2', color)} />
              <div className="text-xl font-bold text-silver-100 font-display">{value}</div>
              <div className="text-xs text-silver-500 mt-0.5">{label}</div>
              {change && <div className="text-xs text-green-400 mt-1">{change} this month</div>}
            </div>
          ))}
        </div>

        {/* Admin Navigation Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {adminNav.map(({ label, href, icon: Icon, desc }) => (
            <Link key={href} href={href} className="glass rounded-xl p-4 border border-white/6 hover:border-gold-400/25 hover-lift transition-all group">
              <Icon className="w-6 h-6 text-gold-400/70 group-hover:text-gold-400 transition-colors mb-2" />
              <p className="text-sm font-semibold text-silver-200 group-hover:text-silver-100 transition-colors">{label}</p>
              <p className="text-xs text-silver-600 mt-0.5">{desc}</p>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Orders */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-silver-100">Recent Orders</h2>
              <Link href="/admin/orders" className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1">
                View All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {data.recentOrders.map((order: { id: string; status: string; total: number; created_at: string; profile?: { full_name: string; email: string } }) => (
                <div key={order.id} className="glass rounded-xl p-3 border border-white/6 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-silver-400">#{order.id.slice(0, 8).toUpperCase()}</span>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full', getStatusColor(order.status))}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-silver-500 truncate mt-0.5">{order.profile?.full_name ?? order.profile?.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-gold-400 font-bold text-sm">{formatCurrency(order.total)}</p>
                    <p className="text-xs text-silver-600">{formatRelativeTime(order.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Logs */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-silver-100">Activity Log</h2>
              <Link href="/admin/logs" className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1">
                View All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {data.recentLogs.length > 0 ? (
              <div className="space-y-2">
                {data.recentLogs.map((log: { id: string; action: string; created_at: string; profile?: { full_name: string } }) => (
                  <div key={log.id} className="glass rounded-xl p-3 border border-white/5 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gold-400/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Activity className="w-3 h-3 text-gold-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-silver-300 truncate">{log.action}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-silver-600">{log.profile?.full_name ?? 'System'}</span>
                        <span className="text-xs text-silver-700">{formatRelativeTime(log.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 glass rounded-2xl">
                <Activity className="w-8 h-8 text-silver-600 mx-auto mb-2" />
                <p className="text-silver-500 text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
