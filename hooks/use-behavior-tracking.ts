'use client'

import { useEffect, useCallback } from 'react'
import { behaviorTracker } from '@/lib/ai/behavior-tracker'

export function useBehaviorTracking() {
  // Track product view
  const trackProductView = useCallback((productId: string, source: 'search' | 'category' | 'recommendation' | 'direct' = 'direct') => {
    if (behaviorTracker) {
      behaviorTracker.trackProductView(productId, source)
    }
  }, [])

  // Track search
  const trackSearch = useCallback((query: string, resultsShown: number) => {
    if (behaviorTracker) {
      behaviorTracker.trackSearch(query, resultsShown)
    }
  }, [])

  // Track search result click
  const trackSearchClick = useCallback((productId: string) => {
    if (behaviorTracker) {
      behaviorTracker.trackSearchClick(productId)
    }
  }, [])

  // Track comparison
  const trackComparison = useCallback((productIds: string[]) => {
    if (behaviorTracker) {
      behaviorTracker.trackComparison(productIds)
    }
  }, [])

  // Track favorite action
  const trackFavorite = useCallback((productId: string, action: 'add' | 'remove') => {
    if (behaviorTracker) {
      behaviorTracker.trackFavorite(productId, action)
    }
  }, [])

  // Track generic interaction
  const trackInteraction = useCallback((
    type: 'click' | 'hover' | 'scroll' | 'add_to_compare' | 'favorite' | 'share',
    target: string,
    metadata?: Record<string, any>
  ) => {
    if (behaviorTracker) {
      behaviorTracker.trackInteraction(type, target, metadata)
    }
  }, [])

  // Get behavior summary
  const getBehaviorSummary = useCallback(() => {
    return behaviorTracker ? behaviorTracker.getBehaviorSummary() : null
  }, [])

  // Get recommendation data
  const getRecommendationData = useCallback(() => {
    return behaviorTracker ? behaviorTracker.getRecommendationData() : null
  }, [])

  return {
    trackProductView,
    trackSearch,
    trackSearchClick,
    trackComparison,
    trackFavorite,
    trackInteraction,
    getBehaviorSummary,
    getRecommendationData
  }
}

// Hook for automatic product page tracking
export function useProductPageTracking(productId: string, source?: 'search' | 'category' | 'recommendation' | 'direct') {
  const { trackProductView } = useBehaviorTracking()

  useEffect(() => {
    if (productId) {
      trackProductView(productId, source)
    }
  }, [productId, source, trackProductView])
}

// Hook for automatic scroll tracking
export function useScrollTracking(targetElement?: string) {
  const { trackInteraction } = useBehaviorTracking()

  useEffect(() => {
    let throttleTimer: NodeJS.Timeout | null = null

    const handleScroll = () => {
      if (throttleTimer) return

      throttleTimer = setTimeout(() => {
        const scrollPercentage = Math.round(
          (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        )

        if (scrollPercentage >= 25 || scrollPercentage >= 50 || scrollPercentage >= 75 || scrollPercentage >= 90) {
          trackInteraction('scroll', targetElement || 'page', {
            scrollPercentage,
            timestamp: new Date()
          })
        }

        throttleTimer = null
      }, 100)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (throttleTimer) {
        clearTimeout(throttleTimer)
      }
    }
  }, [trackInteraction, targetElement])
}

// Hook for enhanced recommendations based on behavior
export function usePersonalizedRecommendations(productId?: string) {
  const { getRecommendationData } = useBehaviorTracking()

  const getRecommendations = useCallback(async () => {
    const behaviorData = getRecommendationData()

    if (!behaviorData) {
      return null
    }

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          behaviorData
        })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations')
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to get personalized recommendations:', error)
      return null
    }
  }, [productId, getRecommendationData])

  return { getRecommendations, behaviorData: getRecommendationData() }
}