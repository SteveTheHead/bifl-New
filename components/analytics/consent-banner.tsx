'use client'

import Link from 'next/link'
import { useConsent } from './consent-context'

/**
 * Bottom cookie-consent banner. Shows only until the visitor makes a choice.
 * Copy is intentionally plain — edit freely.
 */
export function ConsentBanner() {
  const { consent, ready, setConsent } = useConsent()

  // Only render once we know there's no prior decision (avoids a flash on
  // every load for returning visitors and any SSR mismatch).
  if (!ready || consent !== null) return null

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-gray-200 bg-white shadow-[0_-2px_12px_rgba(0,0,0,0.06)]"
    >
      <div className="container mx-auto flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-brand-gray">
          We use analytics cookies to understand how the site is used and improve it. They
          stay off until you accept. See our{' '}
          <Link href="/privacy-policy" className="text-brand-teal underline hover:no-underline">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setConsent('denied')}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-brand-gray transition-colors hover:bg-gray-50"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => setConsent('granted')}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#4A9D93' }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
