import { ImageResponse } from 'next/og'
import { createBuildClient } from '@/lib/supabase/server'
import { OgCard, OG_SIZE } from '@/lib/seo/og-template'

export const size = OG_SIZE
export const contentType = 'image/png'
export const alt = 'BIFL product review card'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createBuildClient()

  const { data: product } = await supabase
    .from('products_with_taxonomy')
    .select('name, brand_name, category_name, bifl_total_score')
    .eq('slug', slug)
    .single()

  return new ImageResponse(
    (
      <OgCard
        eyebrow="BIFL Product Review"
        title={product?.name ?? 'Buy It For Life'}
        subtitle={[product?.brand_name, product?.category_name].filter(Boolean).join(' · ')}
        score={product?.bifl_total_score}
      />
    ),
    size
  )
}
