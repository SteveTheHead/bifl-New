# Product Type Definitions

This directory contains centralized type definitions for products to ensure consistency across the application.

## Why This Exists

After migrating from UUID-based routing (`/products/[id]`) to slug-based routing (`/products/[slug]`), we discovered that many components and API endpoints were missing the `slug` field in their product objects. This caused TypeScript build failures.

To prevent this from happening again, we've created centralized Product type definitions that all code should use.

## Usage

### Import the types

```typescript
import { Product, ComparisonProduct, MinimalProduct } from '@/types/product'
```

### Use in components

```typescript
interface ProductCardProps {
  product: Product  // Use centralized type instead of inline interface
}
```

### Use in API responses

When returning products from API endpoints, ensure your SELECT query includes all fields defined in the type, especially `slug`:

```typescript
const { data: products } = await supabase
  .from('products')
  .select(`
    id,
    name,
    slug,           // ALWAYS include slug
    price,
    featured_image_url,
    // ... other fields
  `)
```

### Creating product objects for components

When creating product objects (e.g., for AddToCompareButton):

```typescript
import { toComparisonProduct } from '@/types/product'

// Good - using helper function
<AddToCompareButton product={toComparisonProduct(product)} />

// Also good - manual creation with all fields
<AddToCompareButton
  product={{
    id: product.id,
    name: product.name,
    slug: product.slug,  // Don't forget this!
    price: product.price || 0,
    images: product.featured_image_url ? [product.featured_image_url] : [],
    average_score: product.bifl_total_score,
    affiliate_link: product.affiliate_link
  }}
/>
```

## Available Types

- **Product**: Base product type for most use cases
- **ComparisonProduct**: For comparison features (AddToCompareButton, ProductComparisonTable)
- **MinimalProduct**: For simple cards and lists
- **DetailedProduct**: For product detail pages with full information
- **RecentlyViewedProduct**: Includes viewing timestamp
- **RecommendedProduct**: Includes recommendation metadata

## Helper Functions

- **ensureProductHasSlug(product)**: Validates that a product has a slug field
- **toComparisonProduct(product)**: Transforms a Product into a ComparisonProduct

## Rules

1. **ALWAYS include `slug` in product objects** - It's required for routing
2. **Use centralized types instead of inline interfaces** - Prevents inconsistencies
3. **Import from `@/types/product`** - Single source of truth
4. **Update API queries** - Ensure SELECT statements include all required fields

## Checklist for New Product Code

- [ ] Import Product type from `@/types/product`
- [ ] Use the type instead of creating inline interface
- [ ] Ensure API response includes `slug` field
- [ ] Test that product links use `product.slug` not `product.id`
- [ ] Verify TypeScript compilation succeeds
