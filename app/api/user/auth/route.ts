import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

// This endpoint checks if the user is authenticated using Better Auth
export async function GET(request: NextRequest) {
  try {
    // Get session from Better Auth
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return NextResponse.json({ user: null })
    }

    // Return user data from the session
    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        emailVerified: session.user.emailVerified,
        image: session.user.image,
        createdAt: session.user.createdAt,
        user_metadata: {
          name: session.user.name,
          avatar_url: session.user.image
        }
      }
    })
  } catch (error) {
    console.error('Error checking session:', error)
    return NextResponse.json({ user: null })
  }
}