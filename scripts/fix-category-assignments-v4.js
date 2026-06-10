const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const CATEGORIES = {
  'luggage-bags': '6cf3a690-3f2c-4cf3-a0bf-c9504d06bd51',
  'pet-supplies': '18063e94-a3b8-4029-8355-f5894fdd2c55',
  'personal-care-grooming': '81b8892a-b314-4d5d-ae83-d5ebe680ba9d',
  'casual-shoes': 'd003fc5f-3f1b-4b4e-bbf8-1784dd9b740e',
  'cleaning-tools-home': '60f3d666-57c3-4eac-bb1c-20d354befcff',
  'backpacks': 'd01bf367-000d-4c27-b641-e9895dbebc5f',
};

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
  console.log('=== FINAL CATEGORY FIXES ===\n');

  // Travelpro luggage from Backpacks -> Luggage & Bags
  await updateProduct('dfe23e17-f08c-4e11-8423-8e48f8e6b8de', CATEGORIES['luggage-bags'], 'Travelpro Luggage -> Luggage & Bags');

  // Dog toys from Reusables -> Pet Supplies
  await updateProduct('ee507b16-1056-4a4a-84cd-6fc3003fb5ee', CATEGORIES['pet-supplies'], 'Goughnuts Dog Toys -> Pet Supplies');

  // Sleep mask stays in Reusables (it's fine there - reusable item)

  // Slippers from Footwear root -> Casual Shoes
  await updateProduct('b51a54f2-bbcb-4a86-a558-b4974bb3e2f0', CATEGORIES['casual-shoes'], 'Glerups Slippers -> Casual Shoes');

  // Vacuums from Home & Kitchen root -> Cleaning Tools
  console.log('\n--- Moving vacuums to Cleaning Tools ---');
  await updateProduct('f43ff1af-b188-482e-99d5-687e14249797', CATEGORIES['cleaning-tools-home'], 'Dyson Ball Animal -> Cleaning Tools');
  await updateProduct('efee69e6-ad24-4fac-9794-315a7e609d21', CATEGORIES['cleaning-tools-home'], 'Bissell BigGreen -> Cleaning Tools');
  // Note: Miele C1 already in Cleaning Tools (a478aedb...)
  await updateProduct('4ee84c5f-d8db-4fc2-aca3-c0bd15117c81', CATEGORIES['cleaning-tools-home'], 'Oreck Commercial -> Cleaning Tools');
  await updateProduct('ccdd6157-3bfb-4960-a8ba-3a6fd674299f', CATEGORIES['cleaning-tools-home'], 'Kenmore Elite -> Cleaning Tools');
  await updateProduct('8b1171c6-c712-45f2-88fc-0ff41cb85f96', CATEGORIES['cleaning-tools-home'], 'Numatic Henry -> Cleaning Tools');
  await updateProduct('4a5d8f06-2783-4420-aad2-2286ea016bd1', CATEGORIES['cleaning-tools-home'], 'Hoover HushTone -> Cleaning Tools');
  await updateProduct('e2a00016-1144-4b45-acb2-6d9586a3c3b6', CATEGORIES['cleaning-tools-home'], 'Shark Navigator -> Cleaning Tools');
  await updateProduct('300f8a70-acb3-4080-9b27-4da607fd8b80', CATEGORIES['cleaning-tools-home'], 'Sanitaire Tradition -> Cleaning Tools');

  // Backpacks from Travel & EDC root -> Backpacks subcategory
  console.log('\n--- Moving backpacks to Backpacks subcategory ---');
  await updateProduct('057873ce-fac8-4d37-a94a-a7ef177309d5', CATEGORIES['backpacks'], 'JanSport Right Pack -> Backpacks');
  await updateProduct('a9401ae9-9d58-498f-ba8a-e41c4e3414f7', CATEGORIES['backpacks'], 'Osprey Farpoint -> Backpacks');
  await updateProduct('100d2732-2a8a-4cab-a09e-d6291d5f723c', CATEGORIES['backpacks'], 'Patagonia Black Hole -> Backpacks');
  await updateProduct('90b8f4e7-9389-45b9-be0f-435d7fd34e09', CATEGORIES['backpacks'], '5.11 Tactical Rush -> Backpacks');
  await updateProduct('baa1d587-d8cd-4b9d-b48b-dedf4004ee76', CATEGORIES['backpacks'], 'SwissGear 1900 -> Backpacks');
  await updateProduct('ca64d0e9-3d58-411f-8e44-c6994c2e36d8', CATEGORIES['backpacks'], 'Carhartt Legacy -> Backpacks');
  await updateProduct('79c47b7c-ee56-409e-aaf6-c49a55808ff3', CATEGORIES['backpacks'], 'Goruck GR1 -> Backpacks');
  await updateProduct('d1453f42-06da-4a74-9ef1-810d0b5f2812', CATEGORIES['backpacks'], 'North Face Borealis -> Backpacks');
  await updateProduct('932deac4-cac2-475a-b353-1f814a1f250b', CATEGORIES['backpacks'], 'Timbuk2 Authority -> Backpacks');
  await updateProduct('2b88ffd2-31ad-4e4a-be08-30f79d4a7ac0', CATEGORIES['backpacks'], 'Fjallraven Kanken -> Backpacks');

  console.log('\n=== COMPLETE ===');
}

fixCategories().catch(console.error);
