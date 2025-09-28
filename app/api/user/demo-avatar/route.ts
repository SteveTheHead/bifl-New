import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

// Simple file-based storage for demo avatar URLs
// In production, this would be in a database
const DEMO_AVATARS_FILE = join(process.cwd(), '.demo-avatars.json')

function loadDemoAvatars(): Map<string, string> {
  try {
    if (existsSync(DEMO_AVATARS_FILE)) {
      const data = readFileSync(DEMO_AVATARS_FILE, 'utf8')
      const obj = JSON.parse(data)
      return new Map(Object.entries(obj))
    }
  } catch (error) {
    console.error('Error loading demo avatars:', error)
  }
  return new Map()
}

function saveDemoAvatars(avatars: Map<string, string>) {
  try {
    const obj = Object.fromEntries(avatars)
    writeFileSync(DEMO_AVATARS_FILE, JSON.stringify(obj, null, 2))
  } catch (error) {
    console.error('Error saving demo avatars:', error)
  }
}

export async function GET() {
  try {
    // Use a constant demo user ID for everyone
    const demoUserId = 'demo-user'

    // Load avatars from file
    const demoAvatars = loadDemoAvatars()
    const avatarUrl = demoAvatars.get(demoUserId) || null

    console.log('Demo avatar GET:', { demoUserId, avatarUrl, stored: demoAvatars.size })

    return NextResponse.json({
      demoUserId,
      avatarUrl,
      user: {
        id: demoUserId,
        email: 'demo@bifl.dev',
        user_metadata: {
          name: 'Demo User',
          avatar_url: avatarUrl
        }
      }
    })
  } catch (error) {
    console.error('Demo avatar get error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { avatarUrl } = await request.json()

    // Use the same constant demo user ID for everyone
    const demoUserId = 'demo-user'

    // Load current avatars from file
    const demoAvatars = loadDemoAvatars()

    // Store the avatar URL for this demo user
    if (avatarUrl) {
      demoAvatars.set(demoUserId, avatarUrl)
      console.log('Demo avatar stored:', { demoUserId, avatarUrl, totalStored: demoAvatars.size })
    } else {
      demoAvatars.delete(demoUserId)
      console.log('Demo avatar removed:', { demoUserId, totalStored: demoAvatars.size })
    }

    // Save updated avatars to file
    saveDemoAvatars(demoAvatars)

    return NextResponse.json({
      success: true,
      demoUserId,
      avatarUrl: avatarUrl || null
    })
  } catch (error) {
    console.error('Demo avatar update error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}