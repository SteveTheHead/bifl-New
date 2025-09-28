import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Fetch recently viewed products for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('userEmail')

    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if user_recently_viewed table exists, create if not
    await supabase.rpc('create_recently_viewed_table_if_not_exists').catch(() => {
      // Ignore error if function doesn't exist
    })

    // Get recently viewed products
    const { data: recentlyViewed, error } = await supabase
      .from('user_recently_viewed')
      .select(`
        product_id,
        viewed_at,
        products:product_id (
          id,
          name,
          price,
          featured_image_url,
          bifl_total_score,
          durability_score,
          repairability_score,
          warranty_score,
          sustainability_score,
          social_score,
          brand_id,
          category_id,
          created_at,
          brands(name)
        )
      `)
      .eq('user_email', userEmail)
      .order('viewed_at', { ascending: false })
      .limit(10)

    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist
      console.error('Error fetching recently viewed products:', error)
      return NextResponse.json({ error: 'Failed to fetch recently viewed products' }, { status: 500 })
    }

    // Format the response
    const products = recentlyViewed?.map(item => ({
      ...item.products,
      brand_name: item.products?.brands?.name || null,
      viewed_at: item.viewed_at
    })) || []

    return NextResponse.json({
      products: products.filter(p => p.id) // Filter out null products
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Add a product to recently viewed
export async function POST(request: NextRequest) {
  try {
    const { userEmail, productId } = await request.json()

    if (!userEmail || !productId) {
      return NextResponse.json({ error: 'User email and product ID required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Create table if it doesn't exist
    await createRecentlyViewedTable(supabase)

    // Check if this product is already in recently viewed for this user
    const { data: existing } = await supabase
      .from('user_recently_viewed')
      .select('id')
      .eq('user_email', userEmail)
      .eq('product_id', productId)
      .single()

    if (existing) {
      // Update the viewed_at timestamp
      const { error } = await supabase
        .from('user_recently_viewed')
        .update({ viewed_at: new Date().toISOString() })
        .eq('user_email', userEmail)
        .eq('product_id', productId)

      if (error) {
        console.error('Error updating recently viewed:', error)
        return NextResponse.json({ error: 'Failed to update recently viewed' }, { status: 500 })
      }
    } else {
      // Insert new record
      const { error } = await supabase
        .from('user_recently_viewed')
        .insert({
          user_email: userEmail,
          product_id: productId,
          viewed_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error adding to recently viewed:', error)
        return NextResponse.json({ error: 'Failed to add to recently viewed' }, { status: 500 })
      }

      // Clean up old entries (keep only last 20 for each user)
      const { data: allViews } = await supabase
        .from('user_recently_viewed')
        .select('id')
        .eq('user_email', userEmail)
        .order('viewed_at', { ascending: false })

      if (allViews && allViews.length > 20) {
        const idsToDelete = allViews.slice(20).map(item => item.id)
        await supabase
          .from('user_recently_viewed')
          .delete()
          .in('id', idsToDelete)
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function createRecentlyViewedTable(supabase: any) {
  try {
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_recently_viewed (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_email TEXT NOT NULL,
          product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          viewed_at TIMESTAMPTZ DEFAULT now(),
          UNIQUE(user_email, product_id)
        );

        CREATE INDEX IF NOT EXISTS idx_user_recently_viewed_user_email ON user_recently_viewed(user_email);
        CREATE INDEX IF NOT EXISTS idx_user_recently_viewed_viewed_at ON user_recently_viewed(viewed_at);
      `
    })

    if (error) {
      console.error('Error creating recently viewed table:', error)
    }
  } catch (error) {
    console.error('Error in createRecentlyViewedTable:', error)
  }
}