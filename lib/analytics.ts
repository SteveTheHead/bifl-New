// Google Analytics event tracking utilities

declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'js',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void
  }
}

// Track page views
export const pageview = (url: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
      page_path: url,
    })
  }
}

// Track custom events
export const event = (action: string, params?: Record<string, any>) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', action, params)
  }
}

// Product-specific events
export const trackProductView = (productId: string, productName: string, category?: string) => {
  event('view_item', {
    item_id: productId,
    item_name: productName,
    item_category: category,
  })
}

export const trackProductSearch = (searchTerm: string) => {
  event('search', {
    search_term: searchTerm,
  })
}

export const trackAffiliateClick = (productId: string, productName: string, affiliateUrl: string) => {
  event('click_affiliate_link', {
    item_id: productId,
    item_name: productName,
    link_url: affiliateUrl,
  })
}

export const trackProductCompare = (productIds: string[]) => {
  event('compare_products', {
    item_ids: productIds.join(','),
    count: productIds.length,
  })
}

export const trackAddToFavorites = (productId: string, productName: string) => {
  event('add_to_favorites', {
    item_id: productId,
    item_name: productName,
  })
}

export const trackRemoveFromFavorites = (productId: string, productName: string) => {
  event('remove_from_favorites', {
    item_id: productId,
    item_name: productName,
  })
}

export const trackFilterUsage = (filterType: string, filterValue: string) => {
  event('use_filter', {
    filter_type: filterType,
    filter_value: filterValue,
  })
}

export const trackCategoryView = (categoryName: string) => {
  event('view_category', {
    category_name: categoryName,
  })
}

export const trackSignIn = (method: string) => {
  event('login', {
    method: method,
  })
}

export const trackSignUp = (method: string) => {
  event('sign_up', {
    method: method,
  })
}
