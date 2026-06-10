import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth/admin'

export async function GET() {
  try {
    const adminSession = await getAdminSession()

    if (!adminSession) {
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
