-- Drop the existing view
DROP VIEW IF EXISTS products_with_taxonomy;

-- Recreate the view with bifl_certification included
CREATE OR REPLACE VIEW products_with_taxonomy AS
SELECT
  p.*,
  b.name as brand_name,
  b.slug as brand_slug,
  c.name as category_name,
  c.slug as category_slug
FROM products p
LEFT JOIN brands b ON p.brand_id = b.id
LEFT JOIN categories c ON p.category_id = c.id;