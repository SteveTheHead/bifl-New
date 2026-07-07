import { ImageResponse } from 'next/og'
import { createBuildClient } from '@/lib/supabase/server'
import { OgCard, OG_SIZE } from '@/lib/seo/og-template'

export const size = OG_SIZE
export const contentType = 'image/png'
export const alt = 'BIFL category card'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createBuildClient()

  const { data: category } = await supabase
    .from('categories')
    .select('id, name')
    .eq('slug', slug)
    .single()

  let subtitle = 'Durable products, scored and verified'
  if (category) {
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', category.id)
      .eq('status', 'published')
    if (count) subtitle = `${count} products rated on durability, repairability, and warranty`
  }

  return new ImageResponse(
    (
      <OgCard
        eyebrow="Best BIFL Products"
        title={category?.name ?? 'Buy It For Life'}
        subtitle={subtitle}
      />
    ),
    size
  )
}
