import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Store, Search, Clock, CheckCircle, XCircle, AlertTriangle, Eye, Edit } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { hasRole } from '@/lib/rbac'
import { formatCurrency, formatRelativeTime, cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Dev Console — Marketplace' }

const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
  approved: { color: 'text-emerald-400', icon: CheckCircle },
  pending: { color: 'text-orange-400', icon: Clock },
  rejected: { color: 'text-cyan-500', icon: XCircle },
  draft: { color: 'text-silver-500', icon: Edit },
}

export default async function DevMarketplacePage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const params = await searchParams
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Auth handled by middleware

  let query = supabase
    .from('products')
    .select('*, seller:sellers(store_name)')
    .order('created_at', { ascending: false })
    .limit(50)

  if (params.status) query = query.eq('status', params.status)
  if (params.q) query = query.ilike('title', `%${params.q}%`)

  const { data: products } = await query

  // Status counts
  const [
    { count: allCount },
    { count: pendingCount },
    { count: approvedCount },
    { count: rejectedCount },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
  ])

  const filters = [
    { label: 'All', value: '', count: allCount ?? 0 },
    { label: 'Pending', value: 'pending', count: pendingCount ?? 0 },
    { label: 'Approved', value: 'approved', count: approvedCount ?? 0 },
    { label: 'Rejected', value: 'rejected', count: rejectedCount ?? 0 },
  ]

  return (
    <div className="p-6 space-y-6 font-mono">
      <div>
        <h1 className="text-xl font-bold text-cyan-500 tracking-tight">MARKETPLACE_CONTROL</h1>
        <p className="text-xs text-cyan-500/50 mt-1">Manage all product listings</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {filters.map(f => (
          <Link
            key={f.value}
            href={f.value ? `/developer/marketplace?status=${f.value}` : '/developer/marketplace'}
            className={cn(
              'px-3 py-1.5 rounded-lg border text-xs font-medium transition-all',
              (params.status ?? '') === f.value
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                : 'border-cyan-500/10 text-silver-500 hover:text-silver-300 hover:bg-white/5'
            )}
          >
            {f.label} <span className="ml-1 opacity-60">{f.count}</span>
          </Link>
        ))}

        <form className="ml-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-silver-600" />
          <input
            type="text" name="q" defaultValue={params.q}
            placeholder="Search listings..."
            className="h-8 pl-9 pr-3 rounded-lg bg-black-900 border border-cyan-500/10 text-xs text-silver-200 placeholder:text-silver-600 focus:outline-none focus:border-cyan-500/30 transition-all w-48"
          />
        </form>
      </div>

      {/* Listings Table */}
      <div className="rounded-xl border border-cyan-500/10 bg-black-900/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cyan-500/5 text-cyan-500/60 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 font-normal">Product</th>
                <th className="px-4 py-3 font-normal">Seller</th>
                <th className="px-4 py-3 font-normal">Price</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 font-normal">Listed</th>
                <th className="px-4 py-3 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-500/5">
              {(products ?? []).map((p: Record<string, unknown>) => {
                const config = statusConfig[(p.status as string) ?? 'draft'] ?? statusConfig.draft
                const StatusIcon = config.icon
                return (
                  <tr key={p.id as string} className="hover:bg-cyan-500/5 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-silver-200 font-medium truncate max-w-[200px]">{p.title as string}</p>
                      <p className="text-[10px] text-silver-600 font-mono mt-0.5">#{(p.id as string).slice(0, 8)}</p>
                    </td>
                    <td className="px-4 py-3 text-silver-400">
                      {(p.seller as Record<string, string>)?.store_name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gold-400 font-bold">{formatCurrency(p.price as number ?? 0)}</td>
                    <td className="px-4 py-3">
                      <span className={cn('flex items-center gap-1.5 text-[10px] font-bold uppercase', config.color)}>
                        <StatusIcon className="w-3 h-3" />
                        {p.status as string ?? 'draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[10px] text-silver-500">{formatRelativeTime(p.created_at as string)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/products/${p.id as string}`}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg hover:bg-white/10 text-silver-500 hover:text-cyan-400 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {(products ?? []).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-silver-600 text-xs">No listings found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
