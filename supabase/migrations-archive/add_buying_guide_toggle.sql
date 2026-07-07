-- Add show_buying_guide column to categories table
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS show_buying_guide BOOLEAN DEFAULT false;

-- Set all existing categories to false (buying guides hidden by default)
UPDATE categories
SET show_buying_guide = false;
