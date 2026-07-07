import { ImageResponse } from 'next/og'
import { createBuildClient } from '@/lib/supabase/server'
import { OgCard, OG_SIZE } from '@/lib/seo/og-template'

export const size = OG_SIZE
export const contentType = 'image/png'
export const alt = 'BIFL curated collection card'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createBuildClient()

  const { data: curation } = await supabase
    .from('curations')
    .select('name, description')
    .eq('slug', slug)
    .single()

  return new ImageResponse(
    (
      <OgCard
        eyebrow="Curated Collection"
        title={curation?.name ?? 'BIFL Collections'}
        subtitle={curation?.description ?? undefined}
      />
    ),
    size
  )
}
