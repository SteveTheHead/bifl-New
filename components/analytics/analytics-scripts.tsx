'use client'

import { GoogleAnalytics } from './google-analytics'
import { MicrosoftClarity } from './microsoft-clarity'
import { useConsent } from './consent-context'

/**
 * Loads the cookie-setting analytics (GA4 + Microsoft Clarity) only after the
 * visitor has granted consent. Until then nothing is injected, so no analytics
 * cookies or session-replay scripts run. Vercel Analytics / Speed Insights are
 * cookieless and handled separately in the layout.
 */
export function AnalyticsScripts({
  gaMeasurementId,
  clarityProjectId,
}: {
  gaMeasurementId: string
  clarityProjectId: string
}) {
  const { consent } = useConsent()

  if (consent !== 'granted') return null

  return (
    <>
      <GoogleAnalytics measurementId={gaMeasurementId} />
      <MicrosoftClarity projectId={clarityProjectId} />
    </>
  )
}
