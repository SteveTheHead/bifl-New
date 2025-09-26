-- Drop views that depend on the score columns
DROP VIEW IF EXISTS featured_products;
DROP VIEW IF EXISTS products_with_taxonomy;

-- Now we can alter the column types
ALTER TABLE products
  ALTER COLUMN durability_score TYPE DECIMAL(3,1),
  ALTER COLUMN repairability_score TYPE DECIMAL(3,1),
  ALTER COLUMN sustainability_score TYPE DECIMAL(3,1),
  ALTER COLUMN social_score TYPE DECIMAL(3,1),
  ALTER COLUMN warranty_score TYPE DECIMAL(3,1);

-- Update the constraints to use decimal ranges
ALTER TABLE products
  DROP CONSTRAINT IF EXISTS products_durability_score_check,
  DROP CONSTRAINT IF EXISTS products_repairability_score_check,
  DROP CONSTRAINT IF EXISTS products_sustainability_score_check,
  DROP CONSTRAINT IF EXISTS products_social_score_check,
  DROP CONSTRAINT IF EXISTS products_warranty_score_check;

-- Add new decimal constraints
ALTER TABLE products
  ADD CONSTRAINT products_durability_score_check CHECK (durability_score >= 1.0 AND durability_score <= 10.0),
  ADD CONSTRAINT products_repairability_score_check CHECK (repairability_score >= 1.0 AND repairability_score <= 10.0),
  ADD CONSTRAINT products_sustainability_score_check CHECK (sustainability_score >= 1.0 AND sustainability_score <= 10.0),
  ADD CONSTRAINT products_social_score_check CHECK (social_score >= 1.0 AND social_score <= 10.0),
  ADD CONSTRAINT products_warranty_score_check CHECK (warranty_score >= 1.0 AND warranty_score <= 10.0);

-- Recreate the views with updated column types
CREATE VIEW featured_products AS
SELECT
  p.*,
  b.name as brand_name,
  b.slug as brand_slug,
  c.name as category_name,
  c.slug as category_slug,
  m.name as material_name,
  pr.name as price_range_name
FROM products p
LEFT JOIN brands b ON p.brand_id = b.id
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN materials m ON p.primary_material_id = m.id
LEFT JOIN price_ranges pr ON p.price_range_id = pr.id
WHERE p.is_featured = true AND p.status = 'published';

-- Recreate products_with_taxonomy view
CREATE VIEW products_with_taxonomy AS
SELECT
  p.*,
  b.name as brand_name,
  b.slug as brand_slug,
  c.name as category_name,
  c.slug as category_slug,
  m.name as material_name,
  pr.name as price_range_name,
  ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tag_names,
  ARRAY_AGG(DISTINCT cert.name) FILTER (WHERE cert.name IS NOT NULL) as certification_names
FROM products p
LEFT JOIN brands b ON p.brand_id = b.id
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN materials m ON p.primary_material_id = m.id
LEFT JOIN price_ranges pr ON p.price_range_id = pr.id
LEFT JOIN product_tags pt ON p.id = pt.product_id
LEFT JOIN tags t ON pt.tag_id = t.id
LEFT JOIN product_certifications pc ON p.id = pc.product_id
LEFT JOIN certifications cert ON pc.certification_id = cert.id
WHERE p.status = 'published'
GROUP BY p.id, b.name, b.slug, c.name, c.slug, m.name, pr.name;

-- Update the function to work with decimal inputs
CREATE OR REPLACE FUNCTION calculate_bifl_score(
  dur_score DECIMAL(3,1),
  rep_score DECIMAL(3,1),
  sus_score DECIMAL(3,1),
  soc_score DECIMAL(3,1),
  war_score DECIMAL(3,1)
) RETURNS DECIMAL(3,1) AS $$
BEGIN
  -- Weighted average: durability and repairability are most important
  RETURN ROUND(
    (dur_score * 0.3 + rep_score * 0.25 + sus_score * 0.2 + soc_score * 0.15 + war_score * 0.1),
    1
  );
END;
$$ LANGUAGE plpgsql;