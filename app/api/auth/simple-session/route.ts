import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getAdminSession } from '@/lib/auth/admin'

export async function GET(request: NextRequest) {
  try {
    // First check for admin session
    const adminSession = getAdminSession(request)
    if (adminSession) {
      return NextResponse.json({
        isAuthenticated: true,
        user: {
          id: adminSession.id,
          email: adminSession.email,
          name: adminSession.name,
          isAdmin: true
        }
      })
    }

    // Fallback to Supabase user session
    const supabase = await createClient()

    // Get the current user session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({
        isAuthenticated: false,
        user: null
      })
    }

    // Check if user is admin based on environment variables or metadata
    const isAdmin = checkIfUserIsAdmin(user.email || '')

    return NextResponse.json({
      isAuthenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Admin',
        isAdmin
      }
    })

  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({
      isAuthenticated: false,
      user: null,
      error: 'Failed to check session'
    }, { status: 500 })
  }
}

function checkIfUserIsAdmin(email: string): boolean {
  // Check against development admin credentials from .env.local
  const devAdminEmail = process.env.DEV_ADMIN_EMAIL

  if (devAdminEmail && email === devAdminEmail) {
    return true
  }

  // You can add more admin checking logic here:
  // - Check against a list of admin emails
  // - Check user metadata for admin role
  // - Query database for admin status

  // For now, let's also check some common admin emails
  const adminEmails = [
    'admin@bifl.dev',
    'admin@localhost',
    'test@admin.com'
  ]

  return adminEmails.includes(email.toLowerCase())
}