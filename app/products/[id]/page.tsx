import { Metadata } from 'next'
import { getProductById } from '@/lib/supabase/queries'
import { notFound } from 'next/navigation'
import { ProductDetailView } from '@/components/products/product-detail-view'
import { ProductStructuredData, FAQStructuredData, BreadcrumbStructuredData } from '@/components/seo/structured-data'
import { createClient } from '@/lib/supabase/server'

interface ProductPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    notFound()
  }

  // Get FAQs for structured data
  const supabase = await createClient()
  const { data: faqs } = await supabase
    .from('product_faqs')
    .select('question, answer')
    .eq('product_id', id)
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  const productData = product as any
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://buyitforlife.com'

  return (
    <>
      {/* SEO Structured Data */}
      <ProductStructuredData
        product={{
          name: productData.name,
          description: productData.description || productData.excerpt || '',
          image: productData.featured_image_url || `${baseUrl}/logo.png`,
          brand: productData.brand?.name || 'Unknown',
          aggregateRating: productData.star_rating && productData.review_count ? {
            ratingValue: productData.star_rating,
            reviewCount: productData.review_count,
          } : undefined,
          offers: productData.price ? {
            price: productData.price,
            priceCurrency: 'USD',
            availability: 'InStock',
            url: productData.affiliate_link || `${baseUrl}/products/${id}`,
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
          ...(productData.category ? [{ name: productData.category.name, url: `${baseUrl}/categories/${productData.category.slug}` }] : []),
          { name: productData.name, url: `${baseUrl}/products/${id}` },
        ]}
      />

      <ProductDetailView product={product} />
    </>
  )
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params
  const product = await getProductById(id)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://buyitforlife.com'

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
  const biflScore = productData.bifl_total_score || 0
  const brandName = productData.brand?.name || 'Unknown Brand'
  const categoryName = productData.category?.name || ''

  // Create SEO-optimized title
  const title = `${productData.name} Review - BIFL Score ${biflScore}/10 | Buy It For Life`

  // Create SEO-optimized description
  const verdictSnippet = productData.verdict_summary?.substring(0, 100) || ''
  const description = `${productData.name} by ${brandName} - BIFL Score: ${biflScore}/10. ${verdictSnippet} Expert review of durability, repairability, and warranty.`

  // Keywords
  const keywords = [
    productData.name,
    `${productData.name} review`,
    `${productData.name} BIFL`,
    'buy it for life',
    brandName,
    categoryName,
    'durability review',
    'product review',
  ].filter(Boolean)

  return {
    title,
    description: description.substring(0, 160), // Keep under 160 chars
    keywords,

    openGraph: {
      title: `${productData.name} - BIFL Score ${biflScore}/10`,
      description,
      url: `${baseUrl}/products/${id}`,
      siteName: 'Buy It For Life',
      images: productData.featured_image_url ? [
        {
          url: productData.featured_image_url,
          width: 1200,
          height: 630,
          alt: `${productData.name} by ${brandName}`,
        }
      ] : [],
      type: 'article',
    },

    twitter: {
      card: 'summary_large_image',
      title: `${productData.name} - BIFL Score ${biflScore}/10`,
      description,
      images: productData.featured_image_url ? [productData.featured_image_url] : [],
    },

    alternates: {
      canonical: `${baseUrl}/products/${id}`,
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