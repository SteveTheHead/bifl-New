-- Cache generated category buying guides.
--
-- The public GET /api/categories/[slug]/buying-guide endpoint used to call an
-- LLM on EVERY request (uncapped, attacker-amplifiable cost). These columns let
-- it persist the generated guide and serve the stored copy, regenerating at most
-- ~once/month (or on demand via the admin POST).
--
-- Additive and safe: the public SELECT policy on categories already exposes all
-- columns; writes happen via the service-role client. No data is modified.

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS buying_guide jsonb,
  ADD COLUMN IF NOT EXISTS buying_guide_generated_at timestamptz;
