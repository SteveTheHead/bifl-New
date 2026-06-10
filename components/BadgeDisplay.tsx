'use client'

import Image from 'next/image'
import { useState } from 'react'
import { calculateBadges } from '@/lib/scoring'

interface BadgeDisplayProps {
  certification?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
  overlay?: boolean
  product?: any
}

const badgeConfig = {
  'Gold Standard': {
    name: 'Gold Standard',
    description: '9.0+ total with 8.5+ durability and 8.0+ warranty',
    icon: 'gold-standard'
  },
  'Lifetime Warranty': {
    name: 'Lifetime Warranty',
    description: 'Warranty score = 10',
    icon: 'lifetime-warranty'
  },
  'Crowd Favorite': {
    name: 'Crowd Favorite',
    description: 'Social score ≥ 8.5',
    icon: 'crowd-favorite'
  },
  'BIFL Approved': {
    name: 'BIFL Approved',
    description: '7.5+ total with solid durability and warranty',
    icon: 'bifl-approved'
  },
  'Repair Friendly': {
    name: 'Repair Friendly',
    description: 'Repairability score ≥ 8.5',
    icon: 'repair-friendly'
  },
  'Eco Hero': {
    name: 'Eco Hero',
    description: 'Sustainability score ≥ 8.0',
    icon: 'eco-hero'
  }
}

const sizeConfig = {
  xs: { width: 60, height: 24 },
  sm: { width: 90, height: 36 },
  md: { width: 120, height: 48 },
  lg: { width: 160, height: 64 }
}

export default function BadgeDisplay({ certification, size = 'md', className = '', overlay = false, product = null }: BadgeDisplayProps) {
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null)

  // Get badges array - priority: prop certification > product.bifl_certification > calculate dynamically
  let badges: string[] = []

  if (certification) {
    badges = [certification]
  } else if (product?.bifl_certification && Array.isArray(product.bifl_certification)) {
    badges = product.bifl_certification
  } else if (product) {
    badges = calculateBadges(product)
  }

  if (badges.length === 0) {
    return null
  }

  const dimensions = sizeConfig[size]

  const overlayClasses = overlay
    ? 'absolute top-2 right-2 z-10 drop-shadow-lg'
    : 'inline-block relative'

  // For overlay mode, stack badges vertically with small gap
  // For inline mode, display badges horizontally with small gap
  const containerClasses = overlay
    ? 'flex flex-col gap-1'
    : 'flex flex-wrap gap-2'

  return (
    <div className={`${overlayClasses} ${containerClasses} ${className}`}>
      {badges.map((badgeName) => {
        const badge = badgeConfig[badgeName as keyof typeof badgeConfig]
        if (!badge) return null

        return (
          <div
            key={badgeName}
            className="cursor-pointer transition-transform duration-200 hover:scale-110 relative"
            onMouseEnter={() => setHoveredBadge(badgeName)}
            onMouseLeave={() => setHoveredBadge(null)}
          >
            <Image
              src={`/badges/${badge.icon}.svg`}
              alt={badge.name}
              width={dimensions.width}
              height={dimensions.height}
              className="object-contain"
            />
            {hoveredBadge === badgeName && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900/60 backdrop-blur-sm text-white text-xs rounded shadow-lg whitespace-nowrap z-50">
                <div className="text-center">
                  <div className="font-medium">{badge.name}</div>
                  <div className="text-[10px] text-gray-300 leading-tight">{badge.description}</div>
                </div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-b-3 border-transparent border-b-gray-900/60"></div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}