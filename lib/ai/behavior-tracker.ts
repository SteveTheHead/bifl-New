'use client'

export interface UserBehavior {
  userId?: string
  sessionId: string
  productViews: ProductView[]
  searches: SearchEvent[]
  comparisons: ComparisonEvent[]
  favorites: string[]
  timeSpent: Record<string, number> // productId -> seconds
  interactions: InteractionEvent[]
}

export interface ProductView {
  productId: string
  timestamp: Date
  duration: number // seconds
  source: 'search' | 'category' | 'recommendation' | 'direct'
  scrollDepth: number // 0-100%
}

export interface SearchEvent {
  query: string
  timestamp: Date
  resultsShown: number
  clickedResults: string[]
}

export interface ComparisonEvent {
  productIds: string[]
  timestamp: Date
  duration: number
}

export interface InteractionEvent {
  type: 'click' | 'hover' | 'scroll' | 'add_to_compare' | 'favorite' | 'share'
  target: string // product ID, category, etc.
  timestamp: Date
  metadata?: Record<string, any>
}

class BehaviorTracker {
  private static instance: BehaviorTracker
  private behavior: UserBehavior
  private sessionId: string
  private currentView: { productId: string; startTime: Date } | null = null

  private constructor() {
    this.sessionId = this.generateSessionId()
    this.behavior = this.loadBehavior()
    this.setupEventListeners()
  }

  public static getInstance(): BehaviorTracker {
    if (!BehaviorTracker.instance) {
      BehaviorTracker.instance = new BehaviorTracker()
    }
    return BehaviorTracker.instance
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private loadBehavior(): UserBehavior {
    // Load from localStorage or initialize new
    const stored = typeof window !== 'undefined' ? localStorage.getItem('bifl_behavior') : null
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Convert date strings back to Date objects
        parsed.productViews = parsed.productViews?.map((view: any) => ({
          ...view,
          timestamp: new Date(view.timestamp)
        })) || []
        parsed.searches = parsed.searches?.map((search: any) => ({
          ...search,
          timestamp: new Date(search.timestamp)
        })) || []
        parsed.comparisons = parsed.comparisons?.map((comp: any) => ({
          ...comp,
          timestamp: new Date(comp.timestamp)
        })) || []
        parsed.interactions = parsed.interactions?.map((int: any) => ({
          ...int,
          timestamp: new Date(int.timestamp)
        })) || []

        return {
          ...parsed,
          sessionId: this.sessionId // Update session ID
        }
      } catch (error) {
        console.error('Failed to parse stored behavior:', error)
      }
    }

