# Archived migrations

These are the original piecemeal migrations written before 2026-07-07. They were
applied to the production database by hand (via Supabase Studio / SQL editor)
and are kept here for history only.

**Do not apply these to a fresh database.** Their effects are already included in
`../migrations/20260707000000_baseline_schema.sql`, which was dumped from the
live production schema and is the canonical starting point. Applying these on
top of the baseline would fail on duplicate objects.

New schema changes go in `../migrations/` as timestamped files after the baseline.
