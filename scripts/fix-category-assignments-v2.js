const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Category IDs
const CATEGORIES = {
  'personal-care-grooming': '81b8892a-b314-4d5d-ae83-d5ebe680ba9d', // Just created
  'cameras-accessories': '7ad50fb6-4005-474f-9c16-d4b3c0704b7e',
  'eyewear-footwear': '7c9ca4ea-38c6-4865-ad8e-65efb2b46810',
  'footwear-accessories': '44444444-4444-4444-4444-444444444444',
  'home-kitchen': '55555555-5555-5555-5555-555555555555',
  'furniture-home': 'bafc3855-6d0c-4b77-83ff-2668e5771641',
  'office-equipment': '6037e1d5-de91-47c5-be50-f3e19d361629',
  'travel-everyday-carry': '88888888-8888-8888-8888-888888888888',
};

// Products to reassign: { productId: [newCategoryId, reason] }
const REASSIGNMENTS = {
  // From Cables & Chargers -> Cameras & Accessories
  '43c75945-2503-481a-bdd6-5fb7ae5c3148': [CATEGORIES['cameras-accessories'], 'PeakDesign Camera Straps -> Cameras & Accessories'],
  '0148bace-615a-49bd-b9db-92aa8f36e7e6': [CATEGORIES['cameras-accessories'], 'Manfrotto Mini Tripod -> Cameras & Accessories'],

  // From Eyewear (Footwear) -> Personal Care & Grooming (grooming items)
  'c7c0324b-dd81-488c-a0db-ecebc6476ce0': [CATEGORIES['personal-care-grooming'], 'Rubis Classic Tweezers -> Personal Care'],
  '26fd67fd-5a72-4a95-8149-5d4a01df467a': [CATEGORIES['personal-care-grooming'], 'Chicago Comb -> Personal Care'],
  '46307c4f-a865-41a3-b62c-f2fb0c103dd4': [CATEGORIES['personal-care-grooming'], 'MERKUR Double Edge Razor -> Personal Care'],
  '21ccb0b4-5b6b-4a7d-afff-0bf074e411ad': [CATEGORIES['personal-care-grooming'], 'MERKUR MK-23C Safety Razor -> Personal Care'],
  '8ea770c9-b84b-4d40-baeb-32cae3759e42': [CATEGORIES['personal-care-grooming'], 'Seki Edge Nail Clippers -> Personal Care'],
  '317e5365-64b4-4971-b608-81267d123d70': [CATEGORIES['personal-care-grooming'], 'Tweezer Guru Precision Tweezers -> Personal Care'],
  '744b487e-9847-4a75-b1d1-e76cea5ed3e4': [CATEGORIES['personal-care-grooming'], 'Tweezerman Point Tweezer -> Personal Care'],
  'af411682-397d-4400-aedf-4c385eb277d1': [CATEGORIES['personal-care-grooming'], 'Malteser Tweezers -> Personal Care'],
  // Keep in Eyewear: Bullhead Safety Glasses, Citizen Watch

  // From Cleaning Tools (Home) -> Personal Care
  'a248512c-b827-4ce3-a365-817c6f098f6a': [CATEGORIES['personal-care-grooming'], 'Oster Professional Hair Clippers -> Personal Care'],

  // From Maintenance & Repair Kits -> Personal Care
  '546ea778-ab4e-488e-a127-fba579b858c9': [CATEGORIES['personal-care-grooming'], 'Groom Mate Nose Hair Trimmer -> Personal Care'],
  // Also move the pen to Office Equipment
  '1298810c-5562-40db-bdca-6f3b249e9d98': [CATEGORIES['office-equipment'], 'Lamy Safari Fountain Pen -> Office Equipment'],

  // From Radios & Emergency Gear -> Personal Care / Home
  '78cda225-27b8-4dd6-8f5c-f845b2499d3b': [CATEGORIES['personal-care-grooming'], 'Wahl Peanut Beard Trimmer -> Personal Care'],
  'ff417217-aef7-43d6-8c30-d3d71871bc2d': [CATEGORIES['furniture-home'], 'Dohm White Noise Machine -> Furniture (Home)'],
  'bfa7ac45-bf37-491b-9063-f52e5d23ecf3': [CATEGORIES['home-kitchen'], 'Omron Blood Pressure Monitor -> Home & Kitchen'],

  // From Knives & Cutting Boards -> Personal Care / Home
  '029541eb-70a8-484c-b55a-d7aa2f26ec17': [CATEGORIES['personal-care-grooming'], 'Tweezerman Styling Shears -> Personal Care'],
  '2a5a26d6-cbdb-42ec-be5c-95b4247c8a7d': [CATEGORIES['home-kitchen'], 'InSinkerator Garbage Disposal -> Home & Kitchen'],

  // From Survival Gear -> Footwear / Eyewear
  'b51a54f2-bbcb-4a86-a558-b4974bb3e2f0': [CATEGORIES['footwear-accessories'], 'Glerups Slippers -> Footwear & Accessories'],
  'b4fa4168-d006-4ca0-b926-370962d0770c': [CATEGORIES['eyewear-footwear'], 'Speedo Swimming Goggles -> Eyewear'],

  // From Wallets -> Travel/Office
  'bfa5e547-265f-430f-b392-da40208eeb52': [CATEGORIES['travel-everyday-carry'], 'Aircraft Cable Keyring -> Travel & Everyday Carry'],
  '635c09a4-b8fd-4975-a570-8dcb1cb2a7e9': [CATEGORIES['office-equipment'], 'Zebra Metal Pen -> Office Equipment'],
  'c198d11e-8fce-4712-8bff-6d983d7449c5': [CATEGORIES['office-equipment'], 'Fisher Space Pen -> Office Equipment'],
};

async function fixCategories() {
  console.log('=== FIXING CATEGORY ASSIGNMENTS ===\n');

  let success = 0;
  let failed = 0;

  for (const [productId, [newCategoryId, reason]] of Object.entries(REASSIGNMENTS)) {
    const { error } = await supabase
      .from('products')
      .update({ category_id: newCategoryId })
      .eq('id', productId);

    if (error) {
      console.error(`✗ FAILED: ${reason}`);
      console.error(`  Error: ${error.message}`);
      failed++;
    } else {
      console.log(`✓ ${reason}`);
      success++;
    }
  }

  console.log(`\n=== COMPLETE ===`);
  console.log(`Success: ${success}`);
  console.log(`Failed: ${failed}`);
}

fixCategories().catch(console.error);
