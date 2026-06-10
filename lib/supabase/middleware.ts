import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from './types'
import { isAdminRequest } from '@/lib/auth/admin'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Middleware: Missing Supabase environment variables')
    return supabaseResponse
  }

  // Trim any whitespace/newlines from the key
  const cleanKey = supabaseKey.trim().replace(/\s+/g, '')

  let supabase
  try {
    supabase = createServerClient<Database>(
      supabaseUrl,
      cleanKey,
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
  } catch (error) {
    console.error('Middleware: Failed to create Supabase client:', error)
    return supabaseResponse
  }

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out. We call getUser() for its
  // session-refresh side effect; the returned user isn't needed here.
  try {
    await supabase.auth.getUser()
  } catch (error) {
    console.error('Middleware: Failed to get user:', error)
    // Continue without user - they'll be treated as logged out
  }

  // --- Admin authorization (verified signed admin-session cookie) ---
  const path = request.nextUrl.pathname

  // Admin API routes: the authoritative gate. Anyone without a valid admin
  // session gets a 401 before the handler runs. /api/admin/session and
  // /api/admin/signout manage their own state and must stay reachable.
  if (
    path.startsWith('/api/admin') &&
    path !== '/api/admin/session' &&
    path !== '/api/admin/signout'
  ) {
    if (!(await isAdminRequest(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  // Admin pages: redirect unauthenticated visitors to the sign-in page.
  if (
    path.startsWith('/admin') &&
    path !== '/admin/signin' &&
    !path.startsWith('/admin-setup')
  ) {
    if (!(await isAdminRequest(request))) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/signin'
      return NextResponse.redirect(url)
    }
  }

  // NOTE: User dashboard authentication is now handled client-side by Better Auth
  // We removed the Supabase auth check here since we're using Better Auth
  // The dashboard page itself will redirect if not authenticated

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so: NextResponse.next({ request })
  // 2. Copy over the cookies, like so: supabaseResponse.cookies.getAll().forEach(...)
  // 3. Change the status code if needed, like so: supabaseResponse.status = 200
  // etc.

  return supabaseResponse
}
