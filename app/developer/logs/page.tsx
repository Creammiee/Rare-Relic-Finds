import React from 'react'
import type { Metadata } from 'next'
import { Activity, Search, Filter } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { formatRelativeTime } from '@/lib/utils'

export const metadata: Metadata = { title: 'Dev Console — Audit Logs' }

export default async function DevLogsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams
  const supabase = await createSupabaseServerClient()

  let query = supabase
    .from('activity_logs')
    .select('*, profile:profiles(full_name, email, role)')
    .order('created_at', { ascending: false })
    .limit(50)

  if (params.q) {
    query = query.or(`action.ilike.%${params.q}%,details.ilike.%${params.q}%`)
  }

  const { data: logs } = await query

  return (
    <div className="p-6 space-y-6 font-mono">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-cyan-500 tracking-tight">SYSTEM_AUDIT_LOGS</h1>
          <p className="text-xs text-cyan-500/50 mt-1">Immutable record of all system events</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <form className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-600" />
          <input
            type="text"
            name="q"
            defaultValue={params.q}
            placeholder="Search action or details..."
            className="w-full h-9 pl-10 pr-4 rounded-lg bg-black-900 border border-cyan-500/10 text-xs text-silver-200 placeholder:text-silver-600 focus:outline-none focus:border-cyan-500/30 transition-all"
          />
        </form>
        <button className="flex items-center gap-2 px-3 h-9 rounded-lg border border-cyan-500/10 text-xs font-medium text-silver-500 hover:text-silver-300 transition-all">
          <Filter className="w-3.5 h-3.5" /> Filter
        </button>
      </div>

      {/* Logs Table */}
      <div className="rounded-xl border border-cyan-500/10 bg-black-900/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cyan-500/5 text-cyan-500/60 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 font-normal w-32">Time</th>
                <th className="px-4 py-3 font-normal w-48">Actor</th>
                <th className="px-4 py-3 font-normal w-32">Action</th>
                <th className="px-4 py-3 font-normal">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-500/5">
              {(logs || []).map((log: any) => (
                <tr key={log.id} className="hover:bg-cyan-500/5 transition-colors group">
                  <td className="px-4 py-3 text-silver-500 whitespace-nowrap">
                    {formatRelativeTime(log.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-silver-200 font-medium truncate">
                        {log.profile?.full_name || 'System Auto'}
                      </p>
                      <p className="text-silver-600 text-[10px] truncate">
                        {log.profile?.role ? `[${log.profile.role.toUpperCase()}]` : ''} {log.profile?.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-0.5 rounded border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 font-bold text-[10px] uppercase tracking-wider">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-silver-400 font-mono text-[10px] break-all">
                    {JSON.stringify(log.details)}
                  </td>
                </tr>
              ))}
              {(logs || []).length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-silver-600">No logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
