-- Setup hierarchical categories
-- Step 1: Add parent_id column to categories table
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES categories(id);

-- Step 2: Add comment
COMMENT ON COLUMN categories.parent_id IS 'Reference to parent category for hierarchical structure. NULL for top-level categories.';

-- Step 3: Delete all existing categories and products
DELETE FROM products;
DELETE FROM categories;

-- Step 4: Insert the 8 main categories
INSERT INTO categories (id, name, slug, is_featured, display_order, parent_id) VALUES
('11111111-1111-1111-1111-111111111111', 'Automotive & Cycling', 'automotive-cycling', false, 1, NULL),
('22222222-2222-2222-2222-222222222222', 'Clothing & Apparel', 'clothing-apparel', false, 2, NULL),
('33333333-3333-3333-3333-333333333333', 'Electronics & Tech', 'electronics-tech', false, 3, NULL),
('44444444-4444-4444-4444-444444444444', 'Footwear & Accessories', 'footwear-accessories', false, 4, NULL),
('55555555-5555-5555-5555-555555555555', 'Home & Kitchen', 'home-kitchen', false, 5, NULL),
('66666666-6666-6666-6666-666666666666', 'Outdoor & Camping', 'outdoor-camping', false, 6, NULL),
('77777777-7777-7777-7777-777777777777', 'Tools & Hardware', 'tools-hardware', false, 7, NULL),
('88888888-8888-8888-8888-888888888888', 'Travel & Everyday Carry', 'travel-everyday-carry', false, 8, NULL);

-- Step 5: Insert subcategories for Automotive & Cycling
INSERT INTO categories (name, slug, is_featured, display_order, parent_id) VALUES
('Bike Tools & Accessories', 'bike-tools-accessories', false, 1, '11111111-1111-1111-1111-111111111111'),
('Car Emergency Kits', 'car-emergency-kits', false, 2, '11111111-1111-1111-1111-111111111111'),
('Racks & Mounts', 'racks-mounts', false, 3, '11111111-1111-1111-1111-111111111111'),
('Tires & Tubes', 'tires-tubes', false, 4, '11111111-1111-1111-1111-111111111111');

-- Step 6: Insert subcategories for Clothing & Apparel
INSERT INTO categories (name, slug, is_featured, display_order, parent_id) VALUES
('Hats & Gloves', 'hats-gloves-apparel', false, 1, '22222222-2222-2222-2222-222222222222'),
('Rain Gear', 'rain-gear', false, 2, '22222222-2222-2222-2222-222222222222'),
('Underwear & Base Layers', 'underwear-base-layers', false, 3, '22222222-2222-2222-2222-222222222222'),
('Workwear', 'workwear', false, 4, '22222222-2222-2222-2222-222222222222');

-- Step 7: Insert subcategories for Electronics & Tech
INSERT INTO categories (name, slug, is_featured, display_order, parent_id) VALUES
('Cables & Chargers', 'cables-chargers', false, 1, '33333333-3333-3333-3333-333333333333'),
('Cameras & Accessories', 'cameras-accessories', false, 2, '33333333-3333-3333-3333-333333333333'),
('Flashlights', 'flashlights-electronics', false, 3, '33333333-3333-3333-3333-333333333333'),
('Headphones', 'headphones', false, 4, '33333333-3333-3333-3333-333333333333'),
('Laptops & Accessories', 'laptops-accessories', false, 5, '33333333-3333-3333-3333-333333333333'),
('Lighting', 'lighting-electronics', false, 6, '33333333-3333-3333-3333-333333333333'),
('Maintenance & Repair Kits', 'maintenance-repair-kits-electronics', false, 7, '33333333-3333-3333-3333-333333333333'),
('Power Banks', 'power-banks', false, 8, '33333333-3333-3333-3333-333333333333'),
('Radios & Emergency Gear', 'radios-emergency-gear', false, 9, '33333333-3333-3333-3333-333333333333');

-- Step 8: Insert subcategories for Footwear & Accessories
INSERT INTO categories (name, slug, is_featured, display_order, parent_id) VALUES
('Boots', 'boots', false, 1, '44444444-4444-4444-4444-444444444444'),
('Casual Shoes', 'casual-shoes', false, 2, '44444444-4444-4444-4444-444444444444'),
('Eyewear', 'eyewear-footwear', false, 3, '44444444-4444-4444-4444-444444444444'),
('Sandals', 'sandals', false, 4, '44444444-4444-4444-4444-444444444444');

