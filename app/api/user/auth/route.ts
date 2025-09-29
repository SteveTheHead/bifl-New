import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  let response = NextResponse.json({})

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.json({})
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  try {
    const { action, email, password, name } = await request.json()

    if (action === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400, headers: response.headers })
      }

      // Check if we already have a session from signup (email confirmation disabled)
      if (data.session && data.user) {
        // User is already signed in after signup
        response = NextResponse.json({
          success: true,
          user: data.user,
          session: data.session,
          message: 'Account created and signed in successfully'
        })
        return response
      }

      // If no session, try auto-signin (for cases where email confirmation is enabled)
      if (data.user) {
        try {
          // Sign in immediately after signup
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
          })

          if (signInError) {
            console.error('Auto-signin failed:', signInError)
            // Return successful signup even if auto-signin fails
            return NextResponse.json({
              success: true,
              user: data.user,
              message: 'Account created successfully. Please check your email to confirm your account, then sign in.'
            })
          }

          // Return the signed-in user with session
          response = NextResponse.json({
            success: true,
            user: signInData.user,
            session: signInData.session,
            message: 'Account created and signed in successfully'
          })
          return response

        } catch (autoSigninError) {
          console.error('Auto-signin error:', autoSigninError)
          return NextResponse.json({
            success: true,
            user: data.user,
            message: 'Account created successfully. Please check your email to confirm your account, then sign in.'
          })
        }
      }

      response = NextResponse.json({
        success: true,
        user: data.user,
        session: data.session,
        message: 'Account created successfully'
      })
      return response
    }

    if (action === 'signin') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400, headers: response.headers })
      }

      response = NextResponse.json({
        success: true,
        user: data.user,
        session: data.session
      })
      return response
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400, headers: response.headers })

  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: response.headers })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.error('Auth error:', error)
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Auth catch error:', error)
    return NextResponse.json({ user: null })
  }
}