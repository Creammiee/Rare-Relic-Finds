import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { hasRole } from '@/lib/rbac'
import type { Profile } from '@/lib/types'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Protected user routes
  const userRoutes = ['/dashboard', '/wishlist', '/cart', '/checkout', '/orders', '/profile']
  const sellerRoutes = ['/seller']
  const adminRoutes = ['/admin']
  const developerRoutes = ['/developer']

  const isUserRoute = userRoutes.some((r) => pathname.startsWith(r))
  const isSellerRoute = pathname === '/seller' || pathname.startsWith('/seller/')
  const isAdminRoute = adminRoutes.some((r) => pathname.startsWith(r))
  const isDeveloperRoute = developerRoutes.some((r) => pathname.startsWith(r))
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup')

  // Not logged in but trying to access protected route
  if (!user && (isUserRoute || isSellerRoute || isAdminRoute || isDeveloperRoute)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  // Logged in but on auth route
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Logged in user access checks
  if (user && (isUserRoute || isSellerRoute || isAdminRoute || isDeveloperRoute)) {
    // Platform owner bypass — skip ALL checks for owner
    if (user.email === 'timothyjaymarquez018@gmail.com') {
      return supabaseResponse
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single() as { data: { role: string } | null }

    if (!profile) {
      // Profile missing — let them through to basic user routes only
      if (isDeveloperRoute || isAdminRoute || isSellerRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/unauthorized'
        return NextResponse.redirect(url)
      }
      return supabaseResponse
    }

    // Role checks using RBAC hierarchy
    if (isDeveloperRoute && !hasRole(profile, 'developer')) {
      const url = request.nextUrl.clone()
      url.pathname = '/unauthorized'
      return NextResponse.redirect(url)
    }

    if (isAdminRoute && !hasRole(profile, 'admin')) {
      const url = request.nextUrl.clone()
      url.pathname = '/unauthorized'
      return NextResponse.redirect(url)
    }

    if (isSellerRoute && !hasRole(profile, 'seller')) {
      const url = request.nextUrl.clone()
      url.pathname = '/unauthorized'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
