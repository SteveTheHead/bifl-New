import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/db/drizzle'
import { user as userTable } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    // Check authentication with Better Auth
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const userId = session.user.id

    // Create admin client for storage operations
    const adminSupabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )


    const formData = await request.formData()
    const file = formData.get('avatar') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }


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
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`


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


    // Get public URL using admin client
    const { data: urlData } = adminSupabase.storage
      .from('user-uploads')
      .getPublicUrl(filePath)

    const avatarUrl = urlData.publicUrl

    // Update user's image field in Better Auth database
    try {
      await db
        .update(userTable)
        .set({ image: avatarUrl })
        .where(eq(userTable.id, userId))
    } catch (updateError) {
      console.error('Update user image error:', updateError)
      return NextResponse.json({
        error: 'Failed to update user avatar'
      }, { status: 500 })
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
    // Check authentication with Better Auth
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const userId = session.user.id

    // Remove avatar URL from user
    try {
      await db
        .update(userTable)
        .set({ image: null })
        .where(eq(userTable.id, userId))
    } catch (updateError) {
      console.error('Update user error:', updateError)
      return NextResponse.json({
        error: 'Failed to remove avatar'
      }, { status: 500 })
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