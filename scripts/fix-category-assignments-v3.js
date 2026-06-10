const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Existing category IDs
const CATEGORIES = {
  'office-equipment': '6037e1d5-de91-47c5-be50-f3e19d361629',
  'personal-care-grooming': '81b8892a-b314-4d5d-ae83-d5ebe680ba9d',
  'travel-everyday-carry': '88888888-8888-8888-8888-888888888888',
  'fire-starters-fuel-hardware': 'b26a2ba2-f501-4082-b97a-df13cc7e3ff2',
  'cameras-accessories': '7ad50fb6-4005-474f-9c16-d4b3c0704b7e',
  'camping-furniture': 'd5c43d40-576e-4d6c-9909-1c649e140444',
  'survival-gear': '3394e2a4-b65f-4108-a9b4-fca659c0cb21',
  'backpacks': 'd01bf367-000d-4c27-b641-e9895dbebc5f',
  // Will create new categories
  'luggage-bags': null,
  'umbrellas': null,
  'pet-supplies': null,
  'fishing': null,
  'watches-jewelry': null,
};

async function createCategory(name, slug, description, parentId) {
  // Check if exists
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .single();

  if (existing) {
    console.log(`Category "${name}" already exists: ${existing.id}`);
    return existing.id;
  }

  const { data, error } = await supabase
    .from('categories')
    .insert({
      name,
      slug,
      description,
      parent_id: parentId,
      display_order: 100,
      show_buying_guide: false
    })
    .select('id')
    .single();

  if (error) {
    console.error(`Error creating ${name}:`, error);
    throw error;
  }

  console.log(`Created "${name}" category: ${data.id}`);
  return data.id;
}

async function updateProduct(productId, newCategoryId, reason) {
  const { error } = await supabase
    .from('products')
    .update({ category_id: newCategoryId })
    .eq('id', productId);

  if (error) {
    console.error(`✗ FAILED: ${reason} - ${error.message}`);
    return false;
  }
  console.log(`✓ ${reason}`);
  return true;
}

