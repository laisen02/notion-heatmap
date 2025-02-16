import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Add pathname to headers for layout to check
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', request.nextUrl.pathname)

  // Allow embed URLs without authentication
  if (request.nextUrl.pathname.startsWith('/embed/')) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  try {
    // Refresh session if expired - required for Server Components
    await supabase.auth.getSession()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Auth pages should redirect to dashboard if user is already logged in
    if (session && request.nextUrl.pathname.startsWith('/auth')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Protected routes should redirect to login if user is not logged in
    if (!session && isProtectedRoute(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return res
  }
}

// Protected routes that require authentication
function isProtectedRoute(pathname: string): boolean {
  return ['/dashboard', '/create', '/edit', '/settings'].some(route => 
    pathname.startsWith(route)
  )
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - public files with extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/dashboard/:path*',
    '/create/:path*',
    '/edit/:path*',
    '/settings/:path*',
    '/profile/:path*',
  ],
} 