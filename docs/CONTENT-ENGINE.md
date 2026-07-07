# BIFL Content Growth Engine

A repeatable weekly loop for turning Google Search Console demand into published
content. Set up 2026-07-07 (Phase 6 of the visibility program). Target cadence:
**~1 guide or category upgrade per week** (3-4 hours).

The technical surfaces this relies on all shipped in Phases 2-4: server-rendered
category buying guides, crawlable pagination, ItemList schema, dynamic OG cards,
and the `RelatedGuides` cross-link block on category pages.

---

## The weekly loop

### 1. Pick a target from GSC (20 min)
Google Search Console → **Performance** → **Queries**. Filter:
- Last 28 days
- Position **8-30** (striking distance — page 1-3, room to climb)
- Impressions **> 100** (real demand)
- Sort by impressions descending

Two buckets:
- **Query maps to an existing page** → improve that page (align the H1/title to
  the query, add a section answering it, add internal links). Cheapest wins.
- **No page for the query** → new buying guide (below).

Also scan **Pages** with high impressions + low CTR (< 2%) — usually a title/
meta mismatch, a 5-minute fix.

### 2. Draft (45 min)
For a **category** guide, use the admin AI flow — it regenerates the cached
`categories.buying_guide` jsonb that now renders server-side:
- `POST /api/categories/[slug]/buying-guide` (admin-only) forces a fresh
  generation, or use the admin UI generate button.
- First enable `show_buying_guide = true` on the category.

For a **standalone guide** (`buying_guides` table), use the admin guide
generator (`app/api/admin/ai/generate-guide`).

The AI model is env-configurable (`ANTHROPIC_MODEL` / `OPENAI_MODEL`) — upgrade
without a deploy as better models ship.

### 3. Review + edit + publish (60 min)
**Always human-review before publishing.** Check: factual claims, product picks
match the actual catalog, no hallucinated specs, voice matches the site. Fix in
the admin editor. Set `is_published` / publish.

### 4. Internal-link pass (30 min)
- The category page auto-shows `RelatedGuides` (server-rendered) — confirm the
  new guide appears (it matches on `category_id`, else falls back to latest).
- Link the guide from 3-5 relevant product pages.
- `/guides` index + `sitemap.xml` pick it up automatically (DB-driven).

### 5. Measure (15 min, the following week)
- GSC 28-day comparison on the target query: position + CTR movement.
- Log it in the tracking table below.

---

## Tracking table

| Date | Target query | Action (new guide / improved page) | URL | Start pos | 28-day pos | Notes |
|------|--------------|-------------------------------------|-----|-----------|------------|-------|
| | | | | | | |

---

## Programmatic SEO decision (data pull 2026-07-07, 354 products)

**Verdict: category buying guides are the play. Brand pages and "best under $X"
pages are deferred — not enough depth yet.**

### Category buying guides — DO THESE FIRST
Subcategories with enough products (≥10) for a substantive guide. Enable
`show_buying_guide` and generate a guide for each:

| Subcategory | Products |
|---|---|
| Cookware & Bakeware | 51 |
| Hand Tools | 26 |
| Cleaning Tools | 24 |
| Knives & Cutting Boards | 16 |
| Utility Equipment | 15 |
| Backpacks | 15 (guide already generated) |
| Personal Care & Grooming | 14 |
| Cookware | 13 |
| Survival Gear | 12 |
| Power Tools | 11 |
| Furniture | 11 |

That's ~11 high-value category pages, roughly 11 weeks of content at 1/week.

### Brand pages — DEFER
Only **14 of 274 brands** have ≥3 products (Fiskars 7, Rubbermaid 6, Carhartt 5,
Zojirushi 5, Yeti/Stanley/All-Clad 4, then 3s). Too few to justify a brand-page
template now, and single-product brand pages are thin-content risk. Revisit when
the top brands reach ~5+ products each.

### "Best X under $Y" and material pages — DEFER
Price bands have volume in aggregate (under-$50: 127, $100-250: 87, $50-100: 64)
but per-category-per-band the counts collapse to 2-4 items. Classic thin-content
trap. Revisit at ~700+ products.

### Data-quality flags found during the pull
- **Duplicate category names**: "Cleaning Tools", "Fire Starters & Fuel",
  "Travel Bottles & Flasks", "Measuring Tools", "Storage & Containers" each
  appear as multiple category rows (different ids/parents). Products are split
  across the duplicates, diluting category pages. Worth a dedupe pass.
- **Empty top-level categories**: Electronics & Tech, Footwear & Accessories,
  Clothing & Apparel, Outdoor & Camping, Automotive & Cycling all show 0 direct
  products (everything lives in their subcategories — expected, but the parent
  category pages need the subcategory rollup to not look empty; the /products
  filter already rolls up subcategories, category pages should too).

---

## Guardrails
- Never publish an AI draft unreviewed. The site's whole value is trust.
- Quality + internal linking beats volume at this catalog size. Don't chase 2+/week
  unless GSC shows a deep backlog of striking-distance queries.
- Keep the tracking table honest — kill tactics that don't move position after 8 weeks.
