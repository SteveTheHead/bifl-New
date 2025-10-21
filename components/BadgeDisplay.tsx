'use client'

import Image from 'next/image'
import { useState } from 'react'

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
    description: '9.0+ average across all scores',
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
    description: '7.5+ across all categories',
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

// Dynamic badge calculation based on product scores - returns array of all qualifying badges
function calculateBadges(product: any): string[] {
  if (!product) return []

  const badges: string[] = []
  const totalScore = product.bifl_total_score || 0
  const warrantyScore = product.warranty_score || 0
  const socialScore = product.social_score || 0
  const repairabilityScore = product.repairability_score || 0
  const sustainabilityScore = product.sustainability_score || 0
  const buildQualityScore = product.durability_score || 0
  const durabilityScore = product.durability_score || 0

  // Gold Standard: 9.0+ average across all scores with high individual scores
  if (totalScore >= 9.0 &&
      buildQualityScore >= 8.5 &&
      durabilityScore >= 8.5 &&
      warrantyScore >= 8.0) {
    badges.push('Gold Standard')
  }

  // Lifetime Warranty: Warranty score = 10
  if (warrantyScore >= 10.0) {
    badges.push('Lifetime Warranty')
  }

  // Crowd Favorite: Social score ≥ 8.5
  if (socialScore >= 8.5) {
    badges.push('Crowd Favorite')
  }

  // Repair Friendly: Repairability score ≥ 8.5
  if (repairabilityScore >= 8.5) {
    badges.push('Repair Friendly')
  }

  // Eco Hero: Sustainability score ≥ 8.0
  if (sustainabilityScore >= 8.0) {
    badges.push('Eco Hero')
  }

  // BIFL Approved: 7.5+ across all categories (only if no other badges)
  if (badges.length === 0 &&
      totalScore >= 7.5 &&
      buildQualityScore >= 7.0 &&
      durabilityScore >= 7.0 &&
      warrantyScore >= 6.0) {
    badges.push('BIFL Approved')
  }

  return badges
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