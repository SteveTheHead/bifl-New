import { Metadata } from 'next'
import { getProductBySlug } from '@/lib/supabase/queries'
import { notFound } from 'next/navigation'
import { ProductDetailView } from '@/components/products/product-detail-view'
import { ProductStructuredData, FAQStructuredData, BreadcrumbStructuredData } from '@/components/seo/structured-data'
import { createClient, createBuildClient } from '@/lib/supabase/server'
import {
  generateProductTitle,
  generateProductDescription,
  generateOpenGraph,
  generateTwitterCard,
} from '@/lib/seo/utils'

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const productData = product as any

  // Get FAQs for structured data
  const supabase = await createClient()
  const { data: faqs } = await supabase
    .from('product_faqs')
    .select('question, answer')
    .eq('product_id', productData.id)
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.buyitforlifeproducts.com'

  return (
    <>
      {/* SEO Structured Data */}
      <ProductStructuredData
        product={{
          name: productData.name,
          description: productData.description || productData.excerpt || '',
          image: productData.featured_image_url || `${baseUrl}/logo.png`,
          brand: productData.brands?.name || 'Unknown',
          aggregateRating: productData.star_rating ? {
            ratingValue: productData.star_rating,
            reviewCount: productData.review_count || 1, // Default to 1 if we have a rating but no review count
          } : undefined,
          offers: productData.price ? {
            price: productData.price,
            priceCurrency: 'USD',
            availability: 'InStock',
            url: productData.affiliate_link || `${baseUrl}/products/${productData.slug}`,
            priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
          } : undefined,
        }}
      />

      {faqs && faqs.length > 0 && (
        <FAQStructuredData faqs={faqs} />
      )}

      <BreadcrumbStructuredData
        items={[
          { name: 'Home', url: baseUrl },
          { name: 'Products', url: `${baseUrl}/products` },
          ...(productData.categories ? [{ name: productData.categories.name, url: `${baseUrl}/categories/${productData.categories.slug}` }] : []),
          { name: productData.name, url: `${baseUrl}/products/${productData.slug}` },
        ]}
      />

      <ProductDetailView product={product} />
    </>
  )
}

export async function generateStaticParams() {
  const supabase = createBuildClient()

  const { data: products } = await supabase
    .from('products')
    .select('slug')
    .eq('status', 'published')
    .limit(1000) // Limit to prevent excessive build times

  return (products || []).map((product: { slug: string }) => ({
    slug: product.slug,
  }))
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.buyitforlifeproducts.com'

  if (!product) {
    return {
      title: 'Product Not Found - Buy It For Life',
      description: 'The requested product could not be found.',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const productData = product as any
  const brandName = productData.brands?.name || ''
  const categoryName = productData.categories?.name || ''

  // Use SEO utility functions for consistent, length-compliant metadata
  const title = generateProductTitle({
    name: productData.name,
    brandName,
    biflScore: productData.bifl_total_score,
  })

  const description = generateProductDescription({
    name: productData.name,
    brandName,
    biflScore: productData.bifl_total_score,
    verdictSummary: productData.verdict_summary,
    excerpt: productData.excerpt,
  })

  // Keywords
  const keywords = [
    productData.name,
    `${productData.name} review`,
    'buy it for life',
    brandName,
    categoryName,
    'durable products',
  ].filter(Boolean)

  const productUrl = `${baseUrl}/products/${productData.slug}`

  return {
    title,
    description,
    keywords,

    openGraph: generateOpenGraph({
      title,
      description,
      url: productUrl,
      image: productData.featured_image_url,
      type: 'article',
    }),

    twitter: generateTwitterCard({
      title,
      description,
      image: productData.featured_image_url,
    }),

    alternates: {
      canonical: productUrl,
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  }
}