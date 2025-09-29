import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(_request: NextRequest) {
  try {
    const supabase = await createClient()

    // Create the admin_users table manually
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS admin_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name VARCHAR(255) DEFAULT 'Admin User',
        role VARCHAR(50) DEFAULT 'admin',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_login TIMESTAMP WITH TIME ZONE
      );

      CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
      CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);
    `

    console.log('Attempting to create admin_users table...')

    // Try to execute the SQL directly
    const { data, error } = await supabase.rpc('exec_sql', { sql: createTableQuery })

    if (error) {
      console.error('RPC exec_sql failed:', error)

      // Try alternative approach: use raw query
      const { error: queryError } = await supabase
        .from('admin_users')
        .select('*')
        .limit(0)

      if (queryError && queryError.code === 'PGRST205') {
        return NextResponse.json({
          error: 'Table creation failed',
          message: 'Please create the admin_users table manually in your Supabase dashboard',
          sql: createTableQuery.trim()
        }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'admin_users table ready',
      data
    })

  } catch (error) {
    console.error('Table creation error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}