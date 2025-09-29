import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Setup only available in development' },
      { status: 403 }
    )
  }

  try {
    // Use service role key for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Create development admin user
    const { error } = await supabase.auth.admin.createUser({
      email: process.env.DEV_ADMIN_EMAIL || 'admin@bifl.dev',
      password: process.env.DEV_ADMIN_PASSWORD || 'BiflAdmin123!',
      email_confirm: true,
      user_metadata: {
        name: 'BIFL Admin',
        role: 'admin'
      }
    })

    if (error) {
      console.error('Error creating admin user:', error)
      return NextResponse.json(
        { error: 'Failed to create admin user', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Development admin user created successfully',
      email: process.env.DEV_ADMIN_EMAIL || 'admin@bifl.dev',
      note: 'You can now sign in with this account to access the admin dashboard'
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Setup failed' },
      { status: 500 }
    )
  }
}