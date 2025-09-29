'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'


export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ email?: string } | null>(null)

  // Check authentication using our Supabase auth system
  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch('/api/user/auth')
        const data = await response.json()
        setUser(data.user)

        if (data.user?.email) {
          fetchFavorites(data.user.email)
        } else {
          setFavorites(new Set())
          setLoading(false)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        setUser(null)
        setFavorites(new Set())
        setLoading(false)
      }
    }
    checkUser()
  }, [])

  const fetchFavorites = async (userEmail: string) => {
    if (!userEmail) return

    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('user_favorites')
        .select('product_id')
        .eq('user_email', userEmail)

      if (error) {
        if (error.code === 'PGRST116' || error.message?.includes('relation "user_favorites" does not exist')) {
          // Table doesn't exist, start with empty favorites
          console.log('Favorites table does not exist yet, starting with empty favorites')
          setFavorites(new Set())
          return
        }
        console.error('Error fetching favorites:', error)
        return
      }

      if (data) {
        setFavorites(new Set(data.map(fav => fav.product_id)))
      }
    } catch (error) {
      console.error('Error in fetchFavorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToFavorites = async (productId: string) => {
    if (!user?.email) return false

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('user_favorites')
        .insert({
          user_email: user.email,
          product_id: productId
        })

      if (error) {
        console.error('Error adding to favorites:', error)
        if (error.code === '42P01' || error.message?.includes('relation "user_favorites" does not exist')) {
          console.error('user_favorites table does not exist. Please create it using the SQL in create_favorites_table.sql')
        }
        return false
      }

      setFavorites(prev => new Set([...prev, productId]))
      return true
    } catch (error) {
      console.error('Error in addToFavorites:', error)
      return false
    }
  }

  const removeFromFavorites = async (productId: string) => {
    if (!user?.email) return false

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_email', user.email)
        .eq('product_id', productId)

      if (error) {
        console.error('Error removing from favorites:', error)
        return false
      }

      setFavorites(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
      return true
    } catch (error) {
      console.error('Error in removeFromFavorites:', error)
      return false
    }
  }

  const toggleFavorite = async (productId: string) => {
    if (favorites.has(productId)) {
      return await removeFromFavorites(productId)
    } else {
      return await addToFavorites(productId)
    }
  }

  const isFavorite = (productId: string) => favorites.has(productId)


  return {
    favorites: Array.from(favorites),
    loading,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    refreshFavorites: () => user?.email ? fetchFavorites(user.email) : Promise.resolve()
  }
}