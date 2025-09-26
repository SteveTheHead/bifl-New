import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Simple hardcoded check for admin credentials
    const adminEmail = process.env.DEV_ADMIN_EMAIL || 'admin@bifl.dev'
    const adminPassword = process.env.DEV_ADMIN_PASSWORD || 'BiflAdmin123'

    if (email === adminEmail && password === adminPassword) {
      // Set a simple session cookie (simple string to avoid JSON parsing issues)
      const cookieStore = await cookies()
      cookieStore.set('admin-session', 'admin-authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })

      return NextResponse.json({
        success: true,
        user: {
          email: adminEmail,
          name: 'BIFL Admin',
          role: 'admin'
        },
        redirectUrl: '/admin'
      })
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )
  } catch (error) {
    console.error('Simple auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}