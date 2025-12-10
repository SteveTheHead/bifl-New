/**
 * SEO Utility Functions
 * Centralized helpers for generating SEO-compliant titles, descriptions, and metadata
 */

// SEO Character Limits (Google recommended)
export const SEO_LIMITS = {
  TITLE_MAX: 60,
  TITLE_MIN: 30,
  DESCRIPTION_MAX: 155,
  DESCRIPTION_MIN: 120,
} as const

/**
 * Truncates text at word boundary to avoid cut-off words
 * @param text - The text to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to add when truncated (default: '...')
 */
export function truncateAtWordBoundary(
  text: string,
  maxLength: number,
  suffix: string = '...'
): string {
  if (!text) return ''
  if (text.length <= maxLength) return text

  const truncateAt = maxLength - suffix.length
  const truncated = text.substring(0, truncateAt)
  // Remove partial word at the end
  const lastSpace = truncated.lastIndexOf(' ')
  if (lastSpace > truncateAt * 0.7) {
    return truncated.substring(0, lastSpace) + suffix
  }
  return truncated + suffix
}

/**
 * Generates an SEO-compliant title
 * @param parts - Title parts to combine
 * @param options - Options for title generation
 */
export function generateTitle(
  parts: string[],
  options: {
    separator?: string
    suffix?: string
    maxLength?: number
  } = {}
): string {
  const {
    separator = ' - ',
    suffix = '',
    maxLength = SEO_LIMITS.TITLE_MAX
  } = options

  // Filter empty parts and join
  const filteredParts = parts.filter(Boolean)
  let title = filteredParts.join(separator)

  // Add suffix if provided and space permits
  if (suffix && title.length + separator.length + suffix.length <= maxLength) {
    title = title + separator + suffix
  }

  // Truncate if needed
  if (title.length > maxLength) {
    return truncateAtWordBoundary(title, maxLength)
  }

  return title
}

/**
 * Generates an SEO-compliant meta description
 * @param text - The description text
 * @param options - Options for description generation
 */
export function generateDescription(
  text: string,
  options: {
    maxLength?: number
    minLength?: number
    fallback?: string
  } = {}
): string {
  const {
    maxLength = SEO_LIMITS.DESCRIPTION_MAX,
    minLength = SEO_LIMITS.DESCRIPTION_MIN,
    fallback = ''
  } = options

  if (!text || text.trim().length === 0) {
    return fallback ? truncateAtWordBoundary(fallback, maxLength) : ''
  }

  // Clean up the text (remove extra whitespace, newlines)
  const cleaned = text.replace(/\s+/g, ' ').trim()

  // If too short, use fallback or pad with additional info
  if (cleaned.length < minLength && fallback) {
    const combined = `${cleaned} ${fallback}`.trim()
    return truncateAtWordBoundary(combined, maxLength)
  }

  return truncateAtWordBoundary(cleaned, maxLength)
}

// ============================================
// Product Page SEO Helpers
// ============================================

export interface ProductSEOInput {
  name: string
  brandName?: string
  categoryName?: string
  biflScore?: number
  verdictSummary?: string
  excerpt?: string
}

/**
 * Generates SEO title for product pages
 * Target: "{Product Name} - {Brand} | BIFL" (under 60 chars)
 */
export function generateProductTitle(product: ProductSEOInput): string {
  const { name, brandName, biflScore } = product

  // Try full title first: "Product Name Review - Brand | BIFL"
  const scoreText = biflScore ? ` ${biflScore.toFixed(1)}/10` : ''

  // Priority order for fitting in 60 chars:
  // 1. "{Name} Review - BIFL Score {X}/10 | BIFL" (if fits)
  // 2. "{Name} - {Brand} | Buy It For Life" (if fits)
  // 3. "{Name} Review | Buy It For Life"
  // 4. "{Name} | BIFL"

  const templates = [
    `${name} Review${scoreText} | Buy It For Life`,
    brandName ? `${name} - ${brandName} | BIFL` : null,
    `${name} Review | BIFL`,
    `${name} | BIFL`,
  ].filter(Boolean) as string[]

  for (const template of templates) {
    if (template.length <= SEO_LIMITS.TITLE_MAX) {
      return template
    }
  }

  // Last resort: truncate
  return truncateAtWordBoundary(name, SEO_LIMITS.TITLE_MAX - 7) + ' | BIFL'
}

/**
 * Generates SEO description for product pages
 */
export function generateProductDescription(product: ProductSEOInput): string {
  const { name, brandName, biflScore, verdictSummary, excerpt } = product

  const scoreText = biflScore ? `BIFL Score: ${biflScore.toFixed(1)}/10. ` : ''
  const brandText = brandName ? `${name} by ${brandName}. ` : `${name}. `

  // Try verdict summary first, then excerpt
  const mainText = verdictSummary || excerpt || ''

  const fullDescription = `${brandText}${scoreText}${mainText}`.trim()

  // Ensure minimum length with fallback
  const fallback = 'Expert review of durability, repairability, and warranty. Find products built to last a lifetime.'

  return generateDescription(fullDescription, { fallback })
}

// ============================================
// Category Page SEO Helpers
// ============================================

export interface CategorySEOInput {
  name: string
  description?: string
  productCount?: number
}

/**
 * Generates SEO title for category pages
 * Target: "Best {Category} {Year} - BIFL Guide" (under 60 chars)
 */
