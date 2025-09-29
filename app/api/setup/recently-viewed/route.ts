import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { sb } from '@/lib/supabase-utils'

export async function POST() {
  try {
    const supabase = await createClient()

    // Create the user_recently_viewed table
    const { error } = await sb.rpc(supabase, 'exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_recently_viewed (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_email TEXT NOT NULL,
          product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          viewed_at TIMESTAMPTZ DEFAULT now(),
          UNIQUE(user_email, product_id)
        );

        CREATE INDEX IF NOT EXISTS idx_user_recently_viewed_user_email ON user_recently_viewed(user_email);
        CREATE INDEX IF NOT EXISTS idx_user_recently_viewed_viewed_at ON user_recently_viewed(viewed_at);
      `
    })

    if (error) {
      console.error('Error creating table:', error)
      return NextResponse.json({
        error: 'Failed to create table. Please create it manually using the SQL from create_recently_viewed_table.sql',
        details: error
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'user_recently_viewed table created successfully'
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({
      error: 'Failed to create table. Please create it manually using the SQL from create_recently_viewed_table.sql',
      details: error
    }, { status: 500 })
  }
}