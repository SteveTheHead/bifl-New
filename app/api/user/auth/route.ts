import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

// This endpoint checks if the user is authenticated using Better Auth
export async function GET(request: NextRequest) {
  try {
    console.log('🔐 API /user/auth: Checking session...')

    // Get session from Better Auth
    const session = await auth.api.getSession({
      headers: await headers()
    })

    console.log('📦 API /user/auth: Session result:', session ? {
      userId: session.user.id,
      email: session.user.email,
      hasSession: true
    } : { hasSession: false })

    if (!session) {
      console.log('❌ API /user/auth: No session found')
      return NextResponse.json({ user: null })
    }

    console.log('✅ API /user/auth: Returning user data for:', session.user.email)

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
    console.error('💥 API /user/auth: Error checking session:', error)
    return NextResponse.json({ user: null })
  }
}