import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from './types'
import { isAdminRequest } from '@/lib/auth/admin'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check admin routes separately using our admin authentication
  if (request.nextUrl.pathname.startsWith('/admin') &&
      request.nextUrl.pathname !== '/admin/signin' &&
      !request.nextUrl.pathname.startsWith('/admin-setup')) {

    console.log('Middleware: Admin route check for:', request.nextUrl.pathname)
    const isAdmin = isAdminRequest(request)
    console.log('Middleware: isAdminRequest result:', isAdmin)

    if (!isAdmin) {
      console.log('Middleware: Redirecting to admin signin - no valid admin session')
      // Redirect to admin signin
      const url = request.nextUrl.clone()
      url.pathname = '/admin/signin'
      return NextResponse.redirect(url)
    } else {
      console.log('Middleware: Admin access granted')
    }
  }

  // Handle regular user dashboard routes with Supabase auth
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/api') &&
    request.nextUrl.pathname !== '/' &&
    !request.nextUrl.pathname.startsWith('/products') &&
    !request.nextUrl.pathname.startsWith('/admin-setup') &&
    !request.nextUrl.pathname.startsWith('/admin') &&
    request.nextUrl.pathname.startsWith('/user-dashboard')
  ) {
    // no user, redirect to auth page for protected routes
    const url = request.nextUrl.clone()
    url.pathname = '/auth/signin'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so: NextResponse.next({ request })
  // 2. Copy over the cookies, like so: supabaseResponse.cookies.getAll().forEach(...)
  // 3. Change the status code if needed, like so: supabaseResponse.status = 200
  // etc.

  return supabaseResponse
}