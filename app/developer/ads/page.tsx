import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Megaphone, Plus, Eye, MousePointer, BarChart3, Pause, Play, Trash2, Edit } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { hasRole } from '@/lib/rbac'
import { formatRelativeTime, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Dev Console — Ads' }

const typeLabels: Record<string, string> = {
  banner: 'Banner',
  sidebar: 'Sidebar',
  feed: 'In-Feed',
  popup: 'Popup',
  sponsored: 'Sponsored',
}

const statusStyles: Record<string, string> = {
  active: 'text-emerald-400',
  paused: 'text-orange-400',
  draft: 'text-silver-500',
  expired: 'text-cyan-500',
  archived: 'text-silver-600',
}

export default async function DevAdsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Auth handled by middleware

  const { data: ads, error } = await supabase
    .from('ads')
    .select('*')
    .order('created_at', { ascending: false })

  const adsList = ads ?? []

  // Stats
  const totalImpressions = adsList.reduce((s, a: Record<string, unknown>) => s + ((a.impressions as number) ?? 0), 0)
  const totalClicks = adsList.reduce((s, a: Record<string, unknown>) => s + ((a.clicks as number) ?? 0), 0)
  const activeAds = adsList.filter((a: Record<string, unknown>) => a.status === 'active').length
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00'

  return (
    <div className="p-6 space-y-6 font-mono">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-cyan-500 tracking-tight">ADS_ENGINE</h1>
          <p className="text-xs text-cyan-500/50 mt-1">Create and manage platform advertisements</p>
        </div>
        <Link href="/developer/ads/create">
          <Button size="sm" className="bg-cyan-500 hover:bg-red-600 text-white border-none text-xs gap-1.5">
            <Plus className="w-3.5 h-3.5" /> New Ad
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Active Ads', value: activeAds, icon: Play },
          { label: 'Impressions', value: totalImpressions.toLocaleString(), icon: Eye },
          { label: 'Clicks', value: totalClicks.toLocaleString(), icon: MousePointer },
          { label: 'CTR', value: `${ctr}%`, icon: BarChart3 },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-lg border border-cyan-500/10 bg-black-900/50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-3.5 h-3.5 text-cyan-500/60" />
              <span className="text-[10px] text-silver-500 uppercase tracking-wider font-bold">{label}</span>
            </div>
            <p className="text-lg font-bold text-silver-100">{value}</p>
          </div>
        ))}
      </div>

      {/* Ads Table */}
      {error ? (
        <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-6 text-center">
          <p className="text-xs text-orange-400 font-bold mb-2">ADS TABLE NOT FOUND</p>
          <p className="text-[10px] text-orange-400/70">Run the <code className="bg-black-900 px-1.5 py-0.5 rounded">developer_migration.sql</code> script in Supabase to create the ads table.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-cyan-500/10 bg-black-900/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cyan-500/5 text-cyan-500/60 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 font-normal">Ad</th>
                  <th className="px-4 py-3 font-normal">Type</th>
                  <th className="px-4 py-3 font-normal">Status</th>
                  <th className="px-4 py-3 font-normal">Impressions</th>
                  <th className="px-4 py-3 font-normal">Clicks</th>
                  <th className="px-4 py-3 font-normal">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/5">
                {adsList.length > 0 ? adsList.map((ad: Record<string, unknown>) => (
                  <tr key={ad.id as string} className="hover:bg-cyan-500/5 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-silver-200 font-medium">{ad.title as string}</p>
                      <p className="text-[10px] text-silver-600 truncate max-w-[180px]">{ad.description as string ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold uppercase">
                        {typeLabels[(ad.ad_type as string)] ?? ad.ad_type as string}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-[10px] font-bold uppercase', statusStyles[(ad.status as string)] ?? 'text-silver-500')}>
                        {ad.status as string}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-silver-400">{((ad.impressions as number) ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-silver-400">{((ad.clicks as number) ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-[10px] text-silver-500">{formatRelativeTime(ad.created_at as string)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-silver-600 text-xs">
                      No ads created yet. Click &quot;New Ad&quot; to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
