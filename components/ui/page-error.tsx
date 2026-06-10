'use client'

import { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'

/**
 * Shared route-level error boundary UI. Rendered by each segment's `error.tsx`.
 * Logs the error once and offers a retry that calls Next's `reset()`.
 */
export function PageError({
  error,
  reset,
  title = 'Something went wrong',
}: {
  error: Error & { digest?: string }
  reset: () => void
  title?: string
}) {
  useEffect(() => {
    console.error('Route error boundary:', error)
  }, [error])

  return (
    <div className="min-h-[60vh] bg-brand-cream flex items-center justify-center px-4">
      <Card className="border-score-red bg-white shadow-lg rounded-2xl max-w-md w-full">
        <CardContent className="p-10 text-center">
          <h2 className="text-xl font-bold text-score-red mb-2">{title}</h2>
          <p className="text-brand-gray text-sm mb-6">
            This page hit an unexpected error. You can try again, and if it keeps
            happening it&apos;s on our side.
          </p>
          <button
            onClick={reset}
            className="inline-flex items-center justify-center rounded-lg bg-brand-dark px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            Try again
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