-- Step 9: Insert subcategories for Home & Kitchen
INSERT INTO categories (name, slug, is_featured, display_order, parent_id) VALUES
('Cleaning Tools', 'cleaning-tools-home', false, 1, '55555555-5555-5555-5555-555555555555'),
('Cookware', 'cookware', false, 2, '55555555-5555-5555-5555-555555555555'),
('Cookware & Bakeware', 'cookware-bakeware', false, 3, '55555555-5555-5555-5555-555555555555'),
('Furniture', 'furniture-home', false, 4, '55555555-5555-5555-5555-555555555555'),
('Knives & Cutting Boards', 'knives-cutting-boards-home', false, 5, '55555555-5555-5555-5555-555555555555'),
('Measuring Tools', 'measuring-tools-home', false, 6, '55555555-5555-5555-5555-555555555555'),
('Office Equipment', 'office-equipment', false, 7, '55555555-5555-5555-5555-555555555555'),
('Reusables & Zero Waste', 'reusables-zero-waste-home', false, 8, '55555555-5555-5555-5555-555555555555'),
('Storage & Containers', 'storage-containers-home', false, 9, '55555555-5555-5555-5555-555555555555'),
('Strength Training Equipment', 'strength-training-equipment', false, 10, '55555555-5555-5555-5555-555555555555'),
('Travel Bottles & Flasks', 'travel-bottles-flasks-home', false, 11, '55555555-5555-5555-5555-555555555555');

-- Step 10: Insert subcategories for Outdoor & Camping
INSERT INTO categories (name, slug, is_featured, display_order, parent_id) VALUES
('Camping Furniture', 'camping-furniture', false, 1, '66666666-6666-6666-6666-666666666666'),
('Fire Starters & Fuel', 'fire-starters-fuel-outdoor', false, 2, '66666666-6666-6666-6666-666666666666'),
('Furniture', 'furniture-outdoor', false, 3, '66666666-6666-6666-6666-666666666666'),
('Hats & Gloves', 'hats-gloves-outdoor', false, 4, '66666666-6666-6666-6666-666666666666'),
('Lighting', 'lighting-outdoor', false, 5, '66666666-6666-6666-6666-666666666666'),
('Reusables & Zero Waste', 'reusables-zero-waste-outdoor', false, 6, '66666666-6666-6666-6666-666666666666'),
('Sleeping Bags & Pads', 'sleeping-bags-pads', false, 7, '66666666-6666-6666-6666-666666666666'),
('Storage & Containers', 'storage-containers-outdoor', false, 8, '66666666-6666-6666-6666-666666666666'),
('Survival Gear', 'survival-gear', false, 9, '66666666-6666-6666-6666-666666666666'),
('Tents & Shelters', 'tents-shelters', false, 10, '66666666-6666-6666-6666-666666666666'),
('Travel Bottles & Flasks', 'travel-bottles-flasks-outdoor', false, 11, '66666666-6666-6666-6666-666666666666'),
('Utility Equipment', 'utility-equipment-outdoor', false, 12, '66666666-6666-6666-6666-666666666666');

-- Step 11: Insert subcategories for Tools & Hardware
INSERT INTO categories (name, slug, is_featured, display_order, parent_id) VALUES
('Cleaning Tools', 'cleaning-tools-hardware', false, 1, '77777777-7777-7777-7777-777777777777'),
('Eyewear', 'eyewear-hardware', false, 2, '77777777-7777-7777-7777-777777777777'),
('Fire Starters & Fuel', 'fire-starters-fuel-hardware', false, 3, '77777777-7777-7777-7777-777777777777'),
('Hand Tools', 'hand-tools', false, 4, '77777777-7777-7777-7777-777777777777'),
('Knives & Cutting Boards', 'knives-cutting-boards-hardware', false, 5, '77777777-7777-7777-7777-777777777777'),
('Locks & Security', 'locks-security', false, 6, '77777777-7777-7777-7777-777777777777'),
('Maintenance & Repair Kits', 'maintenance-repair-kits-hardware', false, 7, '77777777-7777-7777-7777-777777777777'),
('Measuring Tools', 'measuring-tools-hardware', false, 8, '77777777-7777-7777-7777-777777777777'),
('Multi-tools', 'multi-tools', false, 9, '77777777-7777-7777-7777-777777777777'),
('Power Tools', 'power-tools', false, 10, '77777777-7777-7777-7777-777777777777'),
('Storage & Containers', 'storage-containers-hardware', false, 11, '77777777-7777-7777-7777-777777777777'),
('Utility Equipment', 'utility-equipment-hardware', false, 12, '77777777-7777-7777-7777-777777777777');

-- Step 12: Insert subcategories for Travel & Everyday Carry
INSERT INTO categories (name, slug, is_featured, display_order, parent_id) VALUES
('Backpacks', 'backpacks', false, 1, '88888888-8888-8888-8888-888888888888'),
('Packing Cubes', 'packing-cubes', false, 2, '88888888-8888-8888-8888-888888888888'),
('Packing Cubes & Pouches', 'packing-cubes-pouches', false, 3, '88888888-8888-8888-8888-888888888888'),
('Travel Bottles & Flasks', 'travel-bottles-flasks-travel', false, 4, '88888888-8888-8888-8888-888888888888'),
('Wallets', 'wallets', false, 5, '88888888-8888-8888-8888-888888888888');

-- Step 13: Add bifl_certification column
ALTER TABLE products
ADD COLUMN IF NOT EXISTS bifl_certification text[];

COMMENT ON COLUMN products.bifl_certification IS 'Array of BIFL badges/certifications for the product';
