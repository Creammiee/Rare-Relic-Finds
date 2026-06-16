import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Users, Search, ShieldAlert, Shield, Store, User, Edit, Ban, CheckCircle } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { hasRole, isImmutable } from '@/lib/rbac'
import type { Profile, UserRole, AccountStatus } from '@/lib/types'
import { formatRelativeTime, cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Dev Console — Users' }

const roleColors: Record<UserRole, string> = {
  developer: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  admin: 'bg-gold-400/10 text-gold-400 border-gold-400/20',
  seller: 'bg-green-400/10 text-green-400 border-green-400/20',
  user: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
}

const statusColors: Record<string, string> = {
  active: 'text-emerald-400',
  suspended: 'text-orange-400',
  banned: 'text-cyan-500',
}

export default async function DevUsersPage({ searchParams }: { searchParams: Promise<{ q?: string; role?: string; status?: string }> }) {
  const params = await searchParams
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Auth handled by middleware

  let query = supabase.from('profiles').select('*').neq('role', 'developer').order('created_at', { ascending: false })
  if (params.q) query = query.or(`full_name.ilike.%${params.q}%,email.ilike.%${params.q}%`)
  if (params.role) query = query.eq('role', params.role)
  if (params.status) query = query.eq('status', params.status)

  const { data: users } = await query
  const profiles = (users as Profile[]) ?? []

  // Counts by role
  const roleCounts = {
    admin: profiles.filter(p => p.role === 'admin').length,
    seller: profiles.filter(p => p.role === 'seller').length,
    user: profiles.filter(p => p.role === 'user').length,
  }

  return (
    <div className="p-6 space-y-6 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-cyan-500 tracking-tight">USER_MANAGEMENT</h1>
          <p className="text-xs text-cyan-500/50 mt-1">{profiles.length} total accounts</p>
        </div>
        <Link 
          href="/developer/users/create"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-black-950 font-bold uppercase tracking-wider text-xs hover:bg-cyan-400 transition-colors"
        >
          <User className="w-4 h-4" /> Create User
        </Link>
      </div>

      {/* Role Summary */}
      <div className="grid grid-cols-3 gap-3">
        {(Object.entries(roleCounts) as [UserRole, number][]).map(([role, count]) => (
          <Link
            key={role}
            href={params.role === role ? '/developer/users' : `/developer/users?role=${role}`}
            className={cn(
              'rounded-lg border p-3 text-center transition-all hover:bg-white/5',
              params.role === role ? 'border-cyan-500/30 bg-cyan-500/10' : 'border-cyan-500/10 bg-black-900/50'
            )}
          >
            <p className="text-lg font-bold text-silver-100">{count}</p>
            <p className="text-[10px] uppercase tracking-wider text-silver-500 font-bold">{role}s</p>
          </Link>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3">
        <form className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-600" />
          <input
            type="text"
            name="q"
            defaultValue={params.q}
            placeholder="Search name or email..."
            className="w-full h-9 pl-10 pr-4 rounded-lg bg-black-900 border border-cyan-500/10 text-xs text-silver-200 placeholder:text-silver-600 focus:outline-none focus:border-cyan-500/30 transition-all"
          />
        </form>
        <Link
          href={params.status === 'suspended' ? '/developer/users' : '/developer/users?status=suspended'}
          className={cn(
            'flex items-center gap-2 px-3 h-9 rounded-lg border text-xs font-medium transition-all',
            params.status === 'suspended' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' : 'border-cyan-500/10 text-silver-500 hover:text-silver-300'
          )}
        >
          <Ban className="w-3.5 h-3.5" /> Suspended
        </Link>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-cyan-500/10 bg-black-900/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cyan-500/5 text-cyan-500/60 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 font-normal">User</th>
                <th className="px-4 py-3 font-normal">Role</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 font-normal">Joined</th>
                <th className="px-4 py-3 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-500/5">
              {profiles.map((p) => (
                <tr key={p.id} className="hover:bg-cyan-500/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-500 font-bold text-[10px] shrink-0">
                        {(p.full_name?.[0] ?? p.email?.[0] ?? 'U').toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-silver-200 font-medium truncate">{p.full_name || 'No Name'}</p>
                        <p className="text-silver-600 text-[10px] truncate">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-flex px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider', roleColors[p.role])}>
                      {p.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('flex items-center gap-1.5 text-[10px] font-bold uppercase', statusColors[p.status] ?? statusColors.active)}>
                      {(p.status ?? 'active') === 'active' ? <CheckCircle className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                      {p.status ?? 'active'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-silver-500 text-[10px]">{formatRelativeTime(p.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {p.role === 'user' && (
                        <form action={async () => {
                          'use server'
                          const { createSupabaseServerClient } = await import('@/lib/supabase-server')
                          const supabase = await createSupabaseServerClient()
                          await supabase.from('profiles').update({ role: 'seller' }).eq('id', p.id)
                          await supabase.from('activity_logs').insert({ action: 'approve_seller', details: { target_id: p.id } })
                        }}>
                          <button type="submit" className="inline-flex items-center justify-center h-7 px-2 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 text-[10px] font-bold uppercase transition-colors">
                            Approve Seller
                          </button>
                        </form>
                      )}
                      <Link
                        href={`/admin/users/${p.id}`}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg hover:bg-white/10 text-silver-500 hover:text-cyan-400 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {profiles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-silver-600 text-xs">No users match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
