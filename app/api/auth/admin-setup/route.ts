import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { PasswordUtils } from '@/lib/auth/password'
import { sb } from '@/lib/supabase-utils'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Validate password
    const passwordValidation = PasswordUtils.validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.message }, { status: 400 })
    }

    const supabase = await createClient()

    // First, ensure the admin_users table exists
    try {
      const { error: tableCheckError } = await supabase
        .from('admin_users')
        .select('id')
        .limit(1)

      if (tableCheckError && (tableCheckError.code === 'PGRST116' || tableCheckError.code === 'PGRST205')) {
        // Table doesn't exist, create it using the SQL editor approach
        const { error: createError } = await sb.rpc(supabase, 'create_admin_users_table_if_not_exists')

        if (createError) {
          console.error('Error creating admin_users table via RPC:', createError)

          // Fallback: Try using simple SQL execution
          try {
            // Create admin_users table directly
            await sb.insert(supabase, '_admin_setup', [{
              setup_complete: true,
              created_at: new Date().toISOString()
            }])
          } catch (fallbackError) {
            console.error('Fallback table creation failed:', fallbackError)
            return NextResponse.json({
              error: 'Database setup required. Please create the admin_users table manually or contact support.',
              details: 'admin_users table not found'
            }, { status: 503 })
          }
        }
      }
    } catch (tableError) {
      console.error('Table check error:', tableError)
      return NextResponse.json({
        error: 'Database connectivity issue. Please try again later.',
        details: tableError instanceof Error ? tableError.message : 'Unknown error'
      }, { status: 503 })
    }

    // Check if admin already exists
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existingAdmin) {
      return NextResponse.json({ error: 'An admin account with this email already exists' }, { status: 409 })
    }

    // Hash the password
    const passwordHash = await PasswordUtils.hash(password)

    // Create the admin user in our custom table
    const { data: adminUsers, error: insertError } = await sb.insert(supabase, 'admin_users', [{
      email: email.toLowerCase(),
      password_hash: passwordHash,
      name: 'Admin User',
      role: 'admin',
      is_active: true
    }])

    const adminUser = adminUsers?.[0]

    if (insertError || !adminUser) {
      console.error('Error creating admin user:', insertError)
      return NextResponse.json({
        error: 'Failed to create admin account',
        details: insertError?.message || 'User creation failed'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Admin account created successfully',
      user: {
        id: (adminUser as any).id,
        email: (adminUser as any).email,
        name: (adminUser as any).name,
        role: (adminUser as any).role
      }
    })

  } catch (error) {
    console.error('Admin setup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}