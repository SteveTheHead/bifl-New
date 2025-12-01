'use client'

import { useEffect } from 'react'
import { trackGuideView } from '@/lib/analytics'

interface GuideViewTrackerProps {
  guideSlug: string
  guideTitle: string
}

export function GuideViewTracker({ guideSlug, guideTitle }: GuideViewTrackerProps) {
  useEffect(() => {
    trackGuideView(guideSlug, guideTitle)
  }, [guideSlug, guideTitle])

  return null
}
