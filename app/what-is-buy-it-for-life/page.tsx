import { Metadata } from 'next'
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: 'What is Buy It For Life? | BIFL Philosophy & Movement',
  description: 'Discover the Buy It For Life (BIFL) philosophy: investing in durable, long-lasting products that reduce waste, save money, and stand the test of time. Learn what makes a product truly BIFL.',
  openGraph: {
    title: 'What is Buy It For Life? Understanding the BIFL Movement',
    description: 'Learn about the Buy It For Life philosophy, why quality matters over quantity, and how to identify products built to last a lifetime.',
    type: 'article',
  },
  alternates: {
    canonical: '/what-is-buy-it-for-life',
  },
}

export default function WhatIsBuyItForLife() {
  // JSON-LD structured data for SEO
  const articleStructuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "What is Buy It For Life? Understanding the BIFL Movement",
    "description": "A comprehensive guide to the Buy It For Life philosophy, including the history, benefits, and how to identify durable products.",
    "author": {
      "@type": "Organization",
      "name": "Buy It For Life Products"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Buy It For Life Products",
      "logo": {
        "@type": "ImageObject",
        "url": "https://buyitforlifeproducts.com/logo.png"
      }
    },
    "datePublished": "2025-10-31",
    "dateModified": "2025-10-31"
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }}
      />

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-brand-cream via-white to-brand-cream">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(74,157,147,0.08),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(74,157,147,0.05),transparent_50%)]"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-brand-dark mb-6 leading-tight">
              What is Buy It For Life?
            </h1>
            <p className="text-2xl md:text-3xl text-brand-gray mb-10 leading-relaxed">
              The philosophy of investing in quality products built to last decades, or even a lifetime, instead of repeatedly buying cheap items that break.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="group bg-white px-7 py-4 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-default">
                <span className="text-brand-teal font-semibold text-lg flex items-center gap-2">
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-300">💰</span>
                  Save Money Long-Term
                </span>
              </div>
              <div className="group bg-white px-7 py-4 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-default">
                <span className="text-brand-teal font-semibold text-lg flex items-center gap-2">
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-300">🌍</span>
                  Reduce Waste
                </span>
              </div>
              <div className="group bg-white px-7 py-4 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-default">
                <span className="text-brand-teal font-semibold text-lg flex items-center gap-2">
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-300">🔧</span>
                  Built to Last
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Philosophy Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-dark mb-10 text-center">
              The BIFL Philosophy: Quality Over Quantity
            </h2>

            <div className="prose prose-lg max-w-none text-brand-gray space-y-8">
              <p className="text-xl leading-relaxed">
                <strong>Buy It For Life (BIFL)</strong> is both a philosophy and a growing movement focused on purchasing products that are designed, manufactured, and warrantied to last for many years, ideally a lifetime, with proper care and maintenance.
              </p>

              <p className="text-lg leading-relaxed">
                Rather than participating in the cycle of planned obsolescence and disposable consumer culture, BIFL advocates believe in investing more upfront in products that will serve you reliably for decades. This approach is often summarized by the saying: <em>"Buy once, cry once."</em>
              </p>

              <div className="relative bg-gradient-to-br from-brand-cream to-white p-10 rounded-2xl my-10 shadow-xl border border-brand-teal/20 overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-brand-teal/5 rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-teal/5 rounded-full -ml-16 -mb-16"></div>
                <div className="relative z-10">
                  <h3 className="text-3xl font-semibold text-brand-dark mb-4">The Core Principle</h3>
                  <p className="text-lg text-brand-gray mb-6">
                    It's cheaper in the long run to buy one $200 pair of boots that lasts 20 years than to buy ten $40 pairs that each last 2 years.
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-brand-teal font-bold text-xl">
                    <div className="bg-white px-6 py-3 rounded-lg shadow-md">
                      $200 once
                    </div>
                    <span className="text-3xl">vs.</span>
                    <div className="bg-white px-6 py-3 rounded-lg shadow-md">
                      $400 over 20 years
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-lg leading-relaxed">
                Beyond the financial benefits, BIFL products offer superior performance, reduce environmental impact through less manufacturing and waste, and often provide a more satisfying ownership experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The History Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-dark mb-10 text-center">
              The BIFL Movement & Community
            </h2>

            <div className="prose prose-lg max-w-none text-brand-gray space-y-6">
              <p className="text-lg leading-relaxed">
                While the concept of buying quality has existed for generations, the modern BIFL movement gained significant momentum with the creation of the <strong>r/BuyItForLife subreddit</strong> in 2009. This community has grown to over <strong>2.6 million members</strong> who share recommendations, success stories, and advice on durable products.
              </p>

              <div className="grid md:grid-cols-3 gap-6 my-10">
                <Card className="bg-white border-0 shadow-xl text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="text-5xl font-bold text-brand-teal mb-3">2009</div>
                    <div className="text-sm font-medium text-brand-gray uppercase tracking-wide">Community Founded</div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-0 shadow-xl text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="text-5xl font-bold text-brand-teal mb-3">2.6M+</div>
                    <div className="text-sm font-medium text-brand-gray uppercase tracking-wide">Active Members</div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-0 shadow-xl text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="text-5xl font-bold text-brand-teal mb-3">1000s</div>
                    <div className="text-sm font-medium text-brand-gray uppercase tracking-wide">Products Reviewed</div>
                  </CardContent>
                </Card>
              </div>

              <p className="text-lg leading-relaxed">
                The community shares stories of products that have lasted decades: cast iron skillets passed down through generations, leather boots resoled multiple times, mechanical watches that still tick after 50 years. These aren't just products, they're testaments to quality craftsmanship.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why BIFL Matters Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-dark mb-14 text-center">
              Why Buy It For Life Matters
            </h2>

            <div className="space-y-6">
              {/* Financial Benefits */}
              <Card className="bg-gradient-to-br from-brand-cream to-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                <CardContent className="p-10">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-gradient-to-br from-brand-teal to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          <circle cx="12" cy="12" r="10" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 8h.01M15 8h.01M9 16h6" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-semibold text-brand-dark mb-4">Financial Savings</h3>
                      <p className="text-brand-gray text-lg mb-6 leading-relaxed">
                        While BIFL products cost more upfront, they save money over time by eliminating repeated purchases. A quality product that lasts 20 years is almost always cheaper than replacing cheap alternatives every few years.
                      </p>
                      <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl shadow-md border border-brand-teal/20">
                        <p className="text-sm text-brand-dark mb-3 font-semibold">Example: Kitchen Knives</p>
                        <p className="text-sm text-brand-gray mb-1">Cheap set: $30 every 2 years = $150 over 10 years</p>
                        <p className="text-sm text-brand-gray">BIFL set: $200 once, lasts 30+ years</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Environmental Impact */}
              <Card className="bg-gradient-to-br from-brand-cream to-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                <CardContent className="p-10">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-gradient-to-br from-brand-teal to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-semibold text-brand-dark mb-4">Environmental Sustainability</h3>
                      <p className="text-brand-gray text-lg mb-6 leading-relaxed">
                        BIFL products dramatically reduce waste and environmental impact. Every product that doesn't end up in a landfill, and every product that doesn't need to be manufactured, shipped, and packaged saves resources and reduces pollution.
                      </p>
                      <ul className="space-y-3 text-brand-gray">
                        <li className="flex items-start gap-3">
                          <span className="text-brand-teal mt-1 text-xl font-bold">✓</span>
                          <span>Less manufacturing = reduced carbon emissions</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-brand-teal mt-1 text-xl font-bold">✓</span>
                          <span>Fewer products in landfills</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-brand-teal mt-1 text-xl font-bold">✓</span>
                          <span>Less packaging waste</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-brand-teal mt-1 text-xl font-bold">✓</span>
                          <span>Reduced transportation and shipping</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quality of Life */}
              <Card className="bg-gradient-to-br from-brand-cream to-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                <CardContent className="p-10">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-gradient-to-br from-brand-teal to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-semibold text-brand-dark mb-4">Better User Experience</h3>
                      <p className="text-brand-gray text-lg leading-relaxed">
                        BIFL products simply work better. They're more reliable, perform better, feel more satisfying to use, and eliminate the frustration of dealing with broken or malfunctioning items. Plus, there's real satisfaction in owning something well-made that improves with age rather than deteriorates.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Against Planned Obsolescence */}
              <Card className="bg-gradient-to-br from-brand-cream to-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                <CardContent className="p-10">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-gradient-to-br from-brand-teal to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-semibold text-brand-dark mb-4">Fighting Planned Obsolescence</h3>
                      <p className="text-brand-gray text-lg leading-relaxed">
                        Many modern products are intentionally designed to fail or become obsolete quickly. BIFL is about rejecting this wasteful practice and supporting manufacturers who prioritize durability, repairability, and longevity. Your purchasing decisions send a message to companies about what you value.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes a Product BIFL Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 via-brand-cream/30 to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-dark mb-10 text-center">
              What Makes a Product "Buy It For Life"?
            </h2>
            <p className="text-xl text-brand-gray text-center mb-14 max-w-3xl mx-auto">
              Not every expensive product is BIFL, and not every BIFL product is expensive. Here's what to look for:
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                { num: "01", title: "Exceptional Durability", desc: "Built with quality materials (stainless steel, solid wood, full-grain leather) and superior construction methods that withstand decades of regular use." },
                { num: "02", title: "Easy Repairability", desc: "Designed to be maintained and repaired rather than replaced. Replacement parts are available, repair guides exist, and the product isn't sealed or glued shut." },
                { num: "03", title: "Strong Warranty", desc: "Backed by lifetime or extensive warranties that the manufacturer actually honors. A strong warranty signals confidence in the product's durability." },
                { num: "04", title: "Timeless Design", desc: "Classic, functional design that won't look dated in 10 years. Avoids trendy features that will seem outdated quickly." },
                { num: "05", title: "Proven Track Record", desc: "Verified by real users who've owned the product for years or decades. Community consensus from long-term owners is a powerful signal." },
                { num: "06", title: "Manufacturer Integrity", desc: "Made by companies with a commitment to quality and longevity. They stand behind their products and haven't diluted quality over time." }
              ].map((item) => (
                <Card key={item.num} className="bg-white border-l-4 border-brand-teal shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-14 h-14 bg-gradient-to-br from-brand-teal to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <span className="text-white font-bold text-xl">{item.num}</span>
                      </div>
                      <h3 className="text-2xl font-semibold text-brand-dark">{item.title}</h3>
                    </div>
                    <p className="text-brand-gray leading-relaxed">
                      {item.desc}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BIFL vs Cheap Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-dark mb-14 text-center">
              BIFL Products vs. Disposable Alternatives
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* BIFL Column */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-brand-teal shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-10">
                  <h3 className="text-3xl font-bold text-brand-dark mb-8 flex items-center gap-3">
                    <span className="text-4xl">✓</span> BIFL Products
                  </h3>
                  <ul className="space-y-4 text-brand-gray">
                    {[
                      "Higher upfront cost, lower lifetime cost",
                      "Made with premium, durable materials",
                      "Designed to be repaired and maintained",
                      "Backed by strong warranties",
                      "Lasts 10-30+ years or lifetime",
                      "Better performance and user experience",
                      "Minimal environmental impact",
                      "Can develop character and patina with age"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 group">
                        <span className="text-brand-teal font-bold mt-1 text-lg group-hover:scale-125 transition-transform duration-200">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Disposable Column */}
              <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-10">
                  <h3 className="text-3xl font-bold text-brand-dark mb-8 flex items-center gap-3">
                    <span className="text-4xl">✗</span> Disposable Products
                  </h3>
                  <ul className="space-y-4 text-brand-gray">
                    {[
                      "Lower upfront cost, higher lifetime cost",
                      "Made with cheap materials (plastic, particle board)",
                      "Designed to be replaced, not repaired",
                      "Minimal or no warranty coverage",
                      "Lasts 1-3 years before breaking",
                      "Poor performance and reliability",
                      "High environmental impact from waste",
                      "Deteriorates and looks worn quickly"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 group">
                        <span className="text-red-500 font-bold mt-1 text-lg group-hover:scale-125 transition-transform duration-200">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Real Examples Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-dark mb-10 text-center">
              Real BIFL Success Stories
            </h2>
            <p className="text-xl text-brand-gray text-center mb-14">
              These are the kinds of products that define the BIFL philosophy:
            </p>

            <div className="space-y-5">
              {[
                { title: "Cast Iron Cookware", desc: "Lodge, Le Creuset, and vintage cast iron skillets regularly last 50-100+ years. With proper seasoning and care, they improve with age and can be passed down through generations. Cost: $20-$200." },
                { title: "Quality Leather Boots", desc: "Brands like Red Wing, Danner, and Alden make Goodyear-welted boots that can be resoled multiple times. With care and occasional resoling, they last 20-30+ years. Cost: $200-$500." },
                { title: "Mechanical Watches", desc: "Swiss mechanical watches from brands like Rolex, Omega, and Seiko can run for 50+ years with periodic servicing. They're passed down as heirlooms. Cost: $500-$10,000+." },
                { title: "Kitchen Appliances", desc: "KitchenAid stand mixers and Vitamix blenders are famous for lasting 20-30+ years with regular use. Many users report models from the 1970s-80s still running strong. Cost: $300-$600." },
                { title: "Hand Tools", desc: "Quality hand tools from manufacturers like Snap-on, Craftsman (vintage), and Stanley often come with lifetime warranties and are still functional after 40-50+ years of professional use. Cost: $50-$500 per tool." },
                { title: "Backpacks & Luggage", desc: "Brands like Tom Bihn, Osprey, and Filson make bags with lifetime warranties. Users report 15-25+ years of daily use without failure. Cost: $150-$400." }
              ].map((item, i) => (
                <Card key={i} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-l-4 border-transparent hover:border-brand-teal">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-semibold text-brand-dark mb-3">{item.title}</h3>
                    <p className="text-brand-gray leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Common Misconceptions Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-dark mb-14 text-center">
              Common BIFL Misconceptions
            </h2>

            <div className="space-y-6">
              {[
                { myth: "BIFL Means Buying the Most Expensive Option", reality: "BIFL is about value, not price. A $30 Victorinox chef's knife is more BIFL than many $200 knives. Focus on quality, durability, and repairability, not the price tag." },
                { myth: "Everything Can Be BIFL", reality: "Some products can't realistically be BIFL due to technology evolution (smartphones, computers) or consumable nature (shoes with certain uses). BIFL works best for products where design and function are stable." },
                { myth: "BIFL Products Don't Need Maintenance", reality: "Most BIFL products require proper care and occasional maintenance. Leather needs conditioning, cast iron needs seasoning, tools need cleaning. Part of BIFL is learning to maintain your possessions." },
                { myth: "Vintage is Always Better", reality: "While some vintage products were better made, many modern BIFL products benefit from improved materials, manufacturing techniques, and safety standards. Evaluate each product on its merits." }
              ].map((item, i) => (
                <Card key={i} className="bg-gradient-to-r from-brand-cream to-white border-l-4 border-brand-teal shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-x-2">
                  <CardContent className="p-8">
                    <h3 className="text-xl font-semibold text-brand-dark mb-3 flex items-center gap-2">
                      <span className="text-2xl">❌</span> "{item.myth}"
                    </h3>
                    <p className="text-brand-gray leading-relaxed">
                      <strong className="text-brand-teal">Reality:</strong> {item.reality}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started with BIFL Section */}
      <section className="py-20 bg-gradient-to-b from-brand-cream/50 to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-dark mb-10 text-center">
              How to Start Your BIFL Journey
            </h2>

            <div className="prose prose-lg max-w-none text-brand-gray space-y-6">
              <p className="text-lg leading-relaxed text-center mb-14">
                Transitioning to a BIFL mindset doesn't happen overnight. Here's how to start:
              </p>

              <ol className="space-y-6 list-none">
                {[
                  { title: "Start with Your Next Replacement", desc: "Don't throw out everything you own. When something breaks or wears out, that's your opportunity to buy the BIFL version. Gradually build a collection of quality items." },
                  { title: "Do Your Research", desc: "Read reviews from long-term owners, check community recommendations on r/BuyItForLife, and browse our product directory. Look for consistent praise over many years.", link: true },
                  { title: "Prioritize High-Use Items", desc: "Focus first on products you use daily or frequently: shoes, cookware, tools, bags. These offer the best return on investment and have the biggest impact on your life." },
                  { title: "Learn Basic Maintenance", desc: "Part of BIFL is learning to care for your possessions. Learn to condition leather, season cast iron, sharpen knives, and perform basic repairs. These skills multiply the lifespan of quality products." },
                  { title: "Calculate Total Cost of Ownership", desc: "Before buying, calculate the cost per year of use. A $300 item that lasts 20 years ($15/year) is cheaper than a $50 item that lasts 2 years ($25/year). Think long-term." },
                  { title: "Buy Once, Not Twice", desc: "Resist the temptation to \"try out\" the cheap version first. It's more expensive to buy a $50 item, be disappointed, and then buy the $200 BIFL version you should have bought initially." }
                ].map((item, i) => (
                  <li key={i} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-start gap-5">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-brand-teal to-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                        {i + 1}
                      </div>
                      <div>
                        <h3 className="text-2xl font-semibold text-brand-dark mb-3">
                          {item.title}
                        </h3>
                        <p className="text-brand-gray leading-relaxed">
                          {item.link ? (
                            <>
                              Read reviews from long-term owners, check community recommendations on r/BuyItForLife, and browse our <Link href="/products" className="text-brand-teal font-semibold hover:underline">product directory</Link>. Look for consistent praise over many years.
                            </>
                          ) : (
                            item.desc
                          )}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-brand-teal/10 via-brand-cream to-brand-teal/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(74,157,147,0.15),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(74,157,147,0.1),transparent_50%)]"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-dark mb-8">
              Ready to Discover BIFL Products?
            </h2>
            <p className="text-xl text-brand-gray mb-12 leading-relaxed">
              Explore our curated directory of 327+ products rated on durability, repairability, warranty, and community consensus.
            </p>
            <div className="flex flex-wrap justify-center gap-5">
              <Link
                href="/products"
                className="group bg-gradient-to-r from-brand-teal to-emerald-600 text-white px-10 py-5 rounded-xl font-semibold text-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex items-center gap-2"
              >
                Browse All Products
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
              <Link
                href="/categories"
                className="group bg-white text-brand-teal border-2 border-brand-teal px-10 py-5 rounded-xl font-semibold text-lg hover:bg-brand-cream hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex items-center gap-2"
              >
                Explore by Category
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
            </div>
            <p className="text-sm text-brand-gray mt-8">
              Or learn <Link href="/how-it-works" className="text-brand-teal font-semibold hover:underline">how our rating system works</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
