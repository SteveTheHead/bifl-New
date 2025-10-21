import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkView() {
  // Get all published products from the view
  const { data: viewData, error: viewError } = await supabase
    .from('products_with_taxonomy')
    .select('id, name, brand_name, category_name')
    .eq('status', 'published')

  console.log('Products in products_with_taxonomy view (published):', viewData?.length || 0)

  if (viewError) {
    console.error('View error:', viewError)
  }

  // Get all products from main table
  const { data: tableData, error: tableError } = await supabase
    .from('products')
    .select('id, name, brand_id, category_id, status')
    .eq('status', 'published')

  console.log('Products in products table (published):', tableData?.length || 0)

  if (tableError) {
    console.error('Table error:', tableError)
  }

  // Find products in table but not in view
  if (viewData && tableData) {
    const viewIds = new Set(viewData.map(p => p.id))
    const missingFromView = tableData.filter(p => !viewIds.has(p.id))

    console.log('\nProducts in table but not in view:', missingFromView.length)

    if (missingFromView.length > 0) {
      console.log('\nMissing products:')
      missingFromView.forEach(p => {
        console.log(`  - ${p.name} (brand_id: ${p.brand_id}, category_id: ${p.category_id})`)
      })
    }
  }
}

checkView()
