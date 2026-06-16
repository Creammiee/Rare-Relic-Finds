import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Users, Store, Package, DollarSign, AlertTriangle,
  TrendingUp, Activity, Clock, ShieldAlert, Eye
} from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { hasRole } from '@/lib/rbac'
import { formatRelativeTime, cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Developer Console' }

export default async function DeveloperOverviewPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Authorization is handled securely by middleware.ts

  // Parallel data fetches
  const [
    { count: totalUsers },
    { count: totalSellers },
    { count: totalProducts },
    { count: totalOrders },
    { count: pendingProducts },
    { count: suspendedUsers },
    { data: recentLogs },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'seller'),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'suspended'),
    supabase.from('activity_logs').select('*, profile:profiles(full_name, role)').order('created_at', { ascending: false }).limit(8),
    supabase.from('profiles').select('id, full_name, role, status, created_at').order('created_at', { ascending: false }).limit(6),
  ])

  const stats = [
    { label: 'Total Users', value: totalUsers ?? 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Sellers', value: totalSellers ?? 0, icon: Store, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Products', value: totalProducts ?? 0, icon: Package, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Orders', value: totalOrders ?? 0, icon: DollarSign, color: 'text-gold-400', bg: 'bg-gold-400/10' },
  ]

  const alerts = [
    ...(pendingProducts && pendingProducts > 0 ? [{ msg: `${pendingProducts} listings pending approval`, type: 'warning' as const }] : []),
    ...(suspendedUsers && suspendedUsers > 0 ? [{ msg: `${suspendedUsers} suspended account(s)`, type: 'danger' as const }] : []),
  ]

  return (
    <div className="p-6 space-y-6 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-cyan-500 tracking-tight">SYSTEM_OVERVIEW</h1>
          <p className="text-xs text-cyan-500/50 mt-1">Real-time platform metrics</p>
        </div>
        <div className="text-right text-[10px] text-cyan-500/40 space-y-0.5">
          <p>STATUS: <span className="text-emerald-400 font-bold">ONLINE</span></p>
          <p>AUTH: <span className="text-cyan-500 font-bold">DEVELOPER</span></p>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <div key={i} className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg border text-xs font-medium',
              a.type === 'danger' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' : 'bg-orange-500/10 border-orange-500/20 text-orange-400'
            )}>
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {a.msg}
            </div>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-xl border border-cyan-500/10 bg-black-900/50 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', bg)}>
                <Icon className={cn('w-4.5 h-4.5', color)} />
              </div>
            </div>
            <p className="text-2xl font-bold text-silver-100">{value}</p>
            <p className="text-[10px] text-silver-500 uppercase tracking-wider mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="rounded-xl border border-cyan-500/10 bg-black-900/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-cyan-500/10 flex items-center justify-between bg-cyan-500/5">
            <h2 className="text-xs font-bold text-cyan-500 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" /> ACTIVITY_LOG
            </h2>
            <Link href="/developer/logs" className="text-[10px] text-cyan-500/50 hover:text-cyan-400 transition-colors">View All →</Link>
          </div>
          <div className="divide-y divide-cyan-500/5">
            {(recentLogs ?? []).length > 0 ? (recentLogs ?? []).map((log: Record<string, unknown>) => (
              <div key={log.id as string} className="px-4 py-3 hover:bg-cyan-500/5 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-cyan-400">{log.action as string}</span>
                  <span className="text-[10px] text-cyan-500/40">{formatRelativeTime(log.created_at as string)}</span>
                </div>
                <p className="text-[10px] text-silver-500 truncate">
                  by {(log.profile as Record<string, string>)?.full_name ?? 'System'} • {JSON.stringify(log.details)}
                </p>
              </div>
            )) : (
              <p className="px-4 py-8 text-center text-xs text-silver-600">No activity logged yet.</p>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="rounded-xl border border-cyan-500/10 bg-black-900/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-cyan-500/10 flex items-center justify-between bg-cyan-500/5">
            <h2 className="text-xs font-bold text-cyan-500 flex items-center gap-2">
              <Users className="w-3.5 h-3.5" /> RECENT_USERS
            </h2>
            <Link href="/developer/users" className="text-[10px] text-cyan-500/50 hover:text-cyan-400 transition-colors">Manage →</Link>
          </div>
          <div className="divide-y divide-cyan-500/5">
            {(recentUsers ?? []).map((u: Record<string, unknown>) => (
              <div key={u.id as string} className="px-4 py-3 flex items-center gap-3 hover:bg-cyan-500/5 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-500 font-bold text-xs shrink-0">
                  {((u.full_name as string)?.[0] ?? 'U').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-silver-200 truncate">{u.full_name as string ?? 'Unnamed'}</p>
                  <p className="text-[10px] text-silver-500">{formatRelativeTime(u.created_at as string)}</p>
                </div>
                <span className={cn('text-[10px] px-2 py-0.5 rounded border font-bold uppercase tracking-wider',
                  u.role === 'developer' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                  u.role === 'admin' ? 'bg-gold-400/10 text-gold-400 border-gold-400/20' :
                  u.role === 'seller' ? 'bg-green-400/10 text-green-400 border-green-400/20' :
                  'bg-blue-400/10 text-blue-400 border-blue-400/20'
                )}>{u.role as string}</span>
                {u.status === 'suspended' && (
                  <ShieldAlert className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Manage Users', href: '/developer/users', icon: Users },
          { label: 'Marketplace', href: '/developer/marketplace', icon: Store },
          { label: 'Ads Engine', href: '/developer/ads', icon: TrendingUp },
          { label: 'Audit Logs', href: '/developer/logs', icon: Eye },
        ].map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href} className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/15 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all text-center group">
            <Icon className="w-5 h-5 text-cyan-500/60 group-hover:text-cyan-500 mx-auto mb-2 transition-colors" />
            <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
