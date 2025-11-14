import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Use service role key to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { id: categoryId } = await params

    const { data: category, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single()

    if (error) {
      // Handle PGRST116 error (no rows returned) gracefully
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        )
      }
      throw error
    }

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()

    // Use service role key to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { id: categoryId } = await params


    // Validate slug - remove invalid characters
    const cleanSlug = body.slug.replace(/[^\w-]/g, '-').replace(/--+/g, '-').replace(/^-+|-+$/g, '')

    // First check if category exists
    const { data: existingCategory, error: fetchError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single()

    if (fetchError) {
      // Handle PGRST116 error (no rows returned) gracefully
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to fetch category' },
        { status: 500 }
      )
    }

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Check if slug is already in use by another category
    if (cleanSlug !== existingCategory.slug) {
      const { data: existingSlug, error: slugError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', cleanSlug)
        .neq('id', categoryId)
        .maybeSingle()


      if (existingSlug) {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 400 }
        )
      }
    }

    const updateData = {
      name: body.name,
      slug: cleanSlug,
      description: body.description || null,
      display_order: body.display_order,
      is_featured: body.is_featured,
      show_buying_guide: body.show_buying_guide ?? false,
      updated_at: new Date().toISOString()
    }

    const { data: updatedCategories, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', categoryId)
      .select()


    if (error) {
      console.error('Update error details:', error)
      throw error
    }

    // If no rows were updated but there's no error, it means the data was already correct
    if (!updatedCategories || updatedCategories.length === 0) {
      return NextResponse.json({ category: existingCategory })
    }

    return NextResponse.json({ category: updatedCategories[0] })
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Use service role key to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { id: categoryId } = await params

    // Check if category has products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id')
      .eq('category_id', categoryId)
      .limit(1)

    if (productsError) throw productsError

    if (products && products.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with associated products' },
        { status: 400 }
      )
    }


    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)


    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}