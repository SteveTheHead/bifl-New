import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = createAdminClient()


    // Check if table already exists
    const { data: existingTable } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'user_profiles')
      .eq('table_schema', 'public')
      .single()

    if (existingTable) {
      return NextResponse.json({
        success: true,
        message: 'User profiles table already exists'
      })
    }

    // Create user_profiles table using a simple insert approach
    // First try to insert a test record to see if table exists
    const { error: testError } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1)

    if (testError && testError.code === '42P01') {
      // Table doesn't exist, we need to create it manually
      // For now, let's use the auth metadata approach and document the table structure

      return NextResponse.json({
        success: false,
        message: 'user_profiles table needs to be created manually in Supabase',
        sql: `
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  avatar_url TEXT,
  display_name TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id)
);

CREATE INDEX user_profiles_user_id_idx ON user_profiles(user_id);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all profiles" ON user_profiles
  FOR ALL USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');
        `
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'User profiles table exists and ready to use'
    })

  } catch (error) {
    console.error('User profiles setup error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}