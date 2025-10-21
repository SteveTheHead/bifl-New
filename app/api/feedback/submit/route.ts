import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { feedback_type, subject, details, contact_name, contact_email } = body

    // Validation
    if (!feedback_type || !subject || !details) {
      return NextResponse.json(
        { message: 'Please provide feedback type, subject, and details' },
        { status: 400 }
      )
    }

    // Validate feedback_type
    const validTypes = ['website_bug', 'product_suggestion', 'data_correction', 'general_idea']
    if (!validTypes.includes(feedback_type)) {
      return NextResponse.json(
        { message: 'Invalid feedback type' },
        { status: 400 }
      )
    }

    // Validate email format if provided
    if (contact_email && !contact_email.includes('@')) {
      return NextResponse.json(
        { message: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Insert feedback
    const { data, error: insertError } = await supabase
      .from('feedback')
      .insert({
        feedback_type,
        subject: subject.trim(),
        details: details.trim(),
        contact_name: contact_name ? contact_name.trim() : null,
        contact_email: contact_email ? contact_email.toLowerCase().trim() : null,
        status: 'new',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting feedback:', insertError)
      return NextResponse.json(
        { message: 'Failed to submit feedback. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Feedback submitted successfully',
      data,
    })
  } catch (error) {
    console.error('Feedback submission error:', error)
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
