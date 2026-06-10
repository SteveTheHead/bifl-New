const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function auditByCategory() {
  // Get all categories with their parent info
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id')
    .order('name');

  // Get all published products
  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug, category_id, brands(name)')
    .eq('status', 'published')
    .order('name');

  // Build category hierarchy
  const catMap = new Map(categories.map(c => [c.id, c]));

  // Group products by category
  const productsByCategory = {};
  products.forEach(p => {
    const cat = catMap.get(p.category_id);
    const catName = cat?.name || 'UNCATEGORIZED';
    const catSlug = cat?.slug || 'none';
    const parent = cat?.parent_id ? catMap.get(cat.parent_id)?.name : null;
    const key = parent ? `${parent} > ${catName}` : catName;

    if (!productsByCategory[key]) {
      productsByCategory[key] = { slug: catSlug, products: [] };
    }
    productsByCategory[key].products.push({
      name: p.name,
      brand: p.brands?.name || 'Unknown'
    });
  });

  // Print each category with its products
  const sortedCategories = Object.keys(productsByCategory).sort();

  for (const catName of sortedCategories) {
    const { slug, products } = productsByCategory[catName];
    console.log(`\n=== ${catName} (/categories/${slug}) - ${products.length} products ===`);
    products.forEach(p => {
      console.log(`  • ${p.brand} - ${p.name}`);
    });
  }
}

auditByCategory().catch(console.error);
