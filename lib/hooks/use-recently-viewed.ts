'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/components/auth/auth-client'

interface RecentlyViewedProduct {
  id: string
  name: string
  price: string
  featured_image_url?: string
  bifl_total_score?: number
  brand_name?: string
  viewed_at: string
}

export function useRecentlyViewed() {
  const { data: session } = useSession()
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.email) {
      fetchRecentlyViewed()
    } else {
      setRecentlyViewed([])
      setLoading(false)
    }
  }, [session?.user?.email])

  const fetchRecentlyViewed = async () => {
    if (!session?.user?.email) return

    try {
      const response = await fetch(`/api/user/recently-viewed?userEmail=${encodeURIComponent(session.user.email)}`)

      if (response.ok) {
        const data = await response.json()
        setRecentlyViewed(data.products || [])
      } else {
        console.error('Failed to fetch recently viewed products')
      }
    } catch (error) {
      console.error('Error fetching recently viewed products:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToRecentlyViewed = async (productId: string) => {
    if (!session?.user?.email) return false

    try {
      const response = await fetch('/api/user/recently-viewed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userEmail: session.user.email,
          productId: productId
        })
      })

      if (response.ok) {
        // Refresh the recently viewed list
        await fetchRecentlyViewed()
        return true
      } else {
        console.error('Failed to add to recently viewed')
        return false
      }
    } catch (error) {
      console.error('Error adding to recently viewed:', error)
      return false
    }
  }

  return {
    recentlyViewed,
    loading,
    addToRecentlyViewed,
    refreshRecentlyViewed: fetchRecentlyViewed
  }
}