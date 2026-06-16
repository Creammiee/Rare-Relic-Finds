import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Search, ShieldAlert, CheckCircle, Store, XCircle, Clock } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Profile } from '@/lib/types'
import { formatRelativeTime, cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Seller Applications' }

export default async function AdminSellersPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const params = await searchParams
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Auth handled by middleware

  let query = supabase.from('profiles').select('*').in('seller_application_status', ['pending', 'approved', 'rejected', 'suspended']).order('created_at', { ascending: false })
  
  if (params.q) query = query.or(`full_name.ilike.%${params.q}%,email.ilike.%${params.q}%`)
  if (params.status) query = query.eq('seller_application_status', params.status)

  const { data: users } = await query
  const sellers = (users as Profile[]) ?? []

  const counts = {
    pending: sellers.filter(s => s.seller_application_status === 'pending').length,
    approved: sellers.filter(s => s.seller_application_status === 'approved').length,
    rejected: sellers.filter(s => s.seller_application_status === 'rejected').length,
  }

  return (
    <div className="min-h-screen bg-luxury py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-silver-100 flex items-center gap-3">
              <Store className="w-8 h-8 text-gold-400" />
              Seller Verification
            </h1>
            <p className="text-silver-500 mt-2">Approve or reject seller applications to prevent scams.</p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Link href="/admin/sellers?status=pending" className={cn('rounded-xl border p-4 text-center transition-all', params.status === 'pending' ? 'border-orange-500/30 bg-orange-500/10' : 'border-white/10 bg-black-900/50 hover:bg-white/5')}>
            <p className="text-2xl font-bold text-orange-400">{counts.pending}</p>
            <p className="text-xs uppercase tracking-wider text-silver-500 font-bold">Pending Review</p>
          </Link>
          <Link href="/admin/sellers?status=approved" className={cn('rounded-xl border p-4 text-center transition-all', params.status === 'approved' ? 'border-green-500/30 bg-green-500/10' : 'border-white/10 bg-black-900/50 hover:bg-white/5')}>
            <p className="text-2xl font-bold text-green-400">{counts.approved}</p>
            <p className="text-xs uppercase tracking-wider text-silver-500 font-bold">Approved</p>
          </Link>
          <Link href="/admin/sellers?status=rejected" className={cn('rounded-xl border p-4 text-center transition-all', params.status === 'rejected' ? 'border-red-500/30 bg-red-500/10' : 'border-white/10 bg-black-900/50 hover:bg-white/5')}>
            <p className="text-2xl font-bold text-red-400">{counts.rejected}</p>
            <p className="text-xs uppercase tracking-wider text-silver-500 font-bold">Rejected</p>
          </Link>
        </div>

        {/* Table */}
        <div className="glass rounded-2xl border border-white/6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-silver-400 uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4 font-medium">Applicant</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Applied</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sellers.map((s) => (
                  <tr key={s.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gold-400/10 flex items-center justify-center text-gold-400 font-bold shrink-0 border border-gold-400/20">
                          {(s.full_name?.[0] ?? s.email[0]).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-silver-200 font-medium">{s.full_name || 'Unknown'}</p>
                          <p className="text-silver-500 text-xs">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider', 
                        s.seller_application_status === 'pending' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                        s.seller_application_status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      )}>
                        {s.seller_application_status === 'pending' && <Clock className="w-3 h-3" />}
                        {s.seller_application_status === 'approved' && <CheckCircle className="w-3 h-3" />}
                        {s.seller_application_status === 'rejected' && <XCircle className="w-3 h-3" />}
                        {s.seller_application_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-silver-500 text-xs">{formatRelativeTime(s.created_at)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {s.seller_application_status === 'pending' && (
                          <>
                            <form action={async () => {
                              'use server'
                              const { createSupabaseServerClient } = await import('@/lib/supabase-server')
                              const supabase = await createSupabaseServerClient()
                              const { data: { user } } = await supabase.auth.getUser()
                              await supabase.from('profiles').update({ 
                                role: 'seller', 
                                seller_application_status: 'approved',
                                approved_by: user?.id,
                                approved_at: new Date().toISOString()
                              }).eq('id', s.id)
                              await supabase.from('activity_logs').insert({ action: 'approve_seller_application', details: { target_id: s.id } })
                            }}>
                              <button type="submit" className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 text-xs font-bold transition-colors">
                                Approve
                              </button>
                            </form>
                            <form action={async () => {
                              'use server'
                              const { createSupabaseServerClient } = await import('@/lib/supabase-server')
                              const supabase = await createSupabaseServerClient()
                              await supabase.from('profiles').update({ 
                                seller_application_status: 'rejected'
                              }).eq('id', s.id)
                              await supabase.from('activity_logs').insert({ action: 'reject_seller_application', details: { target_id: s.id } })
                            }}>
                              <button type="submit" className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 text-xs font-bold transition-colors">
                                Reject
                              </button>
                            </form>
                          </>
                        )}
                        <Link href={`/admin/users/${s.id}`} className="px-3 py-1.5 rounded-lg bg-white/5 text-silver-300 border border-white/10 hover:bg-white/10 text-xs font-bold transition-colors">
                          Profile
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {sellers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-silver-500">No seller applications found.</td>
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
