import { updateSession } from '@/utils/supabase/middleware'
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Block search engines from crawling admin, API, and dashboard routes
  const shouldBlockCrawlers = pathname.startsWith('/admin') ||
                              pathname.startsWith('/api') ||
                              pathname.startsWith('/user-dashboard') ||
                              pathname.startsWith('/dashboard') ||
                              pathname.startsWith('/_next')

  if (shouldBlockCrawlers) {
    const response = await updateSession(request)
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
    return response
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
