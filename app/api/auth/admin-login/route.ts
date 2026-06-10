import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { PasswordUtils } from '@/lib/auth/password'
import { revalidatePath } from 'next/cache'
import { ADMIN_SESSION_COOKIE, signAdminSession, type AdminSession } from '@/lib/auth/admin'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // admin_users has RLS enabled with no anon policy, so the credential
    // lookup must use the service-role client. This route IS the auth
    // boundary (it verifies the password itself), so bypassing RLS here is
    // correct, not a leak.
    const supabase = createAdminClient()

    // Find admin user in database (using type assertion for temporary fix)
    const { data: adminUser, error: fetchError } = await (supabase as any)
      .from('admin_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .single()

    if (fetchError || !adminUser) {
      return NextResponse.json({
        error: 'Invalid admin credentials. Please check your email and password.'
      }, { status: 401 })
    }

    // Verify password
    const isPasswordValid = await PasswordUtils.verify(password, (adminUser as any).password_hash)

    if (!isPasswordValid) {
      return NextResponse.json({
        error: 'Invalid admin credentials. Please check your email and password.'
      }, { status: 401 })
    }

    // Update last login timestamp
    const { error: updateError } = await (supabase as any)
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', (adminUser as any).id)

    if (updateError) {
      console.warn('Failed to update last login:', updateError)
    }

    // Create a SIGNED admin session token (HMAC over ADMIN_SECRET_KEY).
    const adminSession: AdminSession = {
      id: (adminUser as any).id,
      email: (adminUser as any).email,
      name: (adminUser as any).name,
      role: (adminUser as any).role,
      loginTime: Date.now()
    }
    const adminSessionToken = await signAdminSession(adminSession)

    revalidatePath('/', 'layout')

    const response = NextResponse.json({
      success: true,
      message: 'Admin login successful',
      user: {
        id: (adminUser as any).id,
        email: (adminUser as any).email,
        name: (adminUser as any).name,
        role: (adminUser as any).role,
        isAdmin: true
      }
    })

    // Set signed admin session cookie
    response.cookies.set(ADMIN_SESSION_COOKIE, adminSessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/' // Ensure cookie is available for all paths
    })

    return response

  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}