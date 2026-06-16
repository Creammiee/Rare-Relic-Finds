'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Terminal, LayoutDashboard, Users, Store, Megaphone,
  Database, Activity, Shield, Settings, ChevronLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'

const sidebarItems = [
  { href: '/developer', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/developer/users', label: 'Users', icon: Users },
  { href: '/developer/marketplace', label: 'Marketplace', icon: Store },
  { href: '/developer/ads', label: 'Ads Engine', icon: Megaphone },
  { href: '/developer/database', label: 'Database', icon: Database },
  { href: '/developer/logs', label: 'Audit Logs', icon: Activity },
  { href: '/developer/settings', label: 'Settings', icon: Settings },
]

export default function DeveloperLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-black-950 flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-cyan-500/10 bg-black-950 flex flex-col fixed top-[72px] bottom-0 z-30">
        {/* Header */}
        <div className="px-4 py-5 border-b border-cyan-500/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Terminal className="w-4 h-4 text-cyan-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-cyan-500 tracking-wider">DEV CONSOLE</p>
              <p className="text-[10px] text-cyan-500/50">v1.0.0</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {sidebarItems.map(({ href, label, icon: Icon, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all',
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'text-silver-500 hover:text-silver-300 hover:bg-white/5'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-cyan-500/10">
          <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-silver-600 hover:text-silver-300 hover:bg-white/5 transition-all">
            <ChevronLeft className="w-3.5 h-3.5" />
            Back to App
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-56 pt-[72px] min-h-screen">
        {children}
      </main>
    </div>
  )
}
