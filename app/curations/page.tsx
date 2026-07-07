import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getActiveCurations } from '@/lib/supabase/queries'
import { BreadcrumbStructuredData } from '@/components/seo/structured-data'

export const revalidate = 3600

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.buyitforlifeproducts.com'

export const metadata: Metadata = {
  title: 'Curated Collections - Buy It For Life',
  description:
    'Hand-picked collections of the most durable, long-lasting products. Browse curated BIFL lists for gifts, everyday carry, kitchen upgrades, and more.',
  keywords: ['BIFL collections', 'curated products', 'buy it for life lists', 'durable product collections'],
  openGraph: {
    title: 'Curated Collections - Buy It For Life',
    description: 'Hand-picked collections of the most durable, long-lasting products.',
    url: `${baseUrl}/curations`,
    siteName: 'Buy It For Life',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'BIFL Curated Collections' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Curated Collections - Buy It For Life',
    description: 'Hand-picked collections of the most durable, long-lasting products.',
    images: ['/og-image.jpg'],
  },
  alternates: { canonical: `${baseUrl}/curations` },
  robots: { index: true, follow: true },
}

export default async function CurationsPage() {
  const curations = await getActiveCurations()

  return (
    <div className="bg-brand-cream text-brand-dark min-h-screen">
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', url: baseUrl },
          { name: 'Curations', url: `${baseUrl}/curations` },
        ]}
      />

      {/* Hero Section */}
      <section className="bg-white text-center py-12 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold tracking-tight mb-3">Curated Collections</h1>
          <p className="text-base text-brand-gray max-w-2xl mx-auto">
            Hand-picked sets of products that have earned their place. Every item in every
            collection carries a verified BIFL score.
          </p>
        </div>
      </section>

      {/* Curations Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {curations.length === 0 ? (
            <p className="text-center text-brand-gray py-16">
              No collections published yet. Check back soon.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {curations.map((curation: any) => (
                <Link key={curation.id} href={`/curations/${curation.slug}`}>
                  <article className="group bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 h-full flex flex-col">
                    <div className="relative aspect-video bg-gray-100">
                      {curation.featured_image_url ? (
                        <Image
                          src={curation.featured_image_url}
                          alt={curation.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-brand-teal/10">
                          <span className="text-brand-teal text-4xl font-serif font-bold">
                            {curation.name?.charAt(0) || 'B'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h2 className="text-xl font-semibold mb-2 group-hover:text-brand-teal transition-colors">
                        {curation.name}
                      </h2>
                      {curation.description && (
                        <p className="text-brand-gray text-sm leading-relaxed mb-4 line-clamp-3">
                          {curation.description}
                        </p>
                      )}
                      <span className="mt-auto text-sm font-medium text-brand-teal">
                        {curation.product_count} {curation.product_count === 1 ? 'product' : 'products'} →
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
