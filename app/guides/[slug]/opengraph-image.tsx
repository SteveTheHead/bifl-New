import { ImageResponse } from 'next/og'
import { createBuildClient } from '@/lib/supabase/server'
import { OgCard, OG_SIZE } from '@/lib/seo/og-template'

export const size = OG_SIZE
export const contentType = 'image/png'
export const alt = 'BIFL buying guide card'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createBuildClient()

  const { data: guide } = await supabase
    .from('buying_guides')
    .select('title, meta_description')
    .eq('slug', slug)
    .single()

  return new ImageResponse(
    (
      <OgCard
        eyebrow="Buying Guide"
        title={guide?.title ?? 'BIFL Buying Guides'}
        subtitle={guide?.meta_description ?? undefined}
      />
    ),
    size
  )
}
