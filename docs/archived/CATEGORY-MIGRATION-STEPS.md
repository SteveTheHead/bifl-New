# Category Migration Steps

## Overview
Restructuring from flat categories to hierarchical 8 main categories with subcategories.

## 8 Main Categories
1. Automotive & Cycling
2. Clothing & Apparel
3. Electronics & Tech
4. Footwear & Accessories
5. Home & Kitchen
6. Outdoor & Camping
7. Tools & Hardware
8. Travel & Everyday Carry

## Removed Categories (moved to Home & Kitchen):
- Fitness & Exercise → Home & Kitchen
- Office & Workspace → Home & Kitchen
- Health & Household → Home & Kitchen

---

## Step 1: Run SQL Migration in Supabase

Open your Supabase SQL Editor and run the migration file:

```
/Users/stephen/Documents/GitHub/bifl-New/setup-hierarchical-categories.sql
```

This will:
- Add `parent_id` column to categories table
- Delete all existing categories and products
- Create 8 main categories with fixed UUIDs
- Create all subcategories linked to their parents
- Add `bifl_certification` column to products table

---

## Step 2: Re-import Products

After running the SQL, import products with the new structure:

```bash
npx tsx scripts/import-products.ts
```

The import script has been updated to:
- Look up subcategories by name
- Remap removed categories to Home & Kitchen
- Link products to subcategories (not main categories)
- Parse and store `bifl_certification` as an array

---

## Step 3: Verify the Import

Check that products are correctly categorized:

```bash
npx tsx scripts/check-products.ts
```

You should see:
- 327 products total (or 328 if no empty rows)
- All products linked to subcategories
- Badge data populated from CSV

---

## Code Changes Made

### 1. Database Schema
- Added `parent_id uuid` column to `categories` table
- Added `bifl_certification text[]` column to `products` table

### 2. TypeScript Types (`lib/supabase/types.ts`)
- Added `bifl_certification: string[] | null` to products Row/Insert/Update types
- `parent_id` already existed in categories types

### 3. Queries (`lib/supabase/queries.ts`)
- `getCategories()` - Now returns only main categories (parent_id IS NULL)
- `getAllCategories()` - New function to get all categories
- `getSubcategories(parentId)` - New function to get children of a parent

### 4. Import Script (`scripts/import-products.ts`)
- Replaced `getOrCreateCategory()` with `getCategoryBySubcategory()`
- Added `parseBadges()` function for certification arrays
- Remaps removed categories to Home & Kitchen
- Links products to subcategories

### 5. Badge Components
- `BadgeDisplay.tsx` - Now uses `product.bifl_certification` from database
- `ProductFilters.tsx` - Uses certification array for badge filtering
- `ProductGrid.tsx` - Uses certification array for badge filtering

---

## Next Steps (UI Updates Needed)

After importing the data, you'll want to update these UI components:

### 1. Category Navigation
Update category pages to show:
- Main category grid on `/categories`
- Subcategory grid when viewing a main category
- Breadcrumbs showing hierarchy

### 2. Product Filters
Update `ProductFilters.tsx` to:
- Use `getAllCategories()` instead of `getCategories()`
- Group subcategories under their parent categories
- Show expandable/collapsible category tree

### 3. Product Display
- Show both main category and subcategory on product cards
- Update breadcrumbs to show: Home > Main Category > Subcategory > Product

---

## Rollback (if needed)

If you need to rollback:

1. The old flat structure can be restored by removing parent_id references
2. Re-run your previous import script
3. Categories will be created as needed (flat structure)

---

## Summary

✅ Schema updated with hierarchical structure
✅ 8 main categories defined with subcategories
✅ Import script updated to use new structure
✅ Badge system now uses database field
⏳ UI components need updates for hierarchical navigation
