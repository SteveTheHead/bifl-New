import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkView() {
  console.log('Checking products_with_taxonomy view...\n')

  // Check if bifl_certification exists in the view
  const { data: sampleProduct, error } = await supabase
    .from('products_with_taxonomy')
    .select('bifl_certification')
    .limit(1)

  if (error) {
    console.error('❌ Error checking view:', error.message)
    console.log('\nThe products_with_taxonomy view needs to be updated to include bifl_certification')

    console.log('\nRun this SQL to update the view:')
    console.log(`
-- Drop the existing view
DROP VIEW IF EXISTS products_with_taxonomy;

-- Recreate the view with bifl_certification included
CREATE OR REPLACE VIEW products_with_taxonomy AS
SELECT
  p.*,
  b.name as brand_name,
  b.slug as brand_slug,
  c.name as category_name,
  c.slug as category_slug
FROM products p
LEFT JOIN brands b ON p.brand_id = b.id
LEFT JOIN categories c ON p.category_id = c.id;
    `)
  } else {
    console.log('✅ bifl_certification field is available in products_with_taxonomy view')

    // Check if we have any products with certifications
    const { data: certsData, error: certsError } = await supabase
      .from('products_with_taxonomy')
      .select('name, bifl_certification')
      .not('bifl_certification', 'is', null)
      .limit(5)

    if (!certsError && certsData) {
      console.log(`\n📊 Found ${certsData.length} products with certifications in the view:`)
      certsData.forEach(product => {
        console.log(`   - ${product.name}: ${product.bifl_certification}`)
      })
    }
  }
}

checkView()
  .then(() => process.exit(0))
  .catch(console.error)