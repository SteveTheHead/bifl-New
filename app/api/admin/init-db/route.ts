import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Create admin_users table
    const { error: tableError } = await supabase.rpc('create_admin_users_table')

    if (tableError) {
      console.error('Error creating admin_users table:', tableError)
      // Try manual SQL execution
      const { error: sqlError } = await supabase
        .from('admin_users')
        .select('id')
        .limit(1)

      if (sqlError && sqlError.code === 'PGRST116') {
        // Table doesn't exist, create it manually
        const createTableSQL = `
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

        // Execute raw SQL
        const { error: rawSqlError } = await supabase.rpc('exec_sql', { sql: createTableSQL })

        if (rawSqlError) {
          return NextResponse.json({
            error: 'Failed to create admin_users table',
            details: rawSqlError.message
          }, { status: 500 })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Admin database initialized successfully'
    })

  } catch (error) {
    console.error('Admin DB init error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}