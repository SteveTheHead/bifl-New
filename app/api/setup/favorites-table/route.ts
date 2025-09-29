import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { sb } from '@/lib/supabase-utils'

export async function POST() {
  try {
    const supabase = await createClient()

    // For development - allow table creation without auth
    // In production, you'd want to use migrations instead

    // Create the user_favorites table
    const { error } = await sb.rpc(supabase, 'exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_favorites (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_email TEXT NOT NULL,
          product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ DEFAULT now(),
          UNIQUE(user_email, product_id)
        );

        CREATE INDEX IF NOT EXISTS idx_user_favorites_user_email ON user_favorites(user_email);
        CREATE INDEX IF NOT EXISTS idx_user_favorites_product_id ON user_favorites(product_id);
      `
    })

    if (error) {
      console.error('Error creating favorites table:', error)
      return NextResponse.json({
        error: 'Failed to create table',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Favorites table created successfully'
    })

  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}