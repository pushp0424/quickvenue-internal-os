import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/services/supabase/middleware'
import { canAccessRoute } from '@/lib/permissions'

const PUBLIC_ROUTES = ['/sign-in', '/forgot-password', '/reset-password']
// Routes an authenticated user may always reach regardless of role.
const ROLE_EXEMPT_ROUTES = ['/', '/unauthorized']

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isPublicRoute = PUBLIC_ROUTES.some((r) => path.startsWith(r))

  try {
    const { supabaseResponse, user, roles } = await Promise.race([
      updateSession(request),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 3000)
      ),
    ])

    if (!user && !isPublicRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/sign-in'
      return NextResponse.redirect(url)
    }

    if (user && isPublicRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    // Server-side role-based route protection: a signed-in user hitting a
    // dashboard route their role can't access is redirected to /unauthorized
    // rather than rendering the page (client-side nav only hides the links).
    if (user && !isPublicRoute && !ROLE_EXEMPT_ROUTES.includes(path)) {
      if (!canAccessRoute(roles, path)) {
        const url = request.nextUrl.clone()
        url.pathname = '/unauthorized'
        return NextResponse.redirect(url)
      }
    }

    return supabaseResponse

  } catch {
    if (isPublicRoute) return NextResponse.next()
    const url = request.nextUrl.clone()
    url.pathname = '/sign-in'
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}