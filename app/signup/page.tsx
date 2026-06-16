'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Gem, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function SignupPage() {
  const [step, setStep] = useState(1)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'user' | 'seller'>('user')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createSupabaseBrowserClient()
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    setError('')

    // Strict role validation to prevent privilege escalation via API manipulation
    const safeRole = role === 'seller' ? 'seller' : 'user'

    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role: safeRole } },
    })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    // Create profile
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        role: safeRole,
        status: 'active'
      })

      // If seller, create seller application
      if (safeRole === 'seller') {
        await supabase.from('sellers').insert({
          user_id: data.user.id,
          store_name: fullName + "'s Store",
          status: 'pending',
          commission_rate: 0.1,
        })
      }
    }

    toast.success('Account created! Welcome to Rare Relic Finds.')
    router.push(role === 'seller' ? '/seller/dashboard' : '/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-luxury flex items-center justify-center px-4 py-20">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gold-400/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-600 to-gold-400 flex items-center justify-center shadow-lg glow-gold">
              <Gem className="w-6 h-6 text-black-950" />
            </div>
          </Link>
          <h1 className="font-display text-3xl font-bold text-silver-100 mb-2">Join the Vault</h1>
          <p className="text-silver-500 text-sm">Create your Rare Relic Finds account</p>
        </div>

        <div className="glass-dark rounded-2xl border border-white/10 p-8 shadow-2xl">
          {error && (
            <div className="flex items-center gap-3 mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            {/* Account Type */}
            <div>
              <label className="block text-xs font-medium text-silver-400 mb-2 uppercase tracking-wider">I want to</label>
              <div className="grid grid-cols-2 gap-3">
                {(['user', 'seller'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all duration-200 cursor-pointer ${
                      role === r
                        ? 'border-gold-400/60 bg-gold-400/10 text-gold-400'
                        : 'border-white/10 bg-white/3 text-silver-400 hover:border-white/20'
                    }`}
                  >
                    {r === 'user' ? '🛒 Buy Relics' : '🏪 Sell Relics'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-silver-400 mb-1.5 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-600" />
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-silver-400 mb-1.5 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-600" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="collector@example.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-silver-400 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-600" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-silver-600 hover:text-silver-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-silver-400 mb-1.5 uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-600" />
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="pl-10"
                  required
                />
                {confirmPassword && password === confirmPassword && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
                )}
              </div>
            </div>

            <p className="text-xs text-silver-600 leading-relaxed">
              By creating an account you agree to our{' '}
              <Link href="/terms" className="text-gold-400 hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-gold-400 hover:underline">Privacy Policy</Link>.
            </p>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-silver-500">
            Already have an account?{' '}
            <Link href="/login" className="text-gold-400 hover:text-gold-300 font-medium transition-colors">
              Sign In
            </Link>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-silver-600 hover:text-silver-400 transition-colors">
            ← Back to Rare Relic Finds
          </Link>
        </div>
      </div>
    </div>
  )
}
