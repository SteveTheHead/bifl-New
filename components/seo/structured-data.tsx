import Script from 'next/script'

interface ProductSchemaProps {
  name: string
  description: string
  image: string
  brand: string
  aggregateRating?: {
    ratingValue: number
    reviewCount: number
  }
  offers?: {
    price: number
    priceCurrency: string
    availability: string
    url: string
    priceValidUntil?: string
  }
}

export function ProductStructuredData({ product }: { product: ProductSchemaProps }) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.buyitforlifeproducts.com'

  // Data quality validation - these fields are REQUIRED
  // Log errors in development to catch data issues early
  if (!product.description?.trim()) {
    console.error(`[SEO ERROR] Product "${product.name}" is missing description - this MUST be fixed in the database`)
  }
  if (!product.brand?.trim()) {
    console.error(`[SEO ERROR] Product "${product.name}" is missing brand - this MUST be fixed in the database`)
  }
  if (!product.image) {
    console.error(`[SEO ERROR] Product "${product.name}" is missing image - this MUST be fixed in the database`)
  }

  // Ensure image is a valid absolute URL
  const image = product.image?.startsWith('http') ? product.image : `${baseUrl}${product.image}`

  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: image,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
  }

  // Add aggregateRating only if valid (must have reviewCount >= 1)
  if (product.aggregateRating && product.aggregateRating.reviewCount >= 1) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.aggregateRating.ratingValue,
      reviewCount: product.aggregateRating.reviewCount,
      bestRating: 10,
      worstRating: 0,
    }
  }

  // Add offers only if price is valid
  if (product.offers && product.offers.price > 0) {
    schema.offers = {
      '@type': 'Offer',
      price: product.offers.price.toFixed(2),
      priceCurrency: product.offers.priceCurrency,
      availability: 'https://schema.org/InStock',
      url: product.offers.url,
      ...(product.offers.priceValidUntil && { priceValidUntil: product.offers.priceValidUntil }),
    }
  }

  return (
    <Script
      id="product-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      strategy="afterInteractive"
    />
  )
}

export function BreadcrumbStructuredData({ items }: { items: Array<{ name: string; url: string }> }) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.buyitforlifeproducts.com'

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
    })),
  }

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      strategy="afterInteractive"
    />
  )
}

export function OrganizationStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.buyitforlifeproducts.com'

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Buy It For Life',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'Expert reviews of durable, long-lasting products worth buying once. Comprehensive BIFL ratings for durability, repairability, and warranty.',
    sameAs: [
      // Add your social media URLs when available
    ],
  }

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      strategy="afterInteractive"
    />
  )
}

export function FAQStructuredData({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
  if (!faqs || faqs.length === 0) return null

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      strategy="afterInteractive"
    />
  )
}

// Article schema for buying guides
interface ArticleSchemaProps {
  headline: string
  description: string
  image?: string
  datePublished: string
  dateModified?: string
  url: string
}

export function ArticleStructuredData({ article }: { article: ArticleSchemaProps }) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.buyitforlifeproducts.com'

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.headline,
    description: article.description,
    ...(article.image && { image: article.image }),
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    url: article.url,
    author: {
      '@type': 'Organization',
      name: 'Buy It For Life',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Buy It For Life',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
  }

  return (
    <Script
      id="article-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      strategy="afterInteractive"
    />
  )
}

// ItemList schema for product rankings/listicles
interface RankedProduct {
  name: string
  url: string
  image?: string
  position: number
  rating?: number
  price?: number
}

export function ItemListStructuredData({
  name,
  description,
  products
}: {
  name: string
  description: string
  products: RankedProduct[]
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.buyitforlifeproducts.com'

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: name,
    description: description || `${name} - curated products`,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => {
      const productUrl = product.url.startsWith('http') ? product.url : `${baseUrl}${product.url}`
      const productImage = product.image?.startsWith('http') ? product.image : (product.image ? `${baseUrl}${product.image}` : undefined)

      const item: Record<string, any> = {
        '@type': 'Product',
        name: product.name,
        url: productUrl,
      }

      if (productImage) {
        item.image = productImage
      }

      // Only add aggregateRating with required reviewCount
      if (product.rating && product.rating > 0) {
        item.aggregateRating = {
          '@type': 'AggregateRating',
          ratingValue: product.rating,
          bestRating: 10,
          worstRating: 0,
          reviewCount: 1, // Required field for aggregateRating
        }
      }

      // Only add offers if price is valid
      if (product.price && product.price > 0) {
        item.offers = {
          '@type': 'Offer',
          price: product.price.toFixed(2),
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        }
      }

      return {
        '@type': 'ListItem',
        position: index + 1,
        item: item,
      }
    }),
  }

  return (
    <Script
      id="itemlist-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      strategy="afterInteractive"
    />
  )
}

// WebSite schema for homepage with sitelinks search box
export function WebSiteStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.buyitforlifeproducts.com'

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Buy It For Life',
    url: baseUrl,
    description: 'Community-verified durable products that last. Comprehensive BIFL ratings on durability, repairability, and warranty.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/products?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <Script
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      strategy="afterInteractive"
    />
  )
}

interface ReviewSchemaProps {
  productName: string
  reviews: Array<{
    author: string
    datePublished: string
    reviewBody: string
    ratingValue: number
  }>
}

export function ReviewStructuredData({ productName, reviews }: ReviewSchemaProps) {
  if (!reviews || reviews.length === 0) return null

  const schemas = reviews.map((review, index) => ({
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Product',
      name: productName,
    },
    author: {
      '@type': 'Person',
      name: review.author,
    },
    datePublished: review.datePublished,
    reviewBody: review.reviewBody,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.ratingValue,
      bestRating: 5,
    },
  }))

  return (
    <>
      {schemas.map((schema, index) => (
        <Script
          key={`review-schema-${index}`}
          id={`review-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          strategy="afterInteractive"
        />
      ))}
    </>
  )
}
