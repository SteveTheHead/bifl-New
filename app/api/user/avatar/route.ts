import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // For demo purposes, if no Supabase user, use constant demo user ID
    let userId = user?.id
    if (authError || !user) {
      // Check for admin session as fallback
      const cookieStore = await cookies()
      const adminSession = cookieStore.get('admin-session')

      if (adminSession?.value === 'admin-authenticated') {
        userId = 'demo-admin-user'
        console.log('Avatar upload request for admin user (demo):', userId)
      } else {
        // Use constant demo user ID for everyone
        userId = 'demo-user'
        console.log('Avatar upload request for demo user:', userId)
      }
    } else {
      console.log('Avatar upload request for authenticated user:', user.id)
    }

    const formData = await request.formData()
    const file = formData.get('avatar') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('File received:', file.name, file.type, file.size)

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        error: 'Invalid file type. Please upload JPEG, PNG, or WebP images.'
      }, { status: 400 })
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({
        error: 'File too large. Please upload an image smaller than 5MB.'
      }, { status: 400 })
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    console.log('Uploading file to:', filePath)

    // Upload to Supabase Storage using admin client
    const { data: uploadData, error: uploadError } = await adminSupabase.storage
      .from('user-uploads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({
        error: 'Failed to upload avatar',
        details: uploadError.message
      }, { status: 500 })
    }

    console.log('Upload successful:', uploadData)

    // Get public URL using admin client
    const { data: urlData } = adminSupabase.storage
      .from('user-uploads')
      .getPublicUrl(filePath)

    const avatarUrl = urlData.publicUrl
    console.log('Generated public URL:', avatarUrl)

    // Try to update user metadata with avatar URL (only if we have a real Supabase user)
    if (user) {
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: avatarUrl
        }
      })

      if (updateError) {
        console.error('Update user metadata error:', updateError)
        console.log('Warning: Avatar uploaded successfully but user metadata update failed')
      } else {
        console.log('User metadata updated successfully')
      }
    } else {
      console.log('Skipping user metadata update (demo user)')
    }

    // For demo users, also store in demo avatar system
    if (!user) {
      try {
        // Forward the cookies to maintain the same session
        const cookieHeader = request.headers.get('cookie') || ''
        await fetch(`${request.nextUrl.origin}/api/user/demo-avatar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'cookie': cookieHeader
          },
          body: JSON.stringify({ avatarUrl })
        })
      } catch (error) {
        console.error('Failed to update demo avatar:', error)
      }
    }

    return NextResponse.json({
      success: true,
      avatar_url: avatarUrl,
      message: 'Avatar updated successfully'
    })

  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // For demo purposes, allow deletion even without Supabase auth
    if (authError || !user) {
      const cookieStore = await cookies()
      const adminSession = cookieStore.get('admin-session')

      if (!adminSession || adminSession.value !== 'admin-authenticated') {
        // For demo, proceed anyway
        console.log('Avatar removal request for demo user')
      }
    }

    // Remove avatar URL from user metadata (only if we have a real user)
    if (user) {
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: null
        }
      })

      if (updateError) {
        console.error('Update user error:', updateError)
        return NextResponse.json({
          error: 'Failed to remove avatar'
        }, { status: 500 })
      }
    } else {
      console.log('Skipping user metadata removal (demo user)')
    }

    // Note: We're not deleting the file from storage to prevent broken links
    // in case the user wants to restore it later. In a production app,
    // you might want to implement a cleanup job for orphaned files.

    return NextResponse.json({
      success: true,
      message: 'Avatar removed successfully'
    })

  } catch (error) {
    console.error('Avatar removal error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}