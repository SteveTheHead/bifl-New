import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
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
    const supabase = await createClient()

    console.log('Updating product:', id, 'with data:', Object.keys(body))

    const { data, error } = await supabase
      .from('products')
      .update(body)
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
    const supabase = await createClient()

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