import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertOctagon, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Account Suspended' }

export default function SuspendedPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center glass-dark rounded-3xl p-12 border border-orange-500/20 max-w-lg w-full relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500/0 via-orange-500 to-orange-500/0" />
        
        <div className="w-20 h-20 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mx-auto mb-6">
          <AlertOctagon className="w-10 h-10 text-orange-500" />
        </div>
        
        <h1 className="font-display text-3xl font-bold text-silver-100 mb-3">Account Suspended</h1>
        <p className="text-silver-400 mb-8 leading-relaxed">
          Your account has been temporarily suspended due to a violation of our terms of service or for security reasons.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline" className="border-white/10 hover:bg-white/5">
            <Link href="/login">Sign In with Different Account</Link>
          </Button>
          <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white border-none">
            <a href="mailto:support@rarerelicfinds.com"><Mail className="w-4 h-4 mr-2" /> Contact Support</a>
          </Button>
        </div>
      </div>
    </div>
  )
}
