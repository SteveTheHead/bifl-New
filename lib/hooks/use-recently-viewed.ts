'use client'

import { useState, useEffect } from 'react'

interface RecentlyViewedProduct {
  id: string
  name: string
  price: string
  featured_image_url?: string
  bifl_total_score?: number
  brand_name?: string
  affiliate_link?: string
  viewed_at: string
}

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  // Check authentication using our Supabase auth system
  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch('/api/user/auth')
        const data = await response.json()
        setUser(data.user)

        if (data.user?.email) {
          fetchRecentlyViewed(data.user.email)
        } else {
          setRecentlyViewed([])
          setLoading(false)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        setUser(null)
        setRecentlyViewed([])
        setLoading(false)
      }
    }
    checkUser()
  }, [])

  const fetchRecentlyViewed = async (userEmail: string) => {
    if (!userEmail) return

    try {
      const response = await fetch(`/api/user/recently-viewed?userEmail=${encodeURIComponent(userEmail)}`)

      if (response.ok) {
        const data = await response.json()
        setRecentlyViewed(data.products || [])
      } else {
        // Gracefully handle when table doesn't exist yet
        setRecentlyViewed([])
      }
    } catch (error) {
      // Gracefully handle errors - recently viewed is not critical functionality
      setRecentlyViewed([])
    } finally {
      setLoading(false)
    }
  }

  const addToRecentlyViewed = async (productId: string) => {
    if (!user?.email) return false

    try {
      const response = await fetch('/api/user/recently-viewed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userEmail: user.email,
          productId: productId
        })
      })

      if (response.ok) {
        // Refresh the recently viewed list
        await fetchRecentlyViewed(user.email)
        return true
      } else {
        // Gracefully handle when table doesn't exist yet - don't spam console
        return false
      }
    } catch (error) {
      // Gracefully handle errors - recently viewed is not critical functionality
      return false
    }
  }

  return {
    recentlyViewed,
    loading,
    addToRecentlyViewed,
    refreshRecentlyViewed: () => user?.email ? fetchRecentlyViewed(user.email) : Promise.resolve()
  }
}