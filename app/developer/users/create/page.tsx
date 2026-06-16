import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { UserPlus, Shield, ChevronLeft } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'

export const metadata: Metadata = { title: 'Dev Console — Create User' }

export default async function DevCreateUserPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="p-6 max-w-2xl font-mono">
      <div className="mb-8">
        <Link href="/developer/users" className="text-silver-500 hover:text-cyan-400 flex items-center gap-2 mb-4 text-xs font-bold transition-colors w-fit">
          <ChevronLeft className="w-4 h-4" /> BACK TO USERS
        </Link>
        <h1 className="text-xl font-bold text-cyan-500 tracking-tight flex items-center gap-3">
          <UserPlus className="w-6 h-6" />
          CREATE_SYSTEM_ACCOUNT
        </h1>
        <p className="text-xs text-cyan-500/50 mt-2">Bypass standard registration to instantly provision Admin, Seller, or User accounts.</p>
      </div>

      <div className="rounded-xl border border-cyan-500/10 bg-black-900/50 p-6">
        <form action={async (formData) => {
          'use server'
          const name = formData.get('name') as string
          const email = formData.get('email') as string
          const password = formData.get('password') as string
          const role = formData.get('role') as string

          // 1. Create a completely isolated Supabase client to bypass cookie session
          // We set persistSession: false so it doesn't log the Developer out!
          const tempSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { auth: { autoRefreshToken: false, persistSession: false } }
          )

          // 2. Register the user
          const { data, error } = await tempSupabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: name,
                role: role // Supabase auth hook might map this to profiles
              }
            }
          })

          if (error) {
             throw new Error(error.message)
          }

          if (data?.user) {
            // 3. Force update their profile role via the trusted server client (bypasses RLS)
            const { createSupabaseServerClient } = await import('@/lib/supabase-server')
            const serverSupabase = await createSupabaseServerClient()
            
            await serverSupabase.from('profiles').update({ 
              role: role,
              seller_application_status: role === 'seller' ? 'approved' : null
            }).eq('id', data.user.id)

            // Audit Log
            const { data: { user: admin } } = await serverSupabase.auth.getUser()
            await serverSupabase.from('activity_logs').insert({
              admin_id: admin?.id,
              action: 'admin_create_user',
              details: { new_user_id: data.user.id, role, email }
            })
          }

          redirect('/developer/users')
        }} className="space-y-5">

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-silver-500 uppercase tracking-wider">Full Name</label>
              <input 
                name="name" 
                required 
                placeholder="John Doe"
                className="w-full bg-black-950 border border-cyan-500/20 rounded-lg px-4 py-2.5 text-sm text-silver-200 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-silver-500 uppercase tracking-wider">Email Address</label>
              <input 
                name="email" 
                type="email" 
                required 
                placeholder="john@example.com"
                className="w-full bg-black-950 border border-cyan-500/20 rounded-lg px-4 py-2.5 text-sm text-silver-200 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-silver-500 uppercase tracking-wider">Password (Min 6 chars)</label>
            <input 
              name="password" 
              type="password" 
              required 
              minLength={6}
              placeholder="••••••••"
              className="w-full bg-black-950 border border-cyan-500/20 rounded-lg px-4 py-2.5 text-sm text-silver-200 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-silver-500 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" /> Account Role
            </label>
            <div className="grid grid-cols-3 gap-3">
              <label className="cursor-pointer">
                <input type="radio" name="role" value="admin" className="peer sr-only" />
                <div className="rounded-lg border border-white/5 bg-black-950 p-3 text-center peer-checked:border-gold-400 peer-checked:bg-gold-400/10 transition-all">
                  <p className="text-xs font-bold text-gold-400 uppercase tracking-wider">Admin</p>
                </div>
              </label>
              <label className="cursor-pointer">
                <input type="radio" name="role" value="seller" className="peer sr-only" />
                <div className="rounded-lg border border-white/5 bg-black-950 p-3 text-center peer-checked:border-green-400 peer-checked:bg-green-400/10 transition-all">
                  <p className="text-xs font-bold text-green-400 uppercase tracking-wider">Seller</p>
                </div>
              </label>
              <label className="cursor-pointer">
                <input type="radio" name="role" value="user" className="peer sr-only" defaultChecked />
                <div className="rounded-lg border border-white/5 bg-black-950 p-3 text-center peer-checked:border-blue-400 peer-checked:bg-blue-400/10 transition-all">
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">User</p>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-cyan-500/10">
            <button 
              type="submit" 
              className="w-full py-3 rounded-lg bg-cyan-500 text-black-950 font-bold uppercase tracking-wider text-xs hover:bg-cyan-400 transition-colors"
            >
              PROVISION ACCOUNT
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
