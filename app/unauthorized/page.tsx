import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Access Denied' }

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center glass-dark rounded-3xl p-12 border border-red-500/20 max-w-lg w-full relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/0 via-red-500 to-red-500/0" />
        
        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-10 h-10 text-red-500" />
        </div>
        
        <h1 className="font-display text-3xl font-bold text-silver-100 mb-3">Access Denied</h1>
        <p className="text-silver-400 mb-8 leading-relaxed">
          You do not have the required permissions to view this page. If you believe this is an error, please contact support.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline" className="border-white/10 hover:bg-white/5">
            <Link href="/">Return Home</Link>
          </Button>
          <Button asChild className="bg-red-500 hover:bg-red-600 text-white border-none">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
