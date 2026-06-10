/**
 * Shared route-level loading UI. Rendered by each segment's `loading.tsx`
 * via Next's Suspense boundary while the server component streams.
 */
export function PageLoading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="min-h-[60vh] bg-brand-cream flex items-center justify-center">
      <div className="flex flex-col items-center gap-4" role="status" aria-live="polite">
        <div className="h-10 w-10 rounded-full border-4 border-brand-dark/15 border-t-brand-dark animate-spin" />
        <p className="text-brand-gray text-sm">{label}</p>
        <span className="sr-only">{label}</span>
      </div>
    </div>
  )
}
