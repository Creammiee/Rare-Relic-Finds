import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString))
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(dateString)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getRarityLabel(score: number): string {
  if (score >= 9) return 'Ultra Rare'
  if (score >= 7) return 'Very Rare'
  if (score >= 5) return 'Rare'
  if (score >= 3) return 'Uncommon'
  return 'Common'
}

export function getRarityColor(score: number): string {
  if (score >= 9) return 'text-amber-400'
  if (score >= 7) return 'text-purple-400'
  if (score >= 5) return 'text-blue-400'
  if (score >= 3) return 'text-green-400'
  return 'text-zinc-400'
}

export function getConditionLabel(condition: string): string {
  const labels: Record<string, string> = {
    mint: 'Mint',
    near_mint: 'Near Mint',
    excellent: 'Excellent',
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor',
  }
  return labels[condition] ?? condition
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'text-yellow-400 bg-yellow-400/10',
    approved: 'text-green-400 bg-green-400/10',
    confirmed: 'text-green-400 bg-green-400/10',
    rejected: 'text-red-400 bg-red-400/10',
    cancelled: 'text-red-400 bg-red-400/10',
    shipped: 'text-blue-400 bg-blue-400/10',
    delivered: 'text-emerald-400 bg-emerald-400/10',
    refunded: 'text-orange-400 bg-orange-400/10',
    draft: 'text-zinc-400 bg-zinc-400/10',
    open: 'text-yellow-400 bg-yellow-400/10',
    in_progress: 'text-blue-400 bg-blue-400/10',
    resolved: 'text-green-400 bg-green-400/10',
    closed: 'text-zinc-400 bg-zinc-400/10',
    suspended: 'text-red-400 bg-red-400/10',
  }
  return colors[status] ?? 'text-zinc-400 bg-zinc-400/10'
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function generateOrderNumber(): string {
  return `RRF-${Date.now().toString(36).toUpperCase()}`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
