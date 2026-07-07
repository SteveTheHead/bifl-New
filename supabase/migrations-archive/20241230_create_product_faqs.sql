-- Create product_faqs table for frequently asked questions per product
CREATE TABLE IF NOT EXISTS public.product_faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_product_faqs_product_id ON public.product_faqs(product_id);
CREATE INDEX IF NOT EXISTS idx_product_faqs_display_order ON public.product_faqs(display_order);
CREATE INDEX IF NOT EXISTS idx_product_faqs_active ON public.product_faqs(is_active);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_product_faqs_updated_at
    BEFORE UPDATE ON public.product_faqs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample FAQs for testing
INSERT INTO public.product_faqs (product_id, question, answer, display_order)
SELECT
  p.id as product_id,
  'How long does this product typically last?' as question,
  'Based on user reviews and testing, this product typically lasts ' || COALESCE(p.lifespan_expectation::text || ' years', 'many years') || ' with proper care and maintenance.' as answer,
  1 as display_order
FROM public.products p
WHERE p.status = 'published'
LIMIT 5;

INSERT INTO public.product_faqs (product_id, question, answer, display_order)
SELECT
  p.id as product_id,
  'Is this product repairable?' as question,
  CASE
    WHEN p.repairability_score >= 8 THEN 'Yes, this product is highly repairable with readily available parts and service documentation.'
    WHEN p.repairability_score >= 6 THEN 'Yes, this product can be repaired, though some specialized knowledge may be required.'
    WHEN p.repairability_score >= 4 THEN 'Partial repairability - some components can be fixed but others may require professional service.'
    ELSE 'Limited repairability - most issues require professional service or replacement.'
  END as answer,
  2 as display_order
FROM public.products p
WHERE p.status = 'published'
LIMIT 5;

INSERT INTO public.product_faqs (product_id, question, answer, display_order)
SELECT
  p.id as product_id,
  'What warranty does this product come with?' as question,
  CASE
    WHEN p.warranty_years IS NOT NULL THEN 'This product comes with a ' || p.warranty_years || '-year warranty covering manufacturing defects.'
    ELSE 'Please check with the manufacturer for specific warranty information.'
  END as answer,
  3 as display_order
FROM public.products p
WHERE p.status = 'published'
LIMIT 5;

INSERT INTO public.product_faqs (product_id, question, answer, display_order)
SELECT
  p.id as product_id,
  'Where is this product made?' as question,
  CASE
    WHEN p.country_of_origin IS NOT NULL THEN 'This product is manufactured in ' || p.country_of_origin || '.'
    ELSE 'Please check with the manufacturer for country of origin information.'
  END as answer,
  4 as display_order
FROM public.products p
WHERE p.status = 'published'
LIMIT 5;

INSERT INTO public.product_faqs (product_id, question, answer, display_order)
SELECT
  p.id as product_id,
  'How does this product compare to similar items?' as question,
  'This product scores ' || COALESCE(p.bifl_total_score::text, 'well') || ' in our BIFL rating system, taking into account durability, repairability, warranty, and social factors. Check our comparison section for detailed analysis against similar products.' as answer,
  5 as display_order
FROM public.products p
WHERE p.status = 'published'
LIMIT 5;

-- Enable RLS (Row Level Security) for the table if needed
-- ALTER TABLE public.product_faqs ENABLE ROW LEVEL SECURITY;