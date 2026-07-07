# Category Cleanup Worksheet

Findings from the 2026-07-07 duplicate-category investigation, for Stephen to
action in the admin UI. **No production data was changed** — these are
recommendations requiring a human decision per product.

## Background

The original CSV importer created a separate category row for each
(category, parent) combination it inferred, so 13 category names exist as 2-3
rows each under different parents (28 rows total). Each set has one dominant row
(most products) and 1-2 "satellite" rows with 1-2 products.

**A mechanical "merge into the biggest row" was considered and rejected** — the
biggest row is often *not* the semantically correct home (e.g. the dominant
"Fire Starters & Fuel" is under Tools & Hardware, but the actual products are a
camping stove and a smoker that correctly live under Outdoor & Camping). Merging
would have corrupted categorization.

**Already shipped (safe, no data change):** category pages with < 3 products are
now `noindex,follow` and excluded from the sitemap, so these thin satellite
pages no longer dilute search. This worksheet is only about optionally
*recategorizing* the 16 straggler products for a cleaner taxonomy.

## The 16 straggler products

Legend: **MOVE** = clearly misfiled, reassign to the dominant category ·
**KEEP** = satellite placement is actually fine/better, leave it ·
**DECIDE** = genuine judgment call, no obviously-right home.

| Product | Currently in | Dominant same-name home | Rec | Reasoning |
|---|---|---|---|---|
| Invader Wet Mop Handle | Tools › Cleaning Tools | Home & Kitchen › Cleaning Tools | **MOVE** | A mop handle is a household cleaning tool |
| Carbondale Safety Glasses | Tools › Eyewear | Footwear & Acc › Eyewear | **KEEP** | Safety glasses are PPE; Tools fits better than fashion eyewear |
| Gas Camping Stove | Outdoor › Fire Starters & Fuel | Tools › Fire Starters & Fuel | **KEEP** | Camping stove belongs in Outdoor, not Tools |
| Smokey Mountain Smoker | Outdoor › Fire Starters & Fuel | Tools › Fire Starters & Fuel | **KEEP** | Smoker belongs in Outdoor |
| Picnic Table Kit | Outdoor › Furniture | Home & Kitchen › Furniture | **KEEP** | Outdoor furniture |
| Heli Ski Glove | Outdoor › Hats & Gloves | Clothing › Hats & Gloves | **DECIDE** | Ski glove: apparel or outdoor gear? |
| Ha No Kuromaku Ceramic Whetstone | Tools › Knives & Cutting Boards | Home & Kitchen › Knives & Cutting Boards | **KEEP** | A whetstone isn't a knife/board; sharpening tool fits Tools |
| Heavy Duty Light Stand w/ Casters | Electronics › Lighting | Outdoor › Lighting | **KEEP** | Studio light stand, not camping lighting |
| Datavac Air Duster / Computer Cleaner | Electronics › Maintenance & Repair Kits | Tools › Maintenance & Repair Kits | **KEEP** | Computer cleaner belongs in Electronics |
| Gemini 20 Precision Milligram Scale | Home & Kitchen › Measuring Tools | Tools › Measuring Tools | **DECIDE** | Precision scale: kitchen or hardware? |
| Steel Watering Can | Outdoor › Reusables & Zero Waste | Home & Kitchen › Reusables & Zero Waste | **DECIDE** | Neither home is great; consider a Garden category |
| LoadOut GoBox | Outdoor › Storage & Containers | Home & Kitchen › Storage & Containers | **KEEP** | Yeti outdoor gear box |
| Aluminum 3 Ring Binder | Tools › Storage & Containers | Home & Kitchen › Storage & Containers | **DECIDE** | Office item; consider Office Equipment |
| Insulated Travel Mug | Home & Kitchen › Travel Bottles & Flasks | Outdoor › Travel Bottles & Flasks | **DECIDE** | Travel or kitchen; dominant "Outdoor" itself questionable |
| Heritage Classic Vacuum Bottle | Travel & EDC › Travel Bottles & Flasks | Outdoor › Travel Bottles & Flasks | **KEEP** | Travel & EDC is a fine home |
| Garden Hose | Outdoor › Utility Equipment | Tools › Utility Equipment | **KEEP** | Garden hose belongs in Outdoor |

**Summary:** 1 clear MOVE, 10 KEEP (satellite is correct — do nothing), 5 DECIDE.

## Suggested actions

1. **Move the mop handle** to Home & Kitchen › Cleaning Tools (1 product, admin edit).
2. **The 5 DECIDE items** — pick a home in admin when convenient; low SEO stakes.
3. **After any moves**, delete the now-empty satellite category rows so they stop
   generating (noindexed but still crawlable) thin pages. Only delete a category
   once it has 0 products — the brands/categories admin already blocks deleting a
   category with products.
4. **Bigger opportunity (separate pass):** the "dominant" bulk categories may also
   contain misfiled products from the same import. A spot-check of the largest
   categories (Cookware & Bakeware 51, Hand Tools 26) would catch any strays. Not
   urgent — the noindex fix already protects search quality.
