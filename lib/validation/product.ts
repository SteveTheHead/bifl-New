import { z } from 'zod'

/**
 * Allow-list of admin-editable product fields (audit H9 — the PUT route
 * previously spread the entire request body straight into the row, letting a
 * caller set id/created_at/any column). .strict() rejects unknown keys.
 *
 * Scores are 0-10 to match the published methodology. Everything is optional so
 * the same schema serves create (with a required-field check in the route) and
 * partial update.
 */
const score = z.number().min(0).max(10).nullable().optional()

export const productWriteSchema = z
  .object({
    name: z.string().trim().min(1).max(300).optional(),
    slug: z
      .string()
      .trim()
      .min(1)
      .max(300)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens')
      .optional(),
    brand_id: z.string().uuid().nullable().optional(),
    category_id: z.string().uuid().nullable().optional(),
    primary_material_id: z.string().uuid().nullable().optional(),

    excerpt: z.string().max(2000).nullable().optional(),
    description: z.string().max(20000).nullable().optional(),
    optimized_product_description: z.string().max(20000).nullable().optional(),
    price: z.number().min(0).max(1_000_000).nullable().optional(),
    featured_image_url: z.string().max(2000).nullable().optional(),
    gallery_images: z.array(z.string().max(2000)).max(50).optional(),

    bifl_total_score: score,
    durability_score: score,
    repairability_score: score,
    sustainability_score: score,
    social_score: score,
    warranty_score: score,

    dimensions: z.string().max(500).nullable().optional(),
    weight: z.string().max(200).nullable().optional(),
    lifespan_expectation: z.string().max(500).nullable().optional(),
    warranty_years: z.number().int().min(0).max(200).nullable().optional(),
    country_of_origin: z.string().max(200).nullable().optional(),
    use_case: z.string().max(2000).nullable().optional(),

    affiliate_link: z.string().max(2000).nullable().optional(),
    manufacturer_link: z.string().max(2000).nullable().optional(),

    verdict_summary: z.string().max(5000).nullable().optional(),
    verdict_bullets: z.array(z.string().max(1000)).max(50).optional(),
    durability_notes: z.string().max(10000).nullable().optional(),
    repairability_notes: z.string().max(10000).nullable().optional(),
    sustainability_notes: z.string().max(10000).nullable().optional(),
    social_notes: z.string().max(10000).nullable().optional(),
    warranty_notes: z.string().max(10000).nullable().optional(),
    general_notes: z.string().max(10000).nullable().optional(),
    manufacturing_notes: z.string().max(10000).nullable().optional(),
    care_and_maintenance: z.string().max(10000).nullable().optional(),

    meta_title: z.string().max(300).nullable().optional(),
    meta_description: z.string().max(500).nullable().optional(),
    is_featured: z.boolean().optional(),
    status: z.enum(['draft', 'pending', 'published', 'archived']).optional(),
  })
  .strict()

export type ProductWriteInput = z.infer<typeof productWriteSchema>
