import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('admin-session')

    if (sessionCookie && sessionCookie.value === 'admin-authenticated') {
      return NextResponse.json({
        isAuthenticated: true,
        user: {
          email: 'admin@bifl.dev',
          name: 'BIFL Admin',
          role: 'admin',
          isAdmin: true
        }
      })
    }

    return NextResponse.json({
      isAuthenticated: false,
      user: null
    })
  } catch (error) {
    return NextResponse.json({
      isAuthenticated: false,
      user: null
    })
  }
}