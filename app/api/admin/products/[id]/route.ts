import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { Database } from '@/lib/supabase/types'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createAdminClient()

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      // Handle PGRST116 error (no rows returned) gracefully
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const supabase = createAdminClient()


    // Type assertion needed due to admin client limitations with typed mutations
    const updateData = body as Database['public']['Tables']['products']['Update']
    const { data, error} = await (supabase
      .from('products')
      .update as any)(updateData)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.json({
        message: error.message,
        details: error.details,
        hint: error.hint
      }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        message: 'Product not found'
      }, { status: 404 })
    }

    return NextResponse.json({ product: data[0] })
  } catch (error) {
    console.error('PUT error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ message: errorMessage }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase delete error:', error)
      return NextResponse.json({
        message: error.message,
        details: error.details,
        hint: error.hint
      }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ message: errorMessage }, { status: 500 })
  }
}