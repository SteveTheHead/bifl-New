/**
 * Canonical BIFL scoring logic — the single source of truth for score colors,
 * labels, badge styling, and badge calculation.
 *
 * Before this module these were copy-pasted across ~25 components with subtle
 * disagreements (a 7.2 could render yellow in one place and orange in another;
 * one component used a 2-tier color scale, the rest used 5). Everything that
 * displays a score or badge must import from here.
 *
 * The score is a 0-10 scale. Tier boundaries and badge criteria match the
 * published methodology at /scoring-methodology.
 */

export interface ProductScores {
  bifl_total_score?: number | null
  average_score?: number | null // legacy alias for total used by the compare view
  durability_score?: number | null
  repairability_score?: number | null
  warranty_score?: number | null
  sustainability_score?: number | null
  social_score?: number | null
}

/** Tier label boundaries (inclusive lower bound). */
export const SCORE_TIERS = [
  { min: 9.0, label: 'Legend' },
  { min: 8.0, label: 'Excellent' },
  { min: 7.0, label: 'Good' },
  { min: 6.0, label: 'Fair' },
  { min: 0, label: 'Poor' },
] as const

/** CSS gradients, keyed by tier. Mirrors the `.score-field` rules in globals.css. */
export const SCORE_GRADIENTS = {
  perfect: 'linear-gradient(135deg, #00ff00, #00dd00)', // exactly 10.0
  legend: 'linear-gradient(135deg, #00ff88, #00cc66)', // >= 9.0
  excellent: 'linear-gradient(135deg, #a3ffbf, #66ff99)', // >= 8.0
  good: 'linear-gradient(135deg, #fff886, #fbd786)', // >= 7.0
  fair: 'linear-gradient(135deg, #ffb347, #ff9966)', // >= 6.0
  poor: 'linear-gradient(135deg, #ff4c4c, #ff6e7f)', // < 6.0
} as const

/** Short tier label for a score (e.g. 7.2 -> "Good"). */
export function getScoreLabel(score: number | null | undefined): string {
  const s = score ?? 0
  return (SCORE_TIERS.find((t) => s >= t.min) ?? SCORE_TIERS[SCORE_TIERS.length - 1]).label
}

/** Background gradient for a score pill. */
export function getScoreGradient(score: number | null | undefined): string {
  const s = score ?? 0
  if (s === 10.0) return SCORE_GRADIENTS.perfect
  if (s >= 9.0) return SCORE_GRADIENTS.legend
  if (s >= 8.0) return SCORE_GRADIENTS.excellent
  if (s >= 7.0) return SCORE_GRADIENTS.good
  if (s >= 6.0) return SCORE_GRADIENTS.fair
  return SCORE_GRADIENTS.poor
}

/** Readable text color over a score gradient (dark text on the lighter >=6 tiers). */
export function getScoreTextColor(score: number | null | undefined): string {
  return (score ?? 0) >= 6.0 ? '#1a1a1a' : 'white'
}

/**
 * Tailwind background class for a score (used by progress bars / chips that
 * can't use an inline gradient). 5-tier, consistent with getScoreGradient —
 * this replaces the old 2-tier scale in bifl-score.tsx.
 */
export function getScoreTailwindBg(score: number | null | undefined): string {
  const s = score ?? 0
  if (s >= 9.0) return 'bg-emerald-500'
  if (s >= 8.0) return 'bg-green-500'
  if (s >= 7.0) return 'bg-yellow-500'
  if (s >= 6.0) return 'bg-orange-500'
  return 'bg-red-500'
}

/**
 * Props for the CSS-driven score pill: the `.score-field` class + a data-score
 * attribute that globals.css uses to pick the gradient. Returned as a plain
 * object so callers can spread it onto an element.
 */
export function getScoreBadgeStyle(score: number | null | undefined) {
  return {
    className: 'score-field',
    'data-score': (score ?? 0).toString(),
  }
}

/**
 * Earned badges for a product, highest-value first.
 *
 * NOTE: these conditions are the live, rigorous criteria (a Gold Standard
 * requires strong sub-scores, not just a 9.0 total). The /scoring-methodology
 * page documents these same rules.
 */
export function calculateBadges(product: ProductScores | null | undefined): string[] {
  if (!product) return []

  const total = product.bifl_total_score ?? product.average_score ?? 0
  const durability = product.durability_score ?? 0
  const repairability = product.repairability_score ?? 0
  const warranty = product.warranty_score ?? 0
  const sustainability = product.sustainability_score ?? 0
  const social = product.social_score ?? 0

  const badges: string[] = []

  // Gold Standard: top total score backed by strong durability + warranty.
  if (total >= 9.0 && durability >= 8.5 && warranty >= 8.0) {
    badges.push('Gold Standard')
  }
  // Lifetime Warranty: a perfect warranty score.
  if (warranty >= 10.0) {
    badges.push('Lifetime Warranty')
  }
  // Crowd Favorite: strong social consensus.
  if (social >= 8.5) {
    badges.push('Crowd Favorite')
  }
  // Repair Friendly: highly repairable.
  if (repairability >= 8.5) {
    badges.push('Repair Friendly')
  }
  // Eco Hero: strong sustainability.
  if (sustainability >= 8.0) {
    badges.push('Eco Hero')
  }
  // BIFL Approved: a solid all-rounder (only when no higher badge applies).
  if (
    badges.length === 0 &&
    total >= 7.5 &&
    durability >= 7.0 &&
    warranty >= 6.0
  ) {
    badges.push('BIFL Approved')
  }

  return badges
}
