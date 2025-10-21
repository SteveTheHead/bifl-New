import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createAdminClient()

    // Create the newsletter_subscribers table using raw SQL
    const createTableSQL = `
      -- Create newsletter_subscribers table
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        subscribed BOOLEAN DEFAULT true,
        subscribed_at TIMESTAMPTZ DEFAULT NOW(),
        unsubscribed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Create index on email for faster lookups
      CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);

      -- Create index on subscribed status
      CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_subscribed ON newsletter_subscribers(subscribed);
    `

    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: createTableSQL
    })

    if (createError) {
      console.error('Error creating table:', createError)

      // Try alternative approach - direct table creation
      const { error: altError } = await (supabase as any)
        .from('newsletter_subscribers')
        .select('id')
        .limit(1)

      if (altError && altError.code === '42P01') {
        // Table doesn't exist, need to create it manually in Supabase dashboard
        return NextResponse.json({
          success: false,
          message: 'Please create the newsletter_subscribers table manually in Supabase',
          sql: createTableSQL
        }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Newsletter subscribers table setup complete'
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to setup newsletter table',
      error: String(error)
    }, { status: 500 })
  }
}
