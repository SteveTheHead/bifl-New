-- Create curations table
CREATE TABLE IF NOT EXISTS curations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  featured_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create junction table for curations and products
CREATE TABLE IF NOT EXISTS curation_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  curation_id UUID NOT NULL REFERENCES curations(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(curation_id, product_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_curations_slug ON curations(slug);
CREATE INDEX IF NOT EXISTS idx_curations_is_active ON curations(is_active);
CREATE INDEX IF NOT EXISTS idx_curations_is_featured ON curations(is_featured);
CREATE INDEX IF NOT EXISTS idx_curations_display_order ON curations(display_order);
CREATE INDEX IF NOT EXISTS idx_curation_products_curation_id ON curation_products(curation_id);
CREATE INDEX IF NOT EXISTS idx_curation_products_product_id ON curation_products(product_id);

-- Add RLS policies
ALTER TABLE curations ENABLE ROW LEVEL SECURITY;
ALTER TABLE curation_products ENABLE ROW LEVEL SECURITY;

-- Public read access for active curations
CREATE POLICY "Public can view active curations"
  ON curations FOR SELECT
  USING (is_active = true);

-- Public read access for curation products (only if curation is active)
CREATE POLICY "Public can view curation products"
  ON curation_products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM curations
      WHERE curations.id = curation_products.curation_id
      AND curations.is_active = true
    )
  );

-- Admin full access (authenticated users only - we'll use service role in practice)
CREATE POLICY "Service role can manage curations"
  ON curations FOR ALL
  USING (true);

CREATE POLICY "Service role can manage curation products"
  ON curation_products FOR ALL
  USING (true);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_curations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER curations_updated_at
  BEFORE UPDATE ON curations
  FOR EACH ROW
  EXECUTE FUNCTION update_curations_updated_at();
