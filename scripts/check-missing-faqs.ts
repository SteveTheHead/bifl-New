import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkMissingFAQs() {
  // Get all products
  const { data: products } = await supabase
    .from('products')
    .select('id, name')
    .eq('status', 'published')
    .order('name');

  console.log('Total published products:', products?.length);

  // Get products with FAQs in product_faqs table
  const { data: faqRecords } = await supabase
    .from('product_faqs')
    .select('product_id');

  const productIdsWithFAQs = new Set(faqRecords?.map(f => f.product_id));
  console.log('Products with FAQs in product_faqs table:', productIdsWithFAQs.size);

  const productsWithoutFAQs = products?.filter(p => productIdsWithFAQs.has(p.id) === false) || [];
  console.log('Products WITHOUT FAQs:', productsWithoutFAQs.length);

  console.log('\nFirst 15 products without FAQs:');
  productsWithoutFAQs.slice(0, 15).forEach(p => console.log('-', p.name));

  // Check if Quick Release Teardrop Ratchet is in the list
  const ratchet = productsWithoutFAQs.find(p => p.name.includes('Quick Release Teardrop Ratchet'));
  if (ratchet) {
    console.log('\n✓ Quick Release Teardrop Ratchet is among products without FAQs');
  }
}

checkMissingFAQs().catch(console.error);
