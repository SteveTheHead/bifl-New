/**
 * Shared layout for dynamic Open Graph images (next/og ImageResponse).
 * Used by the opengraph-image.tsx files under app/(products|categories|
 * guides|curations)/[slug]/. Satori renders this JSX to a 1200x630 PNG;
 * only a subset of CSS works (flexbox, no grid).
 */
import type { ReactElement } from 'react'

export const OG_SIZE = { width: 1200, height: 630 }

const COLORS = {
  bg: '#1a2e2a',
  panel: '#22403a',
  teal: '#4A9D93',
  cream: '#faf6ef',
  gray: '#a8b8b4',
  gold: '#eab308',
}

export function OgCard({
  eyebrow,
  title,
  subtitle,
  score,
}: {
  /** Small label above the title, e.g. "BIFL PRODUCT REVIEW" */
  eyebrow: string
  title: string
  subtitle?: string
  /** 0-10 BIFL score; renders the score pill when present */
  score?: number | null
}): ReactElement {
  const clampedTitle = title.length > 90 ? `${title.slice(0, 87)}...` : title

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: COLORS.bg,
        padding: 64,
        fontFamily: 'sans-serif',
      }}
    >
      {/* Top bar: site name */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            display: 'flex',
            backgroundColor: COLORS.teal,
            color: 'white',
            fontSize: 28,
            fontWeight: 700,
            padding: '10px 24px',
            borderRadius: 12,
          }}
        >
          Buy It For Life
        </div>
        <div style={{ display: 'flex', color: COLORS.gray, fontSize: 24, marginLeft: 20 }}>
          buyitforlifeproducts.com
        </div>
      </div>

      {/* Middle: eyebrow + title + subtitle */}
      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 1000 }}>
        <div
          style={{
            display: 'flex',
            color: COLORS.teal,
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: 4,
            marginBottom: 16,
          }}
        >
          {eyebrow.toUpperCase()}
        </div>
        <div
          style={{
            display: 'flex',
            color: COLORS.cream,
            fontSize: clampedTitle.length > 50 ? 56 : 68,
            fontWeight: 800,
            lineHeight: 1.1,
          }}
        >
          {clampedTitle}
        </div>
        {subtitle && (
          <div style={{ display: 'flex', color: COLORS.gray, fontSize: 30, marginTop: 20 }}>
            {subtitle.length > 110 ? `${subtitle.slice(0, 107)}...` : subtitle}
          </div>
        )}
      </div>

      {/* Bottom: score pill or tagline */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {score != null && score > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: COLORS.gold,
                color: COLORS.bg,
                fontSize: 40,
                fontWeight: 800,
                padding: '12px 32px',
                borderRadius: 999,
              }}
            >
              {score.toFixed(1)} / 10
            </div>
            <div style={{ display: 'flex', color: COLORS.gray, fontSize: 28, marginLeft: 24 }}>
              BIFL Score
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', color: COLORS.gray, fontSize: 28 }}>
            Products verified to last a lifetime
          </div>
        )}
      </div>
    </div>
  )
}
