import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Shield, ShieldAlert, User, Clock, AlertTriangle } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { hasRole, canManageUser, isImmutable } from '@/lib/rbac'
import type { Profile } from '@/lib/types'
import { formatRelativeTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'User Details' }

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Auth handled by middleware

  const { data: targetProfile } = await supabase.from('profiles').select('*').eq('id', id).single()
  if (!targetProfile) redirect('/admin/users')

  const target = targetProfile as Profile
  const isSelf = user.id === id
  const canManage = canManageUser(currentProfile as Profile, target.role) && !isSelf
  const isTargetImmutable = isImmutable(target) && currentProfile?.role !== 'developer'

  // Fetch recent orders
  const { data: orders } = await supabase
    .from('orders')
    .select('id, status, total, created_at')
    .eq('user_id', id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-luxury py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/admin/users" className="text-silver-500 hover:text-silver-300 flex items-center gap-2 mb-4 text-sm w-fit">
            ← Back to Users
          </Link>
          <h1 className="font-display text-3xl font-bold text-silver-100 flex items-center gap-3">
            User Details
            {target.status === 'suspended' && <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-500 uppercase">Suspended</span>}
            {target.status === 'banned' && <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-500 uppercase">Banned</span>}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Info & Actions */}
          <div className="md:col-span-1 space-y-6">
            <div className="glass rounded-2xl p-6 border border-white/6 text-center">
              <div className="w-20 h-20 rounded-full bg-gold-400/10 flex items-center justify-center text-gold-400 font-bold text-2xl mx-auto mb-4 border border-gold-400/20 shadow-lg">
                {target.full_name?.[0] ?? target.email[0].toUpperCase()}
              </div>
              <h2 className="text-lg font-bold text-silver-100">{target.full_name || 'No Name'}</h2>
              <p className="text-sm text-silver-500 mb-4">{target.email}</p>
              
              <div className="flex justify-center gap-2 mb-6">
                <span className="text-xs px-2.5 py-1 rounded-md border border-white/10 bg-white/5 text-silver-300 font-medium capitalize">
                  {target.role}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-md border border-white/10 bg-white/5 text-silver-300 font-medium capitalize flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {formatRelativeTime(target.created_at)}
                </span>
              </div>

              {!canManage && (
                <div className="text-xs text-red-400/80 bg-red-400/10 border border-red-400/20 p-3 rounded-xl flex items-start gap-2 text-left mb-4">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>You do not have permission to modify this user due to role hierarchy rules.</p>
                </div>
              )}

              {isSelf && (
                <div className="text-xs text-yellow-400/80 bg-yellow-400/10 border border-yellow-400/20 p-3 rounded-xl flex items-start gap-2 text-left mb-4">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>You cannot modify your own role or status from this panel.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Settings */}
          <div className="md:col-span-2 space-y-6">
            <div className="glass rounded-2xl p-6 border border-white/6">
              <h3 className="text-lg font-display font-bold text-silver-100 mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-gold-400" /> Account Security & Role
              </h3>

              <form action={async (formData) => {
                'use server'
                const supabase = await createSupabaseServerClient()
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return
                
                const newRole = formData.get('role') as UserRole
                const newStatus = formData.get('status') as AccountStatus
                
                // Server-side validation
                const { data: actor } = await supabase.from('profiles').select('*').eq('id', user.id).single()
                const { data: tg } = await supabase.from('profiles').select('*').eq('id', id).single()
                
                if (!hasRole(actor, 'admin') || !canManageUser(actor as Profile, tg.role) || isImmutable(tg) && actor.role !== 'developer') {
                  throw new Error('Unauthorized')
                }

                if (newRole === 'developer') {
                  throw new Error('Developer accounts cannot be created via the admin panel')
                }

                await supabase.from('profiles').update({ role: newRole, status: newStatus }).eq('id', id)
                
                // Audit log
                await supabase.from('activity_logs').insert({
                  admin_id: user.id,
                  action: 'update_user_access',
                  details: { target_id: id, new_role: newRole, new_status: newStatus }
                })
                
                redirect(`/admin/users/${id}`)
              }} className="space-y-6">
                
                <div>
                  <label className="block text-sm font-medium text-silver-300 mb-2">System Role</label>
                  <select
                    name="role"
                    defaultValue={target.role}
                    disabled={!canManage || isTargetImmutable}
                    className="w-full bg-black-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-silver-200 focus:ring-2 focus:ring-gold-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="admin">Admin</option>
                    <option value="seller">Seller</option>
                    <option value="user">User</option>
                  </select>
                  <p className="text-xs text-silver-500 mt-2">Determines the level of access across the platform.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-silver-300 mb-2">Account Status</label>
                  <select
                    name="status"
                    defaultValue={target.status || 'active'}
                    disabled={!canManage || isTargetImmutable}
                    className="w-full bg-black-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-silver-200 focus:ring-2 focus:ring-gold-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended (Temporary)</option>
                    <option value="banned">Banned (Permanent)</option>
                  </select>
                  <p className="text-xs text-silver-500 mt-2">Suspended and banned users cannot access any authenticated areas of the site.</p>
                </div>

                {canManage && (
                  <Button type="submit" className="w-full">Save Changes</Button>
                )}
              </form>
            </div>
            
            {/* Orders list snippet */}
            <div className="glass rounded-2xl p-6 border border-white/6">
              <h3 className="text-lg font-display font-bold text-silver-100 mb-4">Recent Orders</h3>
              {orders && orders.length > 0 ? (
                 <div className="space-y-3">
                   {orders.map((o) => (
                     <div key={o.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                        <div>
                          <p className="text-xs font-mono text-silver-400">#{o.id.slice(0, 8).toUpperCase()}</p>
                          <p className="text-xs text-silver-500 mt-0.5">{formatRelativeTime(o.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gold-400">${o.total.toFixed(2)}</p>
                          <p className="text-xs capitalize text-silver-400">{o.status}</p>
                        </div>
                     </div>
                   ))}
                 </div>
              ) : (
                <p className="text-sm text-silver-500">No recent orders found for this user.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
