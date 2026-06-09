'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  Search, ShoppingCart, Heart, Bell, User, Menu, X,
  Shield, Store, LogOut, Settings, Package, ChevronDown, Gem
} from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import type { Profile } from '@/lib/types'
import { getInitials, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

const navLinks = [
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/categories', label: 'Categories' },
  { href: '/sellers', label: 'Sellers' },
  { href: '/about', label: 'About' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [notifCount, setNotifCount] = useState(0)
  const supabase = createSupabaseBrowserClient()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) setProfile(data)

      // Counts
      const [{ count: cart }, { count: wish }, { count: notif }] = await Promise.all([
        supabase.from('cart_items').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('wishlists').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('read', false),
      ])
      setCartCount(cart ?? 0)
      setWishlistCount(wish ?? 0)
      setNotifCount(notif ?? 0)
    }
    fetchUser()
  }, [pathname])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/marketplace?q=${encodeURIComponent(search.trim())}`)
      setSearch('')
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    router.push('/')
    router.refresh()
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        scrolled ? 'glass-dark shadow-2xl border-b border-white/8' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px] gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-600 to-gold-400 flex items-center justify-center shadow-lg glow-gold-sm">
              <Gem className="w-5 h-5 text-black-950" />
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-bold text-lg text-shimmer">Rare Relic</span>
              <span className="font-display font-bold text-lg text-silver-400 ml-1">Finds</span>
            </div>
          </Link>

          {/* Nav Links – Desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  pathname.startsWith(link.href)
                    ? 'text-gold-400 bg-gold-400/10'
                    : 'text-silver-400 hover:text-silver-200 hover:bg-white/5'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md hidden md:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-500 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search relics, cards, collectibles..."
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm text-silver-200 placeholder:text-silver-600 focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400/50 transition-all"
              />
            </div>
          </form>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {profile ? (
              <>
                {/* Wishlist */}
                <Link href="/wishlist" className="relative p-2 rounded-lg text-silver-400 hover:text-gold-400 hover:bg-white/5 transition-all">
                  <Heart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold-400 text-black-950 text-xs font-bold rounded-full flex items-center justify-center">
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Cart */}
                <Link href="/cart" className="relative p-2 rounded-lg text-silver-400 hover:text-gold-400 hover:bg-white/5 transition-all">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold-400 text-black-950 text-xs font-bold rounded-full flex items-center justify-center">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>

                {/* Notifications */}
                <Link href="/dashboard/notifications" className="relative p-2 rounded-lg text-silver-400 hover:text-gold-400 hover:bg-white/5 transition-all">
                  <Bell className="w-5 h-5" />
                  {notifCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {notifCount > 9 ? '9+' : notifCount}
                    </span>
                  )}
                </Link>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-all cursor-pointer">
                      <Avatar className="w-8 h-8 ring-2 ring-gold-400/30">
                        <AvatarImage src={profile.avatar_url ?? ''} />
                        <AvatarFallback>{getInitials(profile.full_name ?? profile.email)}</AvatarFallback>
                      </Avatar>
                      <ChevronDown className="w-3.5 h-3.5 text-silver-500 hidden sm:block" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel>
                      <div>
                        <p className="text-silver-200 font-semibold truncate">{profile.full_name ?? 'User'}</p>
                        <p className="text-silver-600 text-xs truncate">{profile.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard"><User className="w-4 h-4" /> My Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders"><Package className="w-4 h-4" /> My Orders</Link>
                    </DropdownMenuItem>
                    {profile.role === 'seller' && (
                      <DropdownMenuItem asChild>
                        <Link href="/seller/dashboard"><Store className="w-4 h-4" /> Seller Portal</Link>
                      </DropdownMenuItem>
                    )}
                    {profile.role === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin/dashboard"><Shield className="w-4 h-4" /> Admin Panel</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile/settings"><Settings className="w-4 h-4" /> Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-400 hover:text-red-300">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild className="hidden sm:flex">
                  <Link href="/signup">Get Started</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-silver-400 hover:text-silver-200 hover:bg-white/5 transition-all"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden glass-dark border-t border-white/8 px-4 py-4 space-y-2">
          <form onSubmit={handleSearch} className="mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search collectibles..."
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm text-silver-200 placeholder:text-silver-600 focus:outline-none focus:ring-2 focus:ring-gold-400/50"
              />
            </div>
          </form>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all',
                pathname.startsWith(link.href)
                  ? 'text-gold-400 bg-gold-400/10'
                  : 'text-silver-400 hover:text-silver-200 hover:bg-white/5'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
