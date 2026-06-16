'use client'
import { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

export default function UpgradeNowPage() {
  const [status, setStatus] = useState('Upgrading your account...')
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    const upgrade = async () => {
      // 1. Force the auth session to have the developer role
      const { data, error } = await supabase.auth.updateUser({
        data: { 
          role: 'developer',
          full_name: 'Timothy Jay'
        }
      })

      if (error) {
        setStatus('Error: ' + error.message)
        return
      }

      setStatus('Success! You are now a developer. Redirecting...')
      
      // Force refresh the session
      await supabase.auth.refreshSession()
      
      setTimeout(() => {
        router.push('/')
        router.refresh()
      }, 1500)
    }

    upgrade()
  }, [router, supabase])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black-950">
      <div className="text-center p-8 bg-black-900 border border-red-500/20 rounded-2xl">
        <h1 className="text-2xl font-bold text-red-400 mb-4">Developer Account Upgrade</h1>
        <p className="text-silver-300">{status}</p>
      </div>
    </div>
  )
}
