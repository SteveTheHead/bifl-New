import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { PasswordUtils } from '@/lib/auth/password'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const supabase = await createClient()

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

    // Create admin session token (you can implement JWT or use simple session storage)
    const adminSession = {
      id: (adminUser as any).id,
      email: (adminUser as any).email,
      name: (adminUser as any).name,
      role: (adminUser as any).role,
      loginTime: Date.now()
    }

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

    // Set admin session cookie
    response.cookies.set('admin-session', JSON.stringify(adminSession), {
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