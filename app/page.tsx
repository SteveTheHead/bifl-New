import Link from 'next/link'
import Image from 'next/image'
import { getCategories, getFeaturedProducts } from '@/lib/supabase/queries'
import { Card, CardContent } from '@/components/ui/card'
import BadgeDisplay from '@/components/BadgeDisplay'

// Score badge styling function (matching product grid)
function getScoreBadgeStyle(score: number) {
  const scoreString = score.toString()
  return {
    className: "score-field px-3 py-1 rounded-full transform transition-all duration-300",
    dataScore: scoreString
  }
}

// Get score label for accessibility
function getScoreLabel(score: number) {
  if (score >= 9.0) return "Legend"
  if (score >= 8.0) return "Excellent"
  if (score >= 7.0) return "Good"
  if (score >= 6.0) return "Fair"
  return "Poor"
}

export default async function HomePage() {
  try {
    // Get categories and featured products from database
    const [categories, featuredProducts] = await Promise.all([
      getCategories(),
      getFeaturedProducts()
    ])

    console.log('Categories being used:', categories?.map(c => c.name) || [])
    console.log('Featured products:', featuredProducts?.length || 0)
  return (
    <div className="bg-brand-cream font-sans">

      {/* Hero Section */}
      <section className="relative h-[700px] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/categories/hero Picture 1.png"
            alt="high quality leather boots vintage tools compass on wooden surface dark moody lighting"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6 h-full flex items-center">
          <div className="max-w-4xl">
            <h1 className="text-6xl lg:text-7xl font-serif font-bold text-white mb-6 leading-tight">
              Buy Better. <span className="text-yellow-500">Once.</span>
            </h1>

            <p className="text-xl text-white/90 mb-8 max-w-3xl leading-relaxed">
              Thoroughly researched BIFL products that have proven their worth through years of real-world testing. Every recommendation backed by community feedback and unbiased research.
            </p>

            <div className="flex flex-wrap items-center gap-8 mb-8">
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6" fill="#4A9D93" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-white font-medium">Community-verified</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6" fill="#4A9D93" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-white font-medium">Years of Real World Testing</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6" fill="#4A9D93" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-white font-medium">No Bias</span>
              </div>
            </div>

            {/* Quality Badges */}
            <div className="flex flex-wrap gap-3 mb-10">
              <Link href="/products?badge=Gold%20Standard">
                <BadgeDisplay certification="Gold Standard" size="sm" />
              </Link>
              <Link href="/products?badge=Crowd%20Favorite">
                <BadgeDisplay certification="Crowd Favorite" size="sm" />
              </Link>
              <Link href="/products?badge=Lifetime%20Warranty">
                <BadgeDisplay certification="Lifetime Warranty" size="sm" />
              </Link>
              <Link href="/products?badge=BIFL%20Approved">
                <BadgeDisplay certification="BIFL Approved" size="sm" />
              </Link>
              <Link href="/products?badge=Repair%20Friendly">
                <BadgeDisplay certification="Repair Friendly" size="sm" />
              </Link>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center text-white px-6 py-3 rounded-lg text-base font-semibold hover:bg-opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg"
              style={{ backgroundColor: '#4A9D93' }}
            >
              Browse The Directory
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

      </section>

      {/* Trust Methodology Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-brand-dark mb-6">Our Research Methodology</h2>
            <p className="text-xl text-brand-gray max-w-3xl mx-auto">
              We research and evaluate products extensively - but only the ones that truly prove their worth make it to our recommendations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Multi-Source Research */}
            <div className="bg-brand-cream p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-transparent rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" stroke="#4A9D93" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-brand-dark mb-4">Multi-Source Research</h3>
              <p className="text-brand-gray">
                We verify every product through manufacturer warranties, long-term user reviews, repair policies, and material quality analysis. No single source decides - the data does.
              </p>
            </div>

            {/* Community-Sourced */}
            <div className="bg-brand-cream p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-transparent rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" stroke="#4A9D93" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-brand-dark mb-4">Community-Sourced</h3>
              <p className="text-brand-gray">
                Our recommendations come from the 2.6M+ Buy It For Life community, sustainability forums, and real owners who've tested products for years, sometimes decades.
              </p>
            </div>

            {/* Quality First, Always */}
            <div className="bg-brand-cream p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-transparent rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" stroke="#4A9D93" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-brand-dark mb-4">Quality First, Always</h3>
              <p className="text-brand-gray">
                Every product is evaluated on merit alone - durability, repairability, and real-world performance. We research everything we can, but only recommend products that truly earn it. Affiliate earnings simply help keep this research free.
              </p>
            </div>

            {/* Living Database */}
            <div className="bg-brand-cream p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-transparent rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" stroke="#4A9D93" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-brand-dark mb-4">Living Database</h3>
              <p className="text-brand-gray">
                Quality changes? We update immediately. When trusted brands decline or new champions emerge, our listings reflect reality, not outdated assumptions.
              </p>
            </div>
          </div>

          {/* Learn More Button */}
          <div className="text-center mt-12">
            <Link
              href="/methodology"
              className="inline-flex items-center text-white px-6 py-3 rounded-lg text-base font-semibold hover:bg-opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg"
              style={{ backgroundColor: '#4A9D93' }}
            >
              Learn More
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>


      {/* Category Grid Section - Dynamic */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-brand-dark mb-6">Shop by Category</h2>
            <p className="text-xl text-brand-gray max-w-3xl mx-auto">
              Explore our carefully curated categories of durable goods, each containing only the finest products that have stood the test of time.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {categories?.map((category) => {
              // Map category names to local images
              const categoryImageMap: Record<string, string> = {
                'Footwear & Accessories': '/images/categories/Footwear.png',
                'Tools & Hardware': '/images/categories/Tools.png',
                'Home & Kitchen': '/images/categories/Home & Kitchen.png',
                'Outdoor & Camping': '/images/categories/Outdoor and camping.png',
                'Clothing & Apparel': '/images/categories/clothing.png',
                'Travel & Everyday Carry': '/images/categories/everyday carry.png',
                'Electronics & Tech': '/images/categories/electronics and tech.png',
                'Automotive & Cycling': '/images/categories/automotivecycling.png'
              }

              const imageUrl = categoryImageMap[category.name] || '/images/categories/Home & Kitchen.png'

              return (
                <Link key={category.id} href={`/products?categories=${category.id}`}>
                  <div className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer">
                    <Image
                      src={imageUrl}
                      alt={`${category.name.toLowerCase()} products`}
                      width={400}
                      height={256}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all duration-300"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                      <h3 className="text-2xl font-bold text-white mb-4">{category.name}</h3>
                      <span className="inline-block text-white px-3 py-1.5 rounded-lg font-medium hover:bg-opacity-90 transition-colors cursor-pointer relative z-20 border-2 text-sm" style={{ backgroundColor: '#4A9D93', borderColor: '#4A9D93' }}>
                        View Products
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Products Section - Dynamic */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-brand-dark mb-6">Featured Products</h2>
            <p className="text-xl text-brand-gray max-w-3xl mx-auto">
              Our top-rated products that have earned the highest community ratings and longest durability records.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts?.map((product: any) => {
              const totalScore = product.bifl_total_score || 0

              return (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
                    <div className="relative">
                      <Image
                        src={product.featured_image_url || '/placeholder-product.png'}
                        alt={product.name || 'Product'}
                        width={400}
                        height={224}
                        className="w-full h-56 object-contain"
                      />
                      <BadgeDisplay
                        product={product}
                        size="sm"
                        overlay={true}
                        className="top-3 right-3"
                      />
                    </div>
                    <div className="p-6 text-center">
                      <h3 className="text-xl font-semibold">{product.name}</h3>
                      <p className="text-brand-gray mb-4">{product.brand_name}</p>
                      <div className="flex justify-center items-center gap-3 mb-6">
                        <span className="text-sm font-medium text-brand-gray">BIFL Score:</span>
                        <div
                          className={`${getScoreBadgeStyle(totalScore).className} hover:scale-105`}
                          data-score={getScoreBadgeStyle(totalScore).dataScore}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold tracking-wide">
                              {totalScore.toFixed(1)}
                            </span>
                            <span className="text-xs font-medium opacity-90">
                              {getScoreLabel(totalScore)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="block text-white font-semibold py-2 px-6 rounded-lg hover:bg-opacity-90 transition-colors cursor-pointer" style={{ backgroundColor: '#4A9D93' }}>
                        View Product
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>



      {/* Newsletter Section */}
      <section className="py-20 bg-brand-teal">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-serif font-bold text-white mb-6">Stay Updated</h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Get notified when new products earn BIFL certification, exclusive community insights, and durability tips.
          </p>

          <div className="max-w-md mx-auto">
            <div className="flex space-x-4">
              <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white bg-white/90" />
              <button className="bg-brand-dark text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-dark/90 transition-colors">
                Subscribe
              </button>
            </div>
            <p className="text-white/70 text-sm mt-4">No spam, unsubscribe anytime. 25,000+ subscribers trust us.</p>
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-serif font-bold text-brand-dark mb-6">Help Us Improve</h2>
              <p className="text-xl text-brand-gray max-w-3xl mx-auto">
                Our goal is to build the most trusted resource for durable goods, and your feedback is a critical part of that process. Whether you've found an error, have a product suggestion, or just want to share an idea, we're listening.
              </p>
            </div>

            <div className="bg-white rounded-xl p-10 shadow-lg border border-gray-100">
              <form className="space-y-8">
                {/* Feedback Type Radio Buttons */}
                <div>
                  <label className="block text-brand-dark font-semibold mb-4 text-lg">What is your feedback about?</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:border-brand-teal transition-colors">
                      <input type="radio" name="feedback_type" value="website_bug" className="text-brand-teal focus:ring-brand-teal" />
                      <span className="text-brand-dark font-medium">Website Bug</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:border-brand-teal transition-colors">
                      <input type="radio" name="feedback_type" value="product_suggestion" className="text-brand-teal focus:ring-brand-teal" />
                      <span className="text-brand-dark font-medium">Product Suggestion</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:border-brand-teal transition-colors">
                      <input type="radio" name="feedback_type" value="data_correction" className="text-brand-teal focus:ring-brand-teal" />
                      <span className="text-brand-dark font-medium">Data Correction</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:border-brand-teal transition-colors">
                      <input type="radio" name="feedback_type" value="general_idea" className="text-brand-teal focus:ring-brand-teal" />
                      <span className="text-brand-dark font-medium">General Idea</span>
                    </label>
                  </div>
                </div>

                {/* Subject Field */}
                <div>
                  <label className="block text-brand-dark font-semibold mb-3 text-lg">Subject</label>
                  <input
                    type="text"
                    placeholder="e.g., Incorrect warranty information for Brand X"
                    className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent transition-all"
                  />
                </div>

                {/* Details Textarea */}
                <div>
                  <label className="block text-brand-dark font-semibold mb-3 text-lg">Details</label>
                  <textarea
                    rows={6}
                    placeholder="Please provide as much detail as possible. If suggesting a product, tell us why you think it's BIFL!"
                    className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent resize-none transition-all"
                  ></textarea>
                </div>

                {/* File Attachment */}
                <div>
                  <label className="block text-brand-dark font-semibold mb-3 text-lg">Attachment (Optional)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center hover:border-brand-teal transition-all cursor-pointer">
                    <div className="flex flex-col items-center space-y-4">
                      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <div className="space-y-1">
                        <div>
                          <span className="text-brand-teal font-semibold">Upload a file</span>
                          <span className="text-gray-600"> or drag and drop</span>
                        </div>
                        <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Info Section */}
                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-brand-dark font-semibold mb-3 text-lg">Contact Info (Optional)</h3>
                  <p className="text-brand-gray mb-6">Provide your contact details if you'd like a response or are open to follow-up questions from our research team.</p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-brand-dark font-medium mb-2">Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-brand-dark font-medium mb-2">Email</label>
                      <input
                        type="email"
                        className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="text-center pt-6">
                  <button
                    type="submit"
                    className="px-12 py-4 text-white rounded-lg font-semibold transition-all hover:opacity-90 hover:scale-105 transform shadow-lg"
                    style={{ backgroundColor: '#4A9D93' }}
                  >
                    Submit Feedback
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-dark pt-16 pb-8">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="mb-6">
                <h3 className="text-2xl font-serif font-bold text-black mb-4">
                  BIFL<span className="text-brand-teal">Directory</span>
                </h3>
                <p className="text-black">
                  The most trusted resource for durable goods, backed by rigorous research and community validation.
                </p>
              </div>
              <div className="flex space-x-4">
                <span className="text-black hover:text-brand-teal transition-colors cursor-pointer">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </span>
                <span className="text-black hover:text-brand-teal transition-colors cursor-pointer">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </span>
                <span className="text-black hover:text-brand-teal transition-colors cursor-pointer">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </span>
                <span className="text-black hover:text-brand-teal transition-colors cursor-pointer">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0002 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
                  </svg>
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-black font-semibold mb-4">Categories</h4>
              <ul className="space-y-3">
                <li><Link href="/categories/footwear" className="text-black hover:text-gray-600 transition-colors">Footwear</Link></li>
                <li><Link href="/categories/tools" className="text-black hover:text-gray-600 transition-colors">Tools</Link></li>
                <li><Link href="/categories/kitchen" className="text-black hover:text-gray-600 transition-colors">Kitchen</Link></li>
                <li><Link href="/categories/outdoor" className="text-black hover:text-gray-600 transition-colors">Outdoor</Link></li>
                <li><Link href="/categories/clothing" className="text-black hover:text-gray-600 transition-colors">Clothing</Link></li>
                <li><Link href="/categories/home" className="text-black hover:text-gray-600 transition-colors">Home</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-black font-semibold mb-4">Resources</h4>
              <ul className="space-y-3">
                <li><Link href="/methodology" className="text-black hover:text-gray-600 transition-colors">Research Methodology</Link></li>
                <li><Link href="/guidelines" className="text-black hover:text-gray-600 transition-colors">Community Guidelines</Link></li>
                <li><Link href="/testing" className="text-black hover:text-gray-600 transition-colors">Testing Process</Link></li>
                <li><Link href="/experts" className="text-black hover:text-gray-600 transition-colors">Expert Panel</Link></li>
                <li><Link href="/reports" className="text-black hover:text-gray-600 transition-colors">Durability Reports</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-black font-semibold mb-4">Company</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-black hover:text-gray-600 transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="text-black hover:text-gray-600 transition-colors">Contact</Link></li>
                <li><Link href="/careers" className="text-black hover:text-gray-600 transition-colors">Careers</Link></li>
                <li><Link href="/press" className="text-black hover:text-gray-600 transition-colors">Press</Link></li>
                <li><Link href="/blog" className="text-black hover:text-gray-600 transition-colors">Blog</Link></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/20">
            <div className="text-gray-200 text-sm mb-4 md:mb-0">
              © 2024 BIFL Directory. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-200 hover:text-brand-teal transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-gray-200 hover:text-brand-teal transition-colors">Terms of Service</Link>
              <Link href="/cookies" className="text-gray-200 hover:text-brand-teal transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
  } catch (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-cream to-white">
        <div className="container mx-auto py-12">
          <Card className="border-red-500 bg-white shadow-lg rounded-2xl max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center">
                <div className="w-10 h-10 bg-red-500/20 rounded-full"></div>
              </div>
              <h3 className="text-2xl font-bold text-red-600 mb-3">
                Failed to load homepage
              </h3>
              <p className="text-brand-gray">
                {error instanceof Error ? error.message : 'Unknown error occurred'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
}