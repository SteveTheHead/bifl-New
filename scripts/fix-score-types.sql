-- Update score columns to accept decimal values instead of integers
-- This allows scores like 8.5, 7.5, etc. from the CSV data

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