import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

interface Guide {
  id: string
  slug: string
  title: string
  meta_description: string | null
  featured_image_url: string | null
  is_published: boolean
  published_at: string | null
  created_at: string
  categories: { name: string; slug: string } | null
}

async function getGuides(): Promise<Guide[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/guides`, {
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error('Failed to fetch guides')
    }

    const data = await response.json()
    return data.guides || []
  } catch (error) {
    console.error('Error fetching guides:', error)
    return []
  }
}

export const metadata: Metadata = {
  title: 'Buying Guides | BIFL - Buy It For Life Products',
  description: 'Expert buying guides to help you find durable, long-lasting products. We research Reddit, Amazon, YouTube, and the entire web to find products that truly last.',
  openGraph: {
    title: 'Buying Guides | BIFL - Buy It For Life Products',
    description: 'Expert buying guides to help you find durable, long-lasting products.',
    type: 'website',
  },
}

export default async function GuidesPage() {
  const guides = await getGuides()

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gray-900 py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
              Buying Guides
            </h1>
            <p className="text-xl text-white/70">
              We scour Reddit, Amazon, YouTube, Quora, and the entire web to find products that real people swear by. No marketing hype, just proven durability.
            </p>
          </div>
        </div>
      </section>

      {/* Guides Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {guides.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No guides published yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {guides.map((guide) => (
                <Link
                  key={guide.id}
                  href={`/guides/${guide.slug}`}
                  className="group"
                >
                  <article className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
                    {/* Image */}
                    <div className="aspect-video bg-gray-100 relative overflow-hidden">
                      {guide.featured_image_url ? (
                        <Image
                          src={guide.featured_image_url}
                          alt={guide.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-500 to-teal-700">
                          <svg className="w-16 h-16 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                      )}
                      {guide.categories && (
                        <span className="absolute top-3 left-3 bg-white/90 text-gray-700 text-xs font-medium px-2 py-1 rounded">
                          {guide.categories.name}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
                        {guide.title}
                      </h2>
                      {guide.meta_description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                          {guide.meta_description}
                        </p>
                      )}
                      {guide.published_at && (
                        <p className="text-gray-400 text-xs">
                          Updated {new Date(guide.published_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-4">
            Looking for a specific product?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Browse our complete collection of community-verified, durable products.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors"
          >
            Browse All Products
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  )
}
