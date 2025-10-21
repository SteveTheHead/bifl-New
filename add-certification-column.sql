-- Add bifl_certification column to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS bifl_certification text[];

-- Add comment
COMMENT ON COLUMN products.bifl_certification IS 'Array of BIFL badges/certifications for the product';
