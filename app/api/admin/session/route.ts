import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const adminSessionCookie = cookieStore.get('admin-session')

    if (!adminSessionCookie) {
      return NextResponse.json({
        isAuthenticated: false,
        user: null
      })
    }

    // Parse the admin session cookie
    const adminSession = JSON.parse(adminSessionCookie.value)

    // Check if session is still valid (24 hours)
    const sessionAge = Date.now() - (adminSession.loginTime || 0)
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

    if (sessionAge > maxAge) {
      return NextResponse.json({
        isAuthenticated: false,
        user: null
      })
    }

    return NextResponse.json({
      isAuthenticated: true,
      user: {
        id: adminSession.id,
        email: adminSession.email,
        name: adminSession.name,
        role: adminSession.role,
        isAdmin: true
      }
    })

  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({
      isAuthenticated: false,
      user: null
    })
  }
}
