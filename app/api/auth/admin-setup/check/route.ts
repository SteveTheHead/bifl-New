import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Check if any admin accounts exist
    const { data: existingAdmins, error } = await supabase
      .from('admin_users')
      .select('id')
      .limit(1)

    // If error (like table doesn't exist), allow setup
    if (error) {
      return NextResponse.json({ allowed: true })
    }

    // If admins exist, block setup
    if (existingAdmins && existingAdmins.length > 0) {
      return NextResponse.json({ allowed: false })
    }

    // No admins exist, allow setup
    return NextResponse.json({ allowed: true })
  } catch (error) {
    console.error('Error checking admin setup status:', error)
    // In case of error, allow setup (fail open for initial setup)
    return NextResponse.json({ allowed: true })
  }
}