async function fixCategories() {
  console.log('=== CREATING NEW CATEGORIES ===\n');

  // Create new categories under Travel & Everyday Carry
  CATEGORIES['luggage-bags'] = await createCategory(
    'Luggage & Bags',
    'luggage-bags',
    'Durable luggage, briefcases, tote bags, and travel bags built to last.',
    CATEGORIES['travel-everyday-carry']
  );

  CATEGORIES['umbrellas'] = await createCategory(
    'Umbrellas',
    'umbrellas',
    'High-quality, windproof umbrellas built to last for years.',
    CATEGORIES['travel-everyday-carry']
  );

  // Create Pet Supplies under Home & Kitchen
  CATEGORIES['pet-supplies'] = await createCategory(
    'Pet Supplies',
    'pet-supplies',
    'Durable pet supplies, dog toys, leashes, and accessories built to last.',
    '55555555-5555-5555-5555-555555555555' // Home & Kitchen
  );

  // Create Fishing under Outdoor & Camping
  CATEGORIES['fishing'] = await createCategory(
    'Fishing',
    'fishing',
    'Durable fishing gear, reels, tackle boxes, and accessories built to last.',
    '66666666-6666-6666-6666-666666666666' // Outdoor & Camping
  );

  // Create Watches & Jewelry under Footwear & Accessories (to replace Eyewear for watches)
  CATEGORIES['watches-jewelry'] = await createCategory(
    'Watches & Jewelry',
    'watches-jewelry',
    'Durable watches and jewelry built to last a lifetime.',
    '44444444-4444-4444-4444-444444444444' // Footwear & Accessories
  );

  console.log('\n=== FIXING PRODUCT ASSIGNMENTS ===\n');

  // Office supplies from Storage & Containers -> Office Equipment
  await updateProduct('a5f676a8-3af2-4636-84fa-9bd27e7a1064', CATEGORIES['office-equipment'], 'Swingline Stapler -> Office Equipment');
  await updateProduct('25628cae-28e6-4f62-87eb-1ac8ddcc7645', CATEGORIES['office-equipment'], 'Swingline Hole Puncher -> Office Equipment');

  // Grooming from Hand Tools -> Personal Care
  await updateProduct('0d3cccca-97db-44d2-aefe-eb20997bee29', CATEGORIES['personal-care-grooming'], 'Harperton Nail Clippers -> Personal Care');

  // Pens from Hand Tools -> Office Equipment
  await updateProduct('82c4fc6a-7a5d-4332-8915-886c5293222e', CATEGORIES['office-equipment'], 'Rotring Mechanical Pencil -> Office Equipment');
  await updateProduct('1c9ebb20-2b84-4e95-b9f4-1f54d335019f', CATEGORIES['office-equipment'], 'Cross Ballpoint Pen -> Office Equipment');

  // Lighter from Travel Bottles -> Fire Starters & Fuel (Hardware)
  await updateProduct('09ed08bb-d891-4601-832b-279ad1dae7be', CATEGORIES['fire-starters-fuel-hardware'], 'Zippo Lighter -> Fire Starters & Fuel');

  // Umbrellas from Travel Bottles -> Umbrellas (new)
  await updateProduct('811618dc-5591-423a-b2a6-829cbe15ec17', CATEGORIES['umbrellas'], 'BLUNT Metro Umbrella -> Umbrellas');
  await updateProduct('1b7c2d88-e6be-4efc-8a41-adc55a272d4b', CATEGORIES['umbrellas'], 'DAVEK Solo Umbrella -> Umbrellas');
  await updateProduct('3595e09b-60be-4828-8715-594c4dd6070c', CATEGORIES['umbrellas'], 'DAVEK Umbrella -> Umbrellas');

  // Cooler from Travel Bottles -> Survival Gear
  await updateProduct('27d531af-7088-4443-a95d-5196e9d24dd4', CATEGORIES['survival-gear'], 'Carhartt Cooler -> Survival Gear');

  // Luggage/Bags from Backpacks -> Luggage & Bags (new)
  await updateProduct('30603984-ee3a-4ad8-9cf3-ec5217ed4038', CATEGORIES['luggage-bags'], 'Briggs & Riley Luggage -> Luggage & Bags');
  await updateProduct('ae28e023-2472-49a4-a69e-8b342f047d58', CATEGORIES['luggage-bags'], 'DALIX Tote Bag -> Luggage & Bags');
  await updateProduct('e9210d1f-4912-43e4-8afa-73f446a538dd', CATEGORIES['luggage-bags'], 'Briggs & Riley Briefcase -> Luggage & Bags');
  await updateProduct('0721f677-d6ef-44a2-96a1-abdbf9f62f10', CATEGORIES['luggage-bags'], 'Pelican Storage Case -> Luggage & Bags');

  // Camera bag to Cameras & Accessories
  await updateProduct('750e073e-ea49-42de-b1cf-6e8ace811c4e', CATEGORIES['cameras-accessories'], 'Domke Camera Bag -> Cameras & Accessories');

  // Pet supplies from Survival Gear -> Pet Supplies (new)
  await updateProduct('6be39160-981b-4933-9790-8137649a0c34', CATEGORIES['pet-supplies'], 'Ray Allen Dog Leash -> Pet Supplies');
  await updateProduct('f04ee1fc-0094-4902-98ff-91473db6f880', CATEGORIES['pet-supplies'], 'Carhartt Dog Collars -> Pet Supplies');

  // Fishing from Survival Gear -> Fishing (new)
  await updateProduct('2f14be73-7e1f-4228-9266-9e77342d895e', CATEGORIES['fishing'], 'Penn Fishing Reel -> Fishing');
  await updateProduct('7d65932a-5dca-46a3-8497-25b415ebb8c5', CATEGORIES['fishing'], 'Plano Tackle Storage -> Fishing');

  // Camp chair from Survival Gear -> Camping Furniture
  await updateProduct('bd761e87-078f-4989-97c9-6b6098ef572b', CATEGORIES['camping-furniture'], 'ALPS Camp Chair -> Camping Furniture');

  // Watch from Eyewear -> Watches & Jewelry (new)
  await updateProduct('6ec88e51-a496-44d2-839b-0873ab52e54d', CATEGORIES['watches-jewelry'], 'Citizen Watch -> Watches & Jewelry');

  // Health scale stays in Home & Kitchen (it's fine there)
  // await updateProduct('84e9f06d-fe6b-45b4-b8bd-3eafdab3a619', ..., 'Health o Meter Scale');

  console.log('\n=== COMPLETE ===');
}

fixCategories().catch(console.error);
