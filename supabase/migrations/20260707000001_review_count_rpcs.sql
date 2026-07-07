-- The reviews UI (components/reviews/reviews-list.tsx) has been calling
-- increment_helpful_count / increment_report_count since launch, but neither
-- function ever existed in the database, so the "Helpful" and "Report" buttons
-- silently failed. Discovered 2026-07-07 when generated types replaced the
-- hand-maintained ones. This migration creates the two functions.

CREATE OR REPLACE FUNCTION public.increment_helpful_count(review_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE reviews
  SET helpful_count = COALESCE(helpful_count, 0) + 1
  WHERE id = review_id;
$$;

CREATE OR REPLACE FUNCTION public.increment_report_count(review_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE reviews
  SET reported_count = COALESCE(reported_count, 0) + 1
  WHERE id = review_id;
$$;

GRANT EXECUTE ON FUNCTION public.increment_helpful_count(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_report_count(uuid) TO anon, authenticated;
