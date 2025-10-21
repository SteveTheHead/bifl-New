import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { message: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim()

    const supabase = await createClient()

    // Check if email already exists
    const { data: existingSubscriber, error: checkError } = await supabase
      .from('newsletter_subscribers')
      .select('id, subscribed')
      .eq('email', normalizedEmail)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is fine
      console.error('Error checking subscriber:', checkError)
      return NextResponse.json(
        { message: 'Failed to process subscription' },
        { status: 500 }
      )
    }

    if (existingSubscriber) {
      if (existingSubscriber.subscribed) {
        return NextResponse.json(
          { message: 'This email is already subscribed' },
          { status: 400 }
        )
      } else {
        // Resubscribe
        const { error: updateError } = await supabase
          .from('newsletter_subscribers')
          .update({ subscribed: true, updated_at: new Date().toISOString() })
          .eq('id', existingSubscriber.id)

        if (updateError) {
          console.error('Error resubscribing:', updateError)
          return NextResponse.json(
            { message: 'Failed to resubscribe' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          message: 'Successfully resubscribed to newsletter'
        })
      }
    }

    // Insert new subscriber
    const { error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email: normalizedEmail,
        subscribed: true,
        subscribed_at: new Date().toISOString(),
      })

    if (insertError) {
      console.error('Error inserting subscriber:', insertError)
      return NextResponse.json(
        { message: 'Failed to subscribe. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Successfully subscribed to newsletter'
    })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
