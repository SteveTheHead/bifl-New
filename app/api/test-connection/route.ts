import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Test basic connection
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug')
      .limit(5)

    if (error) {
      console.error('Supabase connection error:', error)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          details: error
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful!',
      data: {
        categories: data,
        connectionTest: 'passed'
      }
    })
  } catch (err) {
    console.error('Connection test failed:', err)
    return NextResponse.json(
      {
        success: false,
        error: 'Connection test failed',
        details: err instanceof Error ? err.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}