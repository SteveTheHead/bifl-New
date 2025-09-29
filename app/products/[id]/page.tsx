import { getProductById } from '@/lib/supabase/queries'
import { notFound } from 'next/navigation'
import { ProductDetailView } from '@/components/products/product-detail-view'

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

  return (
    <ProductDetailView product={product} />
  )
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.'
    }
  }

  return {
    title: `${(product as any).name} | BIFL Products`,
    description: (product as any).excerpt || (product as any).description,
    openGraph: {
      title: (product as any).name,
      description: (product as any).excerpt || (product as any).description,
      images: (product as any).featured_image_url ? [(product as any).featured_image_url] : [],
    },
  }
}