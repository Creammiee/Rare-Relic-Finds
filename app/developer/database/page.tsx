import React from 'react'
import type { Metadata } from 'next'
import { Database, Server, HardDrive, RefreshCw } from 'lucide-react'

export const metadata: Metadata = { title: 'Dev Console — Database' }

export default function DevDatabasePage() {
  return (
    <div className="p-6 space-y-6 font-mono">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-cyan-500 tracking-tight">DATABASE_INSPECTOR</h1>
          <p className="text-xs text-cyan-500/50 mt-1">Direct PostgreSQL connection metrics</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold tracking-wider hover:bg-cyan-500/20 transition-all">
          <RefreshCw className="w-3 h-3" /> REFRESH
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-cyan-500/10 bg-black-900/50 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <Server className="w-4 h-4 text-cyan-500" />
            </div>
            <div>
              <p className="text-[10px] text-silver-500 uppercase tracking-wider font-bold">Postgres Version</p>
              <p className="text-sm font-medium text-silver-200">15.1.0.127</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-cyan-500/10 bg-black-900/50 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <Database className="w-4 h-4 text-cyan-500" />
            </div>
            <div>
              <p className="text-[10px] text-silver-500 uppercase tracking-wider font-bold">Active Connections</p>
              <p className="text-sm font-medium text-silver-200">12 / 100</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-cyan-500/10 bg-black-900/50 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <HardDrive className="w-4 h-4 text-cyan-500" />
            </div>
            <div>
              <p className="text-[10px] text-silver-500 uppercase tracking-wider font-bold">Storage Used</p>
              <p className="text-sm font-medium text-silver-200">14.2 MB / 500 MB</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-cyan-500/10 bg-black-900/50 p-8 text-center">
        <Database className="w-12 h-12 text-cyan-500/20 mx-auto mb-4" />
        <h2 className="text-sm font-bold text-silver-200 mb-2">Direct Query Terminal</h2>
        <p className="text-xs text-silver-500 max-w-md mx-auto mb-6">
          SQL Terminal access is restricted in this environment. Use the Supabase Dashboard for direct table manipulation.
        </p>
        <a 
          href="https://supabase.com/dashboard/project/_/sql" 
          target="_blank" 
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-black-950 text-xs font-bold uppercase tracking-wider hover:bg-cyan-400 transition-colors"
        >
          Open Supabase Dashboard
        </a>
      </div>
    </div>
  )
}