export function generateCategoryTitle(category: CategorySEOInput): string {
  const { name } = category
  const year = new Date().getFullYear()

  const templates = [
    `Best ${name} ${year} - BIFL Buying Guide`,
    `Best ${name} ${year} | Buy It For Life`,
    `Best ${name} - BIFL Guide ${year}`,
    `${name} - BIFL Guide`,
    `Best ${name} | BIFL`,
  ]

  for (const template of templates) {
    if (template.length <= SEO_LIMITS.TITLE_MAX) {
      return template
    }
  }

  return truncateAtWordBoundary(`Best ${name}`, SEO_LIMITS.TITLE_MAX - 7) + ' | BIFL'
}

/**
 * Generates SEO description for category pages
 */
export function generateCategoryDescription(category: CategorySEOInput): string {
  const { name, description, productCount } = category
  const nameLower = name.toLowerCase()

  // If custom description exists and is good length, use it
  if (description && description.length >= SEO_LIMITS.DESCRIPTION_MIN) {
    return generateDescription(description)
  }

  // Generate description
  const countText = productCount ? `${productCount} top-rated` : 'the best'
  const fullDescription = `Discover ${countText} ${nameLower} products built to last. Expert BIFL reviews on durability, repairability, and warranty. Find quality ${nameLower} worth buying once.`

  return generateDescription(fullDescription)
}

// ============================================
// Guide Page SEO Helpers
// ============================================

export interface GuideSEOInput {
  title: string
  metaTitle?: string
  metaDescription?: string
  introContent?: string
}

/**
 * Generates SEO title for guide pages
 */
export function generateGuideTitle(guide: GuideSEOInput): string {
  // Use custom meta_title if provided and valid length
  if (guide.metaTitle && guide.metaTitle.length <= SEO_LIMITS.TITLE_MAX) {
    return guide.metaTitle
  }

  const templates = [
    `${guide.title} | Buy It For Life`,
    `${guide.title} - BIFL Guide`,
    guide.title,
  ]

  for (const template of templates) {
    if (template.length <= SEO_LIMITS.TITLE_MAX) {
      return template
    }
  }

  return truncateAtWordBoundary(guide.title, SEO_LIMITS.TITLE_MAX)
}

/**
 * Generates SEO description for guide pages
 */
export function generateGuideDescription(guide: GuideSEOInput): string {
  // Use custom meta_description if provided and valid length
  if (guide.metaDescription && guide.metaDescription.length >= SEO_LIMITS.DESCRIPTION_MIN) {
    return generateDescription(guide.metaDescription)
  }

  // Use intro content as fallback
  if (guide.introContent) {
    return generateDescription(guide.introContent)
  }

  // Last resort fallback
  return generateDescription(
    `${guide.title}. Expert buying guide with top product recommendations and reviews.`
  )
}

// ============================================
// Curation Page SEO Helpers
// ============================================

export interface CurationSEOInput {
  name: string
  description?: string
  productCount?: number
}

/**
 * Generates SEO title for curation pages
 */
export function generateCurationTitle(curation: CurationSEOInput): string {
  const { name } = curation

  const templates = [
    `${name} - Curated Collection | BIFL`,
    `${name} | Buy It For Life`,
    `${name} - BIFL Collection`,
  ]

  for (const template of templates) {
    if (template.length <= SEO_LIMITS.TITLE_MAX) {
      return template
    }
  }

  return truncateAtWordBoundary(name, SEO_LIMITS.TITLE_MAX - 7) + ' | BIFL'
}

/**
 * Generates SEO description for curation pages
 */
export function generateCurationDescription(curation: CurationSEOInput): string {
  const { name, description, productCount } = curation

  if (description && description.length >= SEO_LIMITS.DESCRIPTION_MIN) {
    return generateDescription(description)
  }

  const countText = productCount ? `${productCount} hand-picked` : 'hand-picked'
  const fullDescription = description
    ? `${description} Featuring ${countText} durable products built to last.`
    : `Explore our ${name} collection. ${countText} durable products reviewed for quality, longevity, and value.`

  return generateDescription(fullDescription)
}

// ============================================
// Open Graph Helpers
// ============================================

export interface OpenGraphInput {
  title: string
  description: string
  url: string
  image?: string
  type?: 'website' | 'article'
  siteName?: string
}

/**
 * Generates OpenGraph metadata object
 */
export function generateOpenGraph(input: OpenGraphInput) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.buyitforlifeproducts.com'

  return {
    title: truncateAtWordBoundary(input.title, 70), // OG titles can be slightly longer
    description: truncateAtWordBoundary(input.description, 200), // OG descriptions can be longer
    url: input.url,
    siteName: input.siteName || 'Buy It For Life',
    type: input.type || 'website',
    ...(input.image && {
      images: [{
        url: input.image.startsWith('http') ? input.image : `${baseUrl}${input.image}`,
        width: 1200,
        height: 630,
        alt: input.title,
      }]
    }),
  }
}

/**
 * Generates Twitter card metadata
 */
export function generateTwitterCard(input: {
  title: string
  description: string
  image?: string
}) {
  return {
    card: 'summary_large_image' as const,
    title: truncateAtWordBoundary(input.title, 70),
    description: truncateAtWordBoundary(input.description, 200),
    ...(input.image && { images: [input.image] }),
  }
}
