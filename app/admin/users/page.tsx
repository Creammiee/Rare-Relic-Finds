import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Users, Search, Shield, ShieldAlert, Store, User, MoreVertical, Edit } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { hasRole, isImmutable } from '@/lib/rbac'
import type { Profile, UserRole, AccountStatus } from '@/lib/types'
import { formatRelativeTime, cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Manage Users' }

function RoleBadge({ role }: { role: UserRole }) {
  const badges: Record<UserRole, { color: string; icon: React.ElementType; label: string }> = {
    developer: { color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: ShieldAlert, label: 'Developer' },
    admin: { color: 'bg-gold-400/10 text-gold-400 border-gold-400/20', icon: Shield, label: 'Admin' },
    seller: { color: 'bg-green-400/10 text-green-400 border-green-400/20', icon: Store, label: 'Seller' },
    user: { color: 'bg-blue-400/10 text-blue-400 border-blue-400/20', icon: User, label: 'Buyer' },
  }
  const config = badges[role]
  const Icon = config.icon
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium', config.color)}>
      <Icon className="w-3.5 h-3.5" /> {config.label}
    </span>
  )
}

function StatusBadge({ status }: { status: AccountStatus }) {
  const styles: Record<AccountStatus, string> = {
    active: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    suspended: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
    banned: 'bg-red-500/10 text-red-500 border-red-500/20',
  }
  return (
    <span className={cn('inline-flex px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider', styles[status] || styles.active)}>
      {status || 'active'}
    </span>
  )
}

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams
  const q = params.q || ''
  
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Auth handled by middleware
  
  let query = supabase.from('profiles').select('*').neq('role', 'developer').order('created_at', { ascending: false })
  
  if (q) {
    query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`)
  }

  const { data: users } = await query
  const profiles = (users as Profile[]) ?? []

  const roleCounts = {
    admin: profiles.filter(p => p.role === 'admin').length,
    seller: profiles.filter(p => p.role === 'seller').length,
    user: profiles.filter(p => p.role === 'user').length,
  }

  return (
    <div className="min-h-screen bg-luxury py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link href="/admin/dashboard" className="text-silver-500 hover:text-silver-300">← Back</Link>
              <h1 className="font-display text-3xl font-bold text-silver-100">Manage Users</h1>
            </div>
            <p className="text-silver-500 text-sm">View and manage platform accounts, roles, and access.</p>
          </div>
        </div>

        <div className="glass rounded-2xl border border-white/6 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-white/6 bg-white/2">
            <form className="max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-600" />
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search by name or email..."
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-black-900 border border-white/10 text-sm text-silver-200 placeholder:text-silver-600 focus:outline-none focus:border-gold-400/50 transition-all"
              />
            </form>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-black-900/50 text-silver-500 uppercase tracking-wider text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/6">
                {profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gold-400/10 flex items-center justify-center text-gold-400 font-bold shrink-0">
                          {p.full_name?.[0] ?? p.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-silver-200 font-semibold">{p.full_name || 'No Name Provided'}</p>
                          <p className="text-silver-600 text-xs">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <RoleBadge role={p.role} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={p.status || 'active'} />
                    </td>
                    <td className="px-6 py-4 text-silver-500 text-xs">
                      {formatRelativeTime(p.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isImmutable(p) && currentProfile?.role !== 'developer' ? (
                        <span className="text-xs text-silver-600 flex items-center justify-end gap-1"><ShieldAlert className="w-3.5 h-3.5" /> System Protected</span>
                      ) : (
                        <Link href={`/admin/users/${p.id}`} className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/10 text-silver-500 hover:text-gold-400 transition-colors">
                          <Edit className="w-4 h-4" />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
                {profiles.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-silver-500">
                      No users found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
