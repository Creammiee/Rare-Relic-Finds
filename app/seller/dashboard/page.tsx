import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { Grid, List, Package, Plus, Eye, Edit, BarChart2, ShoppingBag, Star, DollarSign, TrendingUp, ChevronRight, Store } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Product, Order, Seller } from '@/lib/types'
import { formatCurrency, formatRelativeTime, getStatusColor, cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Seller Dashboard' }

async function getSellerData(userId: string) {
  const supabase = await createSupabaseServerClient()

  const { data: seller } = await supabase
    .from('sellers')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!seller) return null

  const [
    { data: products, count: productCount },
    { data: orders, count: orderCount },
    { data: recentOrders },
  ] = await Promise.all([
    supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('seller_id', seller.id)
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('order_items')
      .select('*, order:orders(id, status, created_at, total), product:products(title)', { count: 'exact' })
      .eq('seller_id', seller.id),
    supabase
      .from('order_items')
      .select('*, order:orders(id, status, created_at), product:products(title, images)')
      .eq('seller_id', seller.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const totalRevenue = (orders ?? []).reduce((s: number, o: { price: number; quantity: number }) => s + o.price * o.quantity, 0)

  return {
    seller: seller as Seller,
    products: (products as Product[]) ?? [],
    productCount: productCount ?? 0,
    orderCount: orderCount ?? 0,
    totalRevenue,
    recentOrders: recentOrders ?? [],
  }
}

export default async function SellerDashboardPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'seller' && profile?.role !== 'admin') redirect('/dashboard')

  const sellerData = await getSellerData(user.id)

  if (!sellerData) {
    return (
      <div className="min-h-screen bg-luxury flex items-center justify-center px-4">
        <div className="text-center glass rounded-2xl p-10 border border-white/8 max-w-md">
          <Store className="w-14 h-14 text-gold-400 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-silver-100 mb-3">Seller Application Pending</h2>
          <p className="text-silver-400 text-sm mb-6">Your seller account is being reviewed. You&apos;ll be notified once approved.</p>
          <Button asChild variant="outline"><Link href="/dashboard">← Back to Dashboard</Link></Button>
        </div>
      </div>
    )
  }

  const { seller, products, productCount, orderCount, totalRevenue, recentOrders } = sellerData
  const pendingProducts = products.filter((p) => p.status === 'pending').length
  const approvedProducts = products.filter((p) => p.status === 'approved').length

  const stats = [
    { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'text-gold-400', bg: 'bg-gold-400/10' },
    { label: 'Total Orders', value: orderCount, icon: ShoppingBag, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Products', value: productCount, icon: Package, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Store Rating', value: seller.rating?.toFixed(1) ?? '—', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  ]

  return (
    <div className="min-h-screen bg-luxury py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-display text-3xl font-bold text-silver-100">{seller.store_name}</h1>
              {seller.verified && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-green-400/10 border border-green-400/30 text-green-400">✓ Verified</span>
              )}
              {seller.status === 'pending' && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400">Pending Review</span>
              )}
            </div>
            <p className="text-silver-500 text-sm">Seller Dashboard</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/sellers/${seller.id}`}><Eye className="w-4 h-4" /> View Store</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/seller/products/new"><Plus className="w-4 h-4" /> Add Product</Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="glass rounded-2xl p-5 border border-white/6">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', bg)}>
                <Icon className={cn('w-5 h-5', color)} />
              </div>
              <div className="text-2xl font-bold text-silver-100 font-display">{value}</div>
              <div className="text-xs text-silver-500 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Pending alerts */}
        {seller.status === 'pending' && (
          <div className="mb-6 p-4 rounded-xl bg-yellow-400/5 border border-yellow-400/20 text-yellow-300 text-sm flex items-start gap-3">
            <span className="text-yellow-400 text-lg">⏳</span>
            <div>
              <p className="font-semibold">Store Under Review</p>
              <p className="text-yellow-400/70 text-xs mt-0.5">Our team is reviewing your store. You can add products but they won&apos;t be visible until approved.</p>
            </div>
          </div>
        )}

        {pendingProducts > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-blue-400/5 border border-blue-400/20 text-blue-300 text-sm flex items-start gap-3">
            <span className="text-blue-400 text-lg">📋</span>
            <div>
              <p className="font-semibold">{pendingProducts} product{pendingProducts > 1 ? 's' : ''} awaiting approval</p>
              <p className="text-blue-400/70 text-xs mt-0.5">Products are reviewed within 24 hours before going live.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Products */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-silver-100">Your Products</h2>
              <Link href="/seller/products" className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1">
                Manage All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {products.length === 0 ? (
              <div className="text-center py-12 glass rounded-2xl border border-white/6">
                <Package className="w-10 h-10 text-silver-600 mx-auto mb-3" />
                <p className="text-silver-400 text-sm mb-4">No products yet. Start listing your relics!</p>
                <Button size="sm" asChild>
                  <Link href="/seller/products/new"><Plus className="w-4 h-4" /> Add First Product</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((product) => (
                  <div key={product.id} className="glass rounded-xl p-4 border border-white/6 flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-black-800 shrink-0">
                      <Image
                        src={product.images?.[0] ?? '/placeholder-relic.jpg'}
                        alt={product.title}
                        fill
                        className="object-cover"
                        sizes="56px"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-relic.jpg' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-silver-200 truncate">{product.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn('text-xs px-2 py-0.5 rounded-full', getStatusColor(product.status))}>
                          {product.status}
                        </span>
                        <span className="text-xs text-silver-500">{product.stock} in stock</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-gold-400 font-bold text-sm">{formatCurrency(product.price)}</p>
                      <div className="flex gap-1 mt-1 justify-end">
                        <Link href={`/seller/products/${product.id}/edit`} className="p-1.5 rounded-lg hover:bg-white/10 text-silver-500 hover:text-silver-200 transition-all">
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <Link href={`/products/${product.id}`} className="p-1.5 rounded-lg hover:bg-white/10 text-silver-500 hover:text-silver-200 transition-all">
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Sales */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-silver-100">Recent Sales</h2>
              <Link href="/seller/orders" className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1">
                All Orders <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="text-center py-12 glass rounded-2xl border border-white/6">
                <ShoppingBag className="w-8 h-8 text-silver-600 mx-auto mb-2" />
                <p className="text-silver-500 text-sm">No sales yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((item: { id: string; product: { title: string; images: string[] }; order: { id: string; status: string; created_at: string }; quantity: number; price: number }) => (
                  <div key={item.id} className="glass rounded-xl p-3 border border-white/6">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-silver-400">#{item.order?.id.slice(0, 6).toUpperCase()}</span>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full', getStatusColor(item.order?.status))}>
                        {item.order?.status}
                      </span>
                    </div>
                    <p className="text-xs text-silver-300 truncate">{item.product?.title}</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-silver-500">{formatRelativeTime(item.order?.created_at)}</span>
                      <span className="text-xs font-bold text-gold-400">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Links */}
            <div className="mt-6 glass rounded-2xl p-4 border border-white/6">
              <h3 className="text-sm font-semibold text-silver-300 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { label: 'Manage Products', href: '/seller/products', icon: Package },
                  { label: 'View Orders', href: '/seller/orders', icon: ShoppingBag },
                  { label: 'Analytics', href: '/seller/analytics', icon: BarChart2 },
                  { label: 'Store Settings', href: '/seller/profile', icon: Store },
                ].map(({ label, href, icon: Icon }) => (
                  <Link key={href} href={href} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-silver-400 hover:text-silver-200 transition-all group">
                    <Icon className="w-4 h-4 text-gold-400/60 group-hover:text-gold-400 transition-colors" />
                    <span className="text-sm">{label}</span>
                    <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
