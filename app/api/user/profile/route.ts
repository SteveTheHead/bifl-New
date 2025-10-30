import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/db/drizzle'
import { user as userTable } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(request: Request) {
  try {
    // Check authentication with Better Auth
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const userId = session.user.id
    const { name } = await request.json()

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Update user name in Better Auth database
    try {
      await db
        .update(userTable)
        .set({ name: name.trim() })
        .where(eq(userTable.id, userId))
    } catch (updateError) {
      console.error('Update user error:', updateError)
      return NextResponse.json({
        error: 'Failed to update profile'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}
