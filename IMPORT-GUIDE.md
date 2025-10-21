# Product Import Guide

This guide explains how to import products into the BIFL database and ensures all data is properly structured.

## Overview

The product import system automatically handles:
- Product data insertion into the `products` table
- FAQ insertion into the `product_faqs` table
- Pros & cons data storage
- Badge/certification data
- Category and brand relationships

## Import Script

**Location**: `/scripts/import-products.ts`

**Usage**:
```bash
npx tsx scripts/import-products.ts
```

## CSV Structure Required

### Essential Columns

#### Product Basics
- `product_name` - Product name (required)
- `brand` - Brand name (required)
- `category TEXT` - Main category name (required)
- `sub_category TEXT` - Subcategory name (required)
- `Status` - Must be "FINAL REVIEW!!" for published status

#### Scores (0-10 scale)
- `bifl_total_score` - Overall BIFL score
- `durability_score` - Durability rating
- `repairability_score` - Repairability rating
- `warranty_score` - Warranty rating
- `social_score` - Social/sustainability rating
- `sustainability_score` - Environmental rating

#### Product Details
- `optimized_product_description` - Main product description
- `verdict_summary` - Research summary
- `verdict_bullet_1`, `verdict_bullet_2`, `verdict_bullet_3` - Key verdict points
- `price` - Product price
- `featured_image_url` - Main product image URL
- `gallery_image_1` through `gallery_image_8` - Additional product images
- `affiliate_link` - Purchase link (usually Amazon)

#### Notes & Analysis
- `durability_notes` - Detailed durability analysis (HTML formatted)
- `repairability_notes` - Detailed repairability analysis (HTML formatted)
- `warranty_notes` - Warranty information (HTML formatted)
- `social_notes` - Social/sustainability analysis (HTML formatted)

#### Product Specifications
- `dimensions` - Product dimensions
- `lifespan_expectation` - Expected lifespan in years
- `primary_material` - Main material
- `COE` (Country of Origin) - Manufacturing country
- `use_case` - Intended use case

#### Pros & Cons (NEW - IMPORTANT)
- `pro_1`, `pro_2`, `pro_3`, `pro_4` - Product advantages
- `con_1`, `con_2`, `con_3`, `con_4` - Product disadvantages

**Note**: These will be displayed in the "Pros and Cons" section on product pages.

#### FAQs (NEW - IMPORTANT)
- `faq_1_q`, `faq_1_a` - First FAQ question and answer
- `faq_2_q`, `faq_2_a` - Second FAQ question and answer
- `faq_3_q`, `faq_3_a` - Third FAQ question and answer
- `faq_4_q`, `faq_4_a` - Fourth FAQ question and answer
- `faq_5_q`, `faq_5_a` - Fifth FAQ question and answer

**Note**: FAQs are automatically inserted into the `product_faqs` table during import.

#### Care & Maintenance
- `care_and_maintenance` - JSON formatted care instructions

#### Badges/Certifications
- `bifl_certification` - Comma-separated list of badges
  - Examples: "Gold Standard", "Lifetime Warranty", "Crowd Favorite", "Repair Friendly", "Eco Hero", "BIFL Approved"

## How the Import Works

### Step 1: Product Insertion
The script:
1. Validates and processes all CSV data
2. Creates/finds brand and category records
3. Inserts the product into the `products` table
4. Returns the new product ID

### Step 2: FAQ Insertion (Automatic)
After product creation:
1. Script collects all FAQ data from CSV columns
2. Inserts FAQs into `product_faqs` table with:
   - `product_id` - Links to the product
   - `question` - The FAQ question
   - `answer` - The FAQ answer
   - `display_order` - Order (1-5)
   - `is_active` - Set to `true`

### Step 3: Data Validation
The script logs:
- Number of pros found
- Number of cons found
- Number of FAQs inserted
- Any errors or warnings

## Database Tables

### products
Stores main product data including:
- Basic info (name, price, description)
- Scores (all BIFL metrics)
- Notes (durability, repairability, warranty, social)
- Pros/cons columns (pro_1-4, con_1-4)
- FAQ columns (faq_1_q/a through faq_5_q/a) - **Legacy, for reference only**

### product_faqs
Stores structured FAQ data:
- `id` - UUID primary key
- `product_id` - Foreign key to products table
- `question` - FAQ question text
- `answer` - FAQ answer text
- `display_order` - Display order (1-5)
- `is_active` - Active status (boolean)
- `created_at`, `updated_at` - Timestamps

### brands
Stores brand information:
- `id`, `name`, `slug`, `website`, `description`

### categories
Hierarchical category structure:
- `id`, `name`, `slug`, `description`, `parent_id`

## Data Quality Checklist

Before importing, ensure:

- [ ] All products have `product_name`
- [ ] All products have `brand`
- [ ] All products have `category TEXT` and `sub_category TEXT`
- [ ] All products have `Status` = "FINAL REVIEW!!"
- [ ] Scores are between 0-10
- [ ] Prices are valid numbers
- [ ] Image URLs are valid and accessible
- [ ] **At least 2-3 pros and cons per product**
- [ ] **At least 3-5 FAQs per product**
- [ ] HTML in notes fields is properly formatted
- [ ] Badges are spelled correctly

## Common Issues & Solutions

### Issue: FAQs not displaying on product page
**Solution**: Run the FAQ migration script:
```bash
npx tsx scripts/migrate-faqs.ts
```

### Issue: Pros/Cons showing generic content
**Cause**: Missing pro_X or con_X columns in CSV
**Solution**: Ensure CSV has all pro and con columns populated

### Issue: Products showing as drafts
**Cause**: Status column not set to "FINAL REVIEW!!"
**Solution**: Update Status column in CSV

### Issue: Categories showing 0 products
**Cause**: Product assigned to non-existent subcategory
**Solution**: Verify subcategory exists in database

## Testing Imports

After running the import:

1. **Check Import Logs**:
   - Look for "✅ Imported" messages
   - Verify FAQ insertion messages
   - Check pros/cons count in logs

2. **Verify Database**:
   ```sql
   -- Check product count
   SELECT COUNT(*) FROM products WHERE status = 'published';

   -- Check FAQ count
   SELECT COUNT(*) FROM product_faqs;

   -- Check products with pros/cons
   SELECT COUNT(*) FROM products
   WHERE pro_1 IS NOT NULL AND con_1 IS NOT NULL;
   ```

3. **Test Product Pages**:
   - Visit http://localhost:3000/products
   - Click on a product
   - Verify:
     - [ ] FAQs section shows real FAQs
     - [ ] Pros & Cons section shows specific content
     - [ ] All scores display correctly
     - [ ] Images load properly

## Future Import Runs

When running subsequent imports:

1. The script will **append** new products (doesn't update existing ones)
2. FAQs will be automatically inserted for new products
3. Existing products won't be affected
4. To update existing products, delete them first or use an update script

## Maintenance Scripts

### Migrate FAQs
If you have old data without FAQs in product_faqs table:
```bash
npx tsx scripts/migrate-faqs.ts
```

### Fix Badge Data
If badges aren't displaying:
```bash
npx tsx scripts/fix-badges.ts
```

## Support

If you encounter issues:

1. Check the import logs for specific errors
2. Verify CSV column names match exactly
3. Ensure database tables exist (run migrations)
4. Check that Supabase credentials are in `.env.local`

---

**Last Updated**: 2025-10-20
**Import Script Version**: 2.0 (with automatic FAQ insertion)
