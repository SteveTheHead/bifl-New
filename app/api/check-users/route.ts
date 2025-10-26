import { createClient } from '@/utils/supabase/server'

export async function GET() {
  const supabase = await createClient()

  // Check Supabase Auth users
  const { data: { users }, error } = await supabase.auth.admin.listUsers()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({
    count: users?.length || 0,
    users: users?.map(u => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      email_confirmed_at: u.email_confirmed_at
    }))
  })
}
