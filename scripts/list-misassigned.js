const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function listMisassigned() {
  // Categories with known issues
  const problemCategories = [
    'cables-chargers',      // has camera items
    'eyewear-footwear',     // has grooming items
    'cleaning-tools-home',  // has hair clippers
    'maintenance-repair-kits-hardware', // has nose trimmer
    'radios-emergency-gear', // has grooming + health items
    'knives-cutting-boards-home', // has shears + garbage disposal
    'survival-gear',        // has slippers + goggles
    'wallets'               // has pens + keychains
  ];

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .in('slug', problemCategories);

  const catMap = new Map(categories.map(c => [c.slug, c]));

  for (const slug of problemCategories) {
    const cat = catMap.get(slug);
    if (!cat) continue;

    const { data: products } = await supabase
      .from('products')
      .select('id, name, brands(name)')
      .eq('category_id', cat.id)
      .eq('status', 'published')
      .order('name');

    console.log(`\n=== ${cat.name} (slug: ${slug}) ===`);
    products.forEach(p => {
      console.log(`  '${p.id}', // ${p.brands?.name || 'Unknown'} - ${p.name}`);
    });
  }
}

listMisassigned().catch(console.error);
