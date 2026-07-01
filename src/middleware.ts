
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/services/supabase/middleware'
import { canAccessRoute } from '@/lib/permissions'
import { RoleName } from '@/types/auth.types'

const PUBLIC_ROUTES = ['/sign-in', '/forgot-password', '/reset-password']

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user, supabase } = await updateSession(request)
  const path = request.nextUrl.pathname

  const isPublicRoute = PUBLIC_ROUTES.some((route) => path.startsWith(route))

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

  // Role-level route protection — only runs for authenticated users on protected routes
  if (user && !isPublicRoute && path !== '/') {
    const { data: roleRows } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', user.id)

    const roles = (roleRows ?? []).map((r: any) => r.roles?.name).filter(Boolean) as RoleName[]

    if (!canAccessRoute(roles, path)) {
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