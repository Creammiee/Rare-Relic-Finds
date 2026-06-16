import React from 'react'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { hasRole } from '@/lib/rbac'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Dev Console — Create Ad' }

export default async function CreateAdPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Auth handled by middleware

  return (
    <div className="p-6 max-w-2xl font-mono">
      <h1 className="text-xl font-bold text-cyan-500 tracking-tight mb-1">CREATE_AD</h1>
      <p className="text-xs text-cyan-500/50 mb-8">Deploy a new advertisement across the platform</p>

      <form action={async (formData: FormData) => {
        'use server'
        const supabase = await createSupabaseServerClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: actor } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (actor?.role !== 'developer') return

        const title = formData.get('title') as string
        const description = formData.get('description') as string
        const ad_type = formData.get('ad_type') as string
        const link_url = formData.get('link_url') as string
        const image_url = formData.get('image_url') as string
        const status = formData.get('status') as string
        const start_date = formData.get('start_date') as string || null
        const end_date = formData.get('end_date') as string || null
        const target_roles = (formData.get('target_roles') as string)?.split(',').filter(Boolean) ?? []
        const target_routes = (formData.get('target_routes') as string)?.split(',').filter(Boolean) ?? []

        await supabase.from('ads').insert({
          title, description, ad_type, link_url, image_url, status,
          start_date, end_date, target_roles, target_routes,
          created_by: user.id,
        })

        // Audit log
        await supabase.from('activity_logs').insert({
          admin_id: user.id,
          action: 'create_ad',
          details: { title, ad_type, status },
        })

        redirect('/developer/ads')
      }} className="space-y-5">

        <div>
          <label className="block text-xs font-bold text-cyan-500/70 mb-2 uppercase tracking-wider">Title *</label>
          <input name="title" required className="w-full h-9 px-3 rounded-lg bg-black-900 border border-cyan-500/10 text-xs text-silver-200 placeholder:text-silver-600 focus:outline-none focus:border-cyan-500/30 transition-all" placeholder="Summer Sale Banner" />
        </div>

        <div>
          <label className="block text-xs font-bold text-cyan-500/70 mb-2 uppercase tracking-wider">Description</label>
          <textarea name="description" rows={3} className="w-full px-3 py-2 rounded-lg bg-black-900 border border-cyan-500/10 text-xs text-silver-200 placeholder:text-silver-600 focus:outline-none focus:border-cyan-500/30 transition-all resize-none" placeholder="Optional description..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-cyan-500/70 mb-2 uppercase tracking-wider">Ad Type *</label>
            <select name="ad_type" required className="w-full h-9 px-3 rounded-lg bg-black-900 border border-cyan-500/10 text-xs text-silver-200 focus:outline-none focus:border-cyan-500/30 transition-all">
              <option value="banner">Banner</option>
              <option value="sidebar">Sidebar</option>
              <option value="feed">In-Feed</option>
              <option value="popup">Popup / Modal</option>
              <option value="sponsored">Sponsored Listing</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-cyan-500/70 mb-2 uppercase tracking-wider">Status</label>
            <select name="status" className="w-full h-9 px-3 rounded-lg bg-black-900 border border-cyan-500/10 text-xs text-silver-200 focus:outline-none focus:border-cyan-500/30 transition-all">
              <option value="draft">Draft</option>
              <option value="active">Active (Live)</option>
              <option value="paused">Paused</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-cyan-500/70 mb-2 uppercase tracking-wider">Link URL</label>
          <input name="link_url" type="url" className="w-full h-9 px-3 rounded-lg bg-black-900 border border-cyan-500/10 text-xs text-silver-200 placeholder:text-silver-600 focus:outline-none focus:border-cyan-500/30 transition-all" placeholder="https://..." />
        </div>

        <div>
          <label className="block text-xs font-bold text-cyan-500/70 mb-2 uppercase tracking-wider">Image URL</label>
          <input name="image_url" type="url" className="w-full h-9 px-3 rounded-lg bg-black-900 border border-cyan-500/10 text-xs text-silver-200 placeholder:text-silver-600 focus:outline-none focus:border-cyan-500/30 transition-all" placeholder="https://..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-cyan-500/70 mb-2 uppercase tracking-wider">Start Date</label>
            <input name="start_date" type="datetime-local" className="w-full h-9 px-3 rounded-lg bg-black-900 border border-cyan-500/10 text-xs text-silver-200 focus:outline-none focus:border-cyan-500/30 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-cyan-500/70 mb-2 uppercase tracking-wider">End Date</label>
            <input name="end_date" type="datetime-local" className="w-full h-9 px-3 rounded-lg bg-black-900 border border-cyan-500/10 text-xs text-silver-200 focus:outline-none focus:border-cyan-500/30 transition-all" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-cyan-500/70 mb-2 uppercase tracking-wider">Target Roles <span className="text-silver-600 normal-case">(comma separated)</span></label>
          <input name="target_roles" className="w-full h-9 px-3 rounded-lg bg-black-900 border border-cyan-500/10 text-xs text-silver-200 placeholder:text-silver-600 focus:outline-none focus:border-cyan-500/30 transition-all" placeholder="user,seller" />
        </div>

        <div>
          <label className="block text-xs font-bold text-cyan-500/70 mb-2 uppercase tracking-wider">Target Routes <span className="text-silver-600 normal-case">(comma separated)</span></label>
          <input name="target_routes" className="w-full h-9 px-3 rounded-lg bg-black-900 border border-cyan-500/10 text-xs text-silver-200 placeholder:text-silver-600 focus:outline-none focus:border-cyan-500/30 transition-all" placeholder="/marketplace,/categories" />
        </div>

        <div className="pt-4 flex gap-3">
          <Button type="submit" className="bg-cyan-500 hover:bg-red-600 text-white border-none text-xs flex-1">
            Deploy Ad
          </Button>
        </div>
      </form>
    </div>
  )
}
