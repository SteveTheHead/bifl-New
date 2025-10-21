import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function importFAQsFromCSV() {
  const csvPath = '/Users/stephen/Downloads/BIFL Score Card - For Import (1).csv';

  console.log('📖 Reading CSV file...');
  const fileContent = fs.readFileSync(csvPath, 'utf-8');

  console.log('🔍 Parsing CSV...');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  console.log(`📦 Found ${records.length} products in CSV\n`);

  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const row of records) {
    const productName = row.product_name?.trim();
    if (!productName) {
      skippedCount++;
      continue;
    }

    try {
      // Find the product in the database
      const { data: product, error: findError } = await supabase
        .from('products')
        .select('id')
        .eq('name', productName)
        .single();

      if (findError || !product) {
        console.log(`⚠️  Product not found in database: ${productName}`);
        skippedCount++;
        continue;
      }

      // Collect FAQs from CSV
      const faqs: any[] = [];
      for (let i = 1; i <= 5; i++) {
        const question = (row[`faq_${i}_q`] || '').trim();
        const answer = (row[`faq_${i}_a`] || '').trim();

        if (question && answer) {
          faqs.push({
            product_id: product.id,
            question,
            answer,
            display_order: i,
            is_active: true
          });
        }
      }

      if (faqs.length === 0) {
        console.log(`⚠️  No FAQs in CSV for: ${productName}`);
        skippedCount++;
        continue;
      }

      // Check if product already has FAQs
      const { data: existingFAQs } = await supabase
        .from('product_faqs')
        .select('id')
        .eq('product_id', product.id);

      if (existingFAQs && existingFAQs.length > 0) {
        // Delete existing FAQs first
        await supabase
          .from('product_faqs')
          .delete()
          .eq('product_id', product.id);
      }

      // Insert new FAQs
      const { error: insertError } = await supabase
        .from('product_faqs')
        .insert(faqs);

      if (insertError) {
        console.error(`❌ Error inserting FAQs for "${productName}":`, insertError.message);
        errorCount++;
      } else {
        successCount++;
        const action = existingFAQs && existingFAQs.length > 0 ? 'Updated' : 'Inserted';
        console.log(`✅ ${action} ${faqs.length} FAQs for: ${productName}`);
      }

    } catch (err: any) {
      console.error(`❌ Error processing "${productName}":`, err.message);
      errorCount++;
    }
  }

  console.log('\n🎉 Import Complete!');
  console.log(`✅ Successfully imported: ${successCount} products`);
  console.log(`⚠️  Skipped: ${skippedCount} products`);
  console.log(`❌ Errors: ${errorCount} products`);
}

importFAQsFromCSV().catch(console.error);
