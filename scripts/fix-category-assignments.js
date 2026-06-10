const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Category IDs
const CATEGORIES = {
  // Existing
  'cameras-accessories': '7ad50fb6-4005-474f-9c16-d4b3c0704b7e',
  'footwear-accessories': '44444444-4444-4444-4444-444444444444',
  'boots': '93be29e6-403a-443e-9263-476d881ea2ba',
  'sandals': 'eadd0a8c-78cc-47cb-b73f-71072fc11957',
  'home-kitchen': '55555555-5555-5555-5555-555555555555',
  'furniture-home': 'bafc3855-6d0c-4b77-83ff-2668e5771641',
  'office-equipment': '6037e1d5-de91-47c5-be50-f3e19d361629',
  'travel-everyday-carry': '88888888-8888-8888-8888-888888888888',
  'hand-tools': '8923a7f1-8b40-4152-9460-5bb67af80746',
  'eyewear-footwear': '7c9ca4ea-38c6-4865-ad8e-65efb2b46810',
  // Will create new
  'personal-care-grooming': null, // Will be created
};

async function createGroomingCategory() {
  // Check if it exists
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'personal-care-grooming')
    .single();

  if (existing) {
    console.log('Personal Care & Grooming category already exists:', existing.id);
    return existing.id;
  }

  // Create it under Home & Kitchen parent
  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: 'Personal Care & Grooming',
      slug: 'personal-care-grooming',
      description: 'Durable grooming tools, razors, trimmers, and personal care items built to last.',
      parent_id: '55555555-5555-5555-5555-555555555555', // Home & Kitchen
      display_order: 100,
      show_buying_guide: false
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating category:', error);
    throw error;
  }

  console.log('Created Personal Care & Grooming category:', data.id);
  return data.id;
}

async function getProductIdByName(name) {
  const { data, error } = await supabase
    .from('products')
    .select('id, name')
    .ilike('name', `%${name}%`)
    .single();

  if (error || !data) {
    console.warn(`Could not find product: ${name}`);
    return null;
  }
  return data.id;
}

async function updateProductCategory(productName, newCategoryId, reason) {
  const productId = await getProductIdByName(productName);
  if (!productId) return false;

  const { error } = await supabase
    .from('products')
    .update({ category_id: newCategoryId })
    .eq('id', productId);

  if (error) {
    console.error(`Error updating ${productName}:`, error);
    return false;
  }

  console.log(`✓ ${productName} -> ${reason}`);
  return true;
}

async function fixCategoryAssignments() {
  console.log('=== FIXING CATEGORY ASSIGNMENTS ===\n');

  // 1. Create Personal Care & Grooming category
  const groomingCategoryId = await createGroomingCategory();
  CATEGORIES['personal-care-grooming'] = groomingCategoryId;

  console.log('\n--- Moving Camera Accessories from Cables & Chargers ---');
  await updateProductCategory('PeakDesign Camera Straps', CATEGORIES['cameras-accessories'], 'Cameras & Accessories');
  await updateProductCategory('Manfrotto Mini Tripod', CATEGORIES['cameras-accessories'], 'Cameras & Accessories');

  console.log('\n--- Moving Grooming items from Eyewear (Footwear) to Personal Care & Grooming ---');
  await updateProductCategory('Rubis Classic Tweezers', groomingCategoryId, 'Personal Care & Grooming');
  await updateProductCategory('Chicago Comb', groomingCategoryId, 'Personal Care & Grooming');
  await updateProductCategory('MERKUR Double Edge Razor', groomingCategoryId, 'Personal Care & Grooming');
  await updateProductCategory('DOVO Straight Razor', groomingCategoryId, 'Personal Care & Grooming');
  await updateProductCategory('MERKUR MK-23C', groomingCategoryId, 'Personal Care & Grooming');
  await updateProductCategory('Seki Edge Nail Clippers', groomingCategoryId, 'Personal Care & Grooming');
  await updateProductCategory('Tweezer Guru', groomingCategoryId, 'Personal Care & Grooming');
  await updateProductCategory('Tweezerman Stainless Steel Point Tweezer', groomingCategoryId, 'Personal Care & Grooming');
  await updateProductCategory('Malteser Tweezers', groomingCategoryId, 'Personal Care & Grooming');

  console.log('\n--- Moving Grooming from Cleaning Tools (Home) ---');
  await updateProductCategory('Oster Professional Hair Clippers', groomingCategoryId, 'Personal Care & Grooming');

  console.log('\n--- Moving Grooming from Maintenance & Repair Kits ---');
  await updateProductCategory('Groom Mate Platinum', groomingCategoryId, 'Personal Care & Grooming');

  console.log('\n--- Moving Grooming from Radios & Emergency Gear ---');
  await updateProductCategory('Wahl Professional Peanut', groomingCategoryId, 'Personal Care & Grooming');

  console.log('\n--- Moving misplaced items from Knives & Cutting Boards (Home) ---');
  await updateProductCategory('Tweezerman 2000 Styling Shears', groomingCategoryId, 'Personal Care & Grooming');
  await updateProductCategory('InSinkerator', CATEGORIES['home-kitchen'], 'Home & Kitchen (appliance)');

  console.log('\n--- Moving items from Radios & Emergency Gear to Home ---');
  await updateProductCategory('Dohm White Noise', CATEGORIES['furniture-home'], 'Furniture (Home)');
  await updateProductCategory('Omron Platinum', CATEGORIES['home-kitchen'], 'Home & Kitchen (health device)');

  console.log('\n--- Moving Slippers from Survival Gear to Footwear ---');
  await updateProductCategory('Glerups Slippers', CATEGORIES['footwear-accessories'], 'Footwear & Accessories');

  console.log('\n--- Moving Swimming Goggles from Survival Gear to Eyewear ---');
  await updateProductCategory('Speedo Socket', CATEGORIES['eyewear-footwear'], 'Eyewear (Footwear & Accessories)');

  console.log('\n--- Moving Pens/Keychains from Wallets to Travel & Everyday Carry ---');
  await updateProductCategory('Aircraft Cable Keyring', CATEGORIES['travel-everyday-carry'], 'Travel & Everyday Carry');
  await updateProductCategory('Zebra Metal Pen', CATEGORIES['office-equipment'], 'Office Equipment');
  await updateProductCategory('Fisher Space Pen', CATEGORIES['office-equipment'], 'Office Equipment');

  console.log('\n=== DONE ===');
}

fixCategoryAssignments().catch(console.error);