    return {
      sessionId: this.sessionId,
      productViews: [],
      searches: [],
      comparisons: [],
      favorites: [],
      timeSpent: {},
      interactions: []
    }
  }

  private saveBehavior(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('bifl_behavior', JSON.stringify(this.behavior))
      } catch (error) {
        console.error('Failed to save behavior data:', error)
      }
    }
  }

  private setupEventListeners(): void {
    if (typeof window === 'undefined') return

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.currentView) {
        this.endProductView()
      }
    })

    // Track before page unload
    window.addEventListener('beforeunload', () => {
      if (this.currentView) {
        this.endProductView()
      }
      this.saveBehavior()
    })

    // Auto-save periodically
    setInterval(() => {
      this.saveBehavior()
    }, 30000) // Every 30 seconds
  }

  // Public methods for tracking events

  public trackProductView(productId: string, source: ProductView['source'] = 'direct'): void {
    // End previous view if exists
    if (this.currentView) {
      this.endProductView()
    }

    // Start new view
    this.currentView = {
      productId,
      startTime: new Date()
    }

    this.trackInteraction('click', productId, { source })
  }

  private endProductView(): void {
    if (!this.currentView) return

    const duration = Math.round((Date.now() - this.currentView.startTime.getTime()) / 1000)
    const productId = this.currentView.productId

    const view: ProductView = {
      productId,
      timestamp: this.currentView.startTime,
      duration,
      source: 'direct', // This should be passed from trackProductView
      scrollDepth: this.getScrollDepth()
    }

    this.behavior.productViews.push(view)

    // Update time spent
    this.behavior.timeSpent[productId] = (this.behavior.timeSpent[productId] || 0) + duration

    this.currentView = null
    this.saveBehavior()
  }

  public trackSearch(query: string, resultsShown: number): void {
    const search: SearchEvent = {
      query: query.toLowerCase().trim(),
      timestamp: new Date(),
      resultsShown,
      clickedResults: []
    }

    this.behavior.searches.push(search)
    this.saveBehavior()
  }

  public trackSearchClick(productId: string): void {
    // Find the most recent search and add this click
    const recentSearch = this.behavior.searches[this.behavior.searches.length - 1]
    if (recentSearch && Date.now() - recentSearch.timestamp.getTime() < 300000) { // Within 5 minutes
      recentSearch.clickedResults.push(productId)
      this.saveBehavior()
    }
  }

  public trackComparison(productIds: string[]): void {
    const comparison: ComparisonEvent = {
      productIds: [...productIds],
      timestamp: new Date(),
      duration: 0 // Will be updated when comparison ends
    }

    this.behavior.comparisons.push(comparison)
    this.trackInteraction('add_to_compare', productIds.join(','))
    this.saveBehavior()
  }

  public trackFavorite(productId: string, action: 'add' | 'remove'): void {
    if (action === 'add') {
      if (!this.behavior.favorites.includes(productId)) {
        this.behavior.favorites.push(productId)
      }
    } else {
      this.behavior.favorites = this.behavior.favorites.filter(id => id !== productId)
    }

    this.trackInteraction('favorite', productId, { action })
    this.saveBehavior()
  }

  public trackInteraction(
    type: InteractionEvent['type'],
    target: string,
    metadata?: Record<string, any>
  ): void {
    const interaction: InteractionEvent = {
      type,
      target,
      timestamp: new Date(),
      metadata
    }

    this.behavior.interactions.push(interaction)

    // Keep only last 1000 interactions to prevent unbounded growth
    if (this.behavior.interactions.length > 1000) {
      this.behavior.interactions = this.behavior.interactions.slice(-1000)
    }
  }

  private getScrollDepth(): number {
    if (typeof window === 'undefined') return 0

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const docHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    )
    const winHeight = window.innerHeight

    const scrollPercent = Math.round((scrollTop / (docHeight - winHeight)) * 100)
    return Math.min(100, Math.max(0, scrollPercent))
  }

  // Analytics methods

  public getBehaviorSummary(): {
    totalViews: number
    totalTimeSpent: number
    topCategories: string[]
    searchPatterns: string[]
    engagementScore: number
  } {
    const totalViews = this.behavior.productViews.length
    const totalTimeSpent = Object.values(this.behavior.timeSpent).reduce((sum, time) => sum + time, 0)

    // Calculate engagement score (0-100)
    const avgViewTime = totalViews > 0 ? totalTimeSpent / totalViews : 0
    const favoriteRatio = this.behavior.favorites.length / Math.max(totalViews, 1)
    const comparisonRatio = this.behavior.comparisons.length / Math.max(totalViews, 1)

    const engagementScore = Math.min(100, Math.round(
      (avgViewTime / 60) * 20 + // Time factor (up to 20 points for 1+ min average)
      favoriteRatio * 30 + // Favorite factor (up to 30 points)
      comparisonRatio * 25 + // Comparison factor (up to 25 points)
      (this.behavior.searches.length > 0 ? 25 : 0) // Search activity (25 points)
    ))

    return {
      totalViews,
      totalTimeSpent,
      topCategories: [],
      searchPatterns: this.behavior.searches.map(s => s.query),
      engagementScore
    }
  }

  public getRecommendationData(): {
    viewedProducts: string[]
    favoriteProducts: string[]
    comparedProducts: string[]
    searchQueries: string[]
    preferences: Record<string, any>
  } {
    return {
      viewedProducts: [...new Set(this.behavior.productViews.map(v => v.productId))],
      favoriteProducts: [...this.behavior.favorites],
      comparedProducts: [...new Set(this.behavior.comparisons.flatMap(c => c.productIds))],
      searchQueries: [...new Set(this.behavior.searches.map(s => s.query))],
      preferences: {
        avgViewTime: this.behavior.productViews.length > 0
          ? Object.values(this.behavior.timeSpent).reduce((sum, time) => sum + time, 0) / this.behavior.productViews.length
          : 0,
        engagementLevel: this.getBehaviorSummary().engagementScore
      }
    }
  }

  public clearBehavior(): void {
    this.behavior = {
      sessionId: this.generateSessionId(),
      productViews: [],
      searches: [],
      comparisons: [],
      favorites: [],
      timeSpent: {},
      interactions: []
    }
    this.saveBehavior()
  }
}

// Export singleton instance
export const behaviorTracker = typeof window !== 'undefined' ? BehaviorTracker.getInstance() : null