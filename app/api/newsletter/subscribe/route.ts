import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    // Validation
    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if email already exists and is subscribed
    const { data: existing } = await (supabase as any)
      .from('newsletter_subscribers')
      .select('id, subscribed')
      .eq('email', email)
      .single()

    if (existing) {
      if ((existing as any).subscribed) {
        return NextResponse.json(
          { message: 'This email is already subscribed!' },
          { status: 400 }
        )
      } else {
        // Resubscribe previously unsubscribed user
        const { error: updateError } = await (supabase as any)
          .from('newsletter_subscribers')
          .update({
            subscribed: true,
            subscribed_at: new Date().toISOString(),
            unsubscribed_at: null
          })
          .eq('email', email)

        if (updateError) {
          console.error('Error resubscribing:', updateError)
          return NextResponse.json(
            { message: 'Failed to subscribe. Please try again.' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          message: 'Successfully resubscribed!'
        })
      }
    }

    // Insert new subscriber
    const { data, error } = await (supabase as any)
      .from('newsletter_subscribers')
      .insert({
        email: email.toLowerCase().trim(),
        subscribed: true,
        subscribed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error subscribing to newsletter:', error)
      return NextResponse.json(
        { message: 'Failed to subscribe. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Successfully subscribed!',
      data
    })
  } catch (error) {
    console.error('Error in newsletter subscribe:', error)
    return NextResponse.json(
      { message: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
