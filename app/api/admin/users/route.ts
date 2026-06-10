import { NextResponse } from 'next/server'
import { db } from '@/db/drizzle'
import { user } from '@/db/schema'
import { desc } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth/admin'

export async function GET() {
  try {
    const unauthorized = await requireAdmin()
    if (unauthorized) return unauthorized

    // Fetch all users from Better Auth database
    const users = await db
      .select({
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .orderBy(desc(user.createdAt))

    return NextResponse.json({
      users,
      total: users.length
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
