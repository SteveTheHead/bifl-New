'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSession } from '@/components/auth/auth-client'

interface Favorite {
  id: string
  user_email: string
  product_id: string
  created_at: string
}

export function useFavorites() {
  const { data: session } = useSession()
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.email) {
      fetchFavorites()
    } else {
      setFavorites(new Set())
      setLoading(false)
    }
  }, [session?.user?.email])

  const fetchFavorites = async () => {
    if (!session?.user?.email) return

    try {
      const supabase = createClient()

      // First, try to create the table if it doesn't exist (for development)
      await supabase.rpc('create_favorites_table_if_not_exists').catch(() => {
        // Ignore error if function doesn't exist - table might already exist
      })

      const { data, error } = await supabase
        .from('user_favorites')
        .select('product_id')
        .eq('user_email', session.user.email)

      if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist
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
    if (!session?.user?.email) return false

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('user_favorites')
        .insert({
          user_email: session.user.email,
          product_id: productId
        })

      if (error) {
        // If table doesn't exist, create it and try again
        if (error.code === '42P01') {
          await createFavoritesTable()
          return addToFavorites(productId) // Retry
        }
        console.error('Error adding to favorites:', error)
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
    if (!session?.user?.email) return false

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_email', session.user.email)
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

  const createFavoritesTable = async () => {
    try {
      const supabase = createClient()

      // This would typically be done via migrations, but for development:
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS user_favorites (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_email TEXT NOT NULL,
            product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ DEFAULT now(),
            UNIQUE(user_email, product_id)
          );

          CREATE INDEX IF NOT EXISTS idx_user_favorites_user_email ON user_favorites(user_email);
          CREATE INDEX IF NOT EXISTS idx_user_favorites_product_id ON user_favorites(product_id);
        `
      })

      if (error) {
        console.error('Error creating favorites table:', error)
      }
    } catch (error) {
      console.error('Error in createFavoritesTable:', error)
    }
  }

  return {
    favorites: Array.from(favorites),
    loading,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    refreshFavorites: fetchFavorites
  }
}