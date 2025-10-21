-- Check the actual data type and values stored
SELECT
  name,
  bifl_certification,
  pg_typeof(bifl_certification) as data_type
FROM products
WHERE bifl_certification IS NOT NULL
LIMIT 10;
