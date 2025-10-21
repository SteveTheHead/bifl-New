import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkFAQs() {
  // First, find the product
  const { data: product, error } = await supabase
    .from('products')
    .select('id, name, faq_1_q, faq_1_a, faq_2_q, faq_2_a, faq_3_q, faq_3_a, faq_4_q, faq_4_a, faq_5_q, faq_5_a')
    .eq('name', 'Quick Release Teardrop Ratchet')
    .single();

  if (error) {
    console.error('Error finding product:', error);
    return;
  }

  console.log('Product:', product?.name);
  console.log('Product ID:', product?.id);
  console.log('\n===== FAQs from products table =====');
  for (let i = 1; i <= 5; i++) {
    const q = (product as any)?.[`faq_${i}_q`];
    const a = (product as any)?.[`faq_${i}_a`];
    if (q) {
      console.log(`\nFAQ ${i}:`, q);
      console.log(`Answer ${i}:`, a?.substring(0, 200) + '...');
    }
  }

  // Check product_faqs table
  const { data: faqs } = await supabase
    .from('product_faqs')
    .select('question, answer')
    .eq('product_id', product?.id)
    .order('display_order', { ascending: true });

  console.log('\n\n===== FAQs from product_faqs table =====');
  console.log('Total FAQs:', faqs?.length || 0);
  faqs?.forEach((faq, i) => {
    console.log(`\n----- FAQ ${i + 1} -----`);
    console.log('Q:', faq.question);
    console.log('A:', faq.answer.substring(0, 200) + '...');
  });
}

checkFAQs().catch(console.error);
