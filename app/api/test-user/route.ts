import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
    }

    // Create a test user for reviews
    const result = await auth.api.signUpEmail({
      body: {
        email: 'testuser@bifl.dev',
        password: 'TestUser123!',
        name: 'Test User'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Test user created successfully',
      credentials: {
        email: 'testuser@bifl.dev',
        password: 'TestUser123!'
      },
      user: result
    })

  } catch (error: any) {
    console.error('Error creating test user:', error)

    // If user already exists, just return the credentials
    if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
      return NextResponse.json({
        success: true,
        message: 'Test user already exists',
        credentials: {
          email: 'testuser@bifl.dev',
          password: 'TestUser123!'
        }
      })
    }

    return NextResponse.json({
      error: 'Failed to create test user',
      details: error.message
    }, { status: 500 })
  }
}