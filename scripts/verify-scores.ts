/**
 * Read-only check: does each product's stored bifl_total_score match the
 * published weighted formula?
 *
 *   BIFL Total = Durability*0.3 + Social*0.3 + Warranty*0.2 + Repairability*0.2
 *   (Sustainability is intentionally excluded — see /scoring-methodology)
 *
 * Reports how many products fall outside a tolerance and shows the worst
 * offenders. SELECT-only; changes nothing.
 *
 *   npx tsx -r dotenv/config scripts/verify-scores.ts dotenv_config_path=.env.local
 */
import postgres from 'postgres'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL not set')
  process.exit(1)
}
const sql = postgres(url, { prepare: false, max: 1, idle_timeout: 5 })

const TOLERANCE = 0.5

async function main() {
  const rows = await sql<
    {
      slug: string
      name: string
      bifl_total_score: number | null
      durability_score: number | null
      social_score: number | null
      warranty_score: number | null
      repairability_score: number | null
    }[]
  >`
    SELECT slug, name, bifl_total_score, durability_score, social_score,
           warranty_score, repairability_score
    FROM products
    WHERE status = 'published'
  `

  let withAllSubscores = 0
  const mismatches: { slug: string; stored: number; computed: number; diff: number }[] = []

  for (const r of rows) {
    const d = r.durability_score
    const s = r.social_score
    const w = r.warranty_score
    const rep = r.repairability_score
    const stored = r.bifl_total_score
    if (d == null || s == null || w == null || rep == null || stored == null) continue
    withAllSubscores++
    const computed = d * 0.3 + s * 0.3 + w * 0.2 + rep * 0.2
    const diff = Math.abs(computed - stored)
    if (diff > TOLERANCE) {
      mismatches.push({ slug: r.slug, stored, computed: Math.round(computed * 100) / 100, diff: Math.round(diff * 100) / 100 })
    }
  }

  mismatches.sort((a, b) => b.diff - a.diff)

  console.log(`Published products: ${rows.length}`)
  console.log(`With all 4 weighted subscores present: ${withAllSubscores}`)
  console.log(`Outside ±${TOLERANCE} of the published formula: ${mismatches.length}`)
  if (withAllSubscores > 0) {
    console.log(`  = ${Math.round((mismatches.length / withAllSubscores) * 1000) / 10}% of scorable products`)
  }
  console.log('\nWorst 15 mismatches (stored vs formula):')
  for (const m of mismatches.slice(0, 15)) {
    console.log(`  ${m.slug.padEnd(45)} stored=${m.stored}  formula=${m.computed}  Δ=${m.diff}`)
  }

  await sql.end({ timeout: 5 })
}

main().catch(async (e) => {
  console.error('VERIFY FAILED:', e?.message || e)
  try { await sql.end({ timeout: 5 }) } catch {}
  process.exit(1)
})
