"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { FeedbackModal } from "@/components/feedback-modal";

export default function HowItWorks() {
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* The Process Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-brand-dark mb-6">The Process</h2>
            <h3 className="text-2xl font-semibold text-brand-dark mb-4">How We Actually Figure Out What's Built to Last</h3>
            <p className="text-xl text-brand-gray max-w-4xl mx-auto">
              We don&apos;t guess. We don&apos;t rely on opinions alone. We systematically dig through the internet&apos;s
              collective wisdom about durable goods, using research techniques and algorithms
              that have been field tested.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {/* Step 1 */}
            <Card className="bg-brand-cream border-0 shadow-lg hover:shadow-xl transition-all duration-300" style={{ '--hover-shadow': '0 20px 25px -5px rgba(74, 157, 147, 0.5), 0 10px 10px -5px rgba(74, 157, 147, 0.4)' } as React.CSSProperties} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--hover-shadow)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = ''}>
              <CardContent className="p-8 text-center">
                <div style={{ width: '48px', height: '48px', backgroundColor: '#4A9D93', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" style={{ fill: '#FFFFFF' }}>
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-brand-dark mb-4">Collect The Data</h4>
                <p className="text-brand-gray">
                  We mine thousands of sources: forums, manufacturer websites, retailers, and focused
                  communities. Then we structure this data to detect patterns, not opinions.
                </p>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="bg-brand-cream border-0 shadow-lg hover:shadow-xl transition-all duration-300" style={{ '--hover-shadow': '0 20px 25px -5px rgba(74, 157, 147, 0.5), 0 10px 10px -5px rgba(74, 157, 147, 0.4)' } as React.CSSProperties} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--hover-shadow)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = ''}>
              <CardContent className="p-8 text-center">
                <div style={{ width: '48px', height: '48px', backgroundColor: '#4A9D93', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" style={{ fill: '#FFFFFF' }}>
                    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10Z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-brand-dark mb-4">Analyse With AI</h4>
                <p className="text-brand-gray">
                  We use advanced algorithms to analyze sentiment, identify real quality mentions like
                  availability, repairability, warranty strength, and user longevity - separate from
                  marketing language and fake reviews.
                </p>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="bg-brand-cream border-0 shadow-lg hover:shadow-xl transition-all duration-300" style={{ '--hover-shadow': '0 20px 25px -5px rgba(74, 157, 147, 0.5), 0 10px 10px -5px rgba(74, 157, 147, 0.4)' } as React.CSSProperties} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--hover-shadow)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = ''}>
              <CardContent className="p-8 text-center">
                <div style={{ width: '48px', height: '48px', backgroundColor: '#4A9D93', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" style={{ fill: '#FFFFFF' }}>
                    <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm2 4v-2H3c0 1.1.89 2 2 2zM3 9h2V7H3v2zm12 12h2v-2h-2v2zm4-18H9c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 12H9V5h10v10zm-8-2h2v-2h-2v2zm0-4h2V7h-2v2zm4 4h2v-2h-2v2zm0-4h2V7h-2v2z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-brand-dark mb-4">Score Across 4 Categories</h4>
                <p className="text-brand-gray">
                  Every product gets rated on:
                </p>
                <ul className="text-brand-gray mt-2 space-y-1">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-brand-teal rounded-full mr-3"></span>
                    Durability
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-brand-teal rounded-full mr-3"></span>
                    Repairability
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-brand-teal rounded-full mr-3"></span>
                    Warranty
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-brand-teal rounded-full mr-3"></span>
                    Social Consensus
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Step 4 */}
            <Card className="bg-brand-cream border-0 shadow-lg hover:shadow-xl transition-all duration-300" style={{ '--hover-shadow': '0 20px 25px -5px rgba(74, 157, 147, 0.5), 0 10px 10px -5px rgba(74, 157, 147, 0.4)' } as React.CSSProperties} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--hover-shadow)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = ''}>
              <CardContent className="p-8 text-center">
                <div style={{ width: '48px', height: '48px', backgroundColor: '#4A9D93', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" style={{ fill: '#FFFFFF' }}>
                    <path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-brand-dark mb-4">Scores That Update</h4>
                <p className="text-brand-gray">
                  Products don&apos;t stay static. We continuously scan data flows to our
                  system whenever new signals about products hit the internet - for
                  better or worse - keeping you accurately tracking up.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* The Scoring System Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-bold text-brand-dark mb-3">The Scoring System</h2>
            <h3 className="text-lg font-semibold text-brand-dark mb-2">What Makes a Product Worth Buying?</h3>
            <p className="text-base text-brand-gray max-w-4xl mx-auto">
              We score every product on a 10-point scale and then bucket scores into these criteria:
            </p>
            <p className="text-sm text-brand-gray mt-2">
              Each product's BIFL Total Score is a weighted average, with the highest importance placed on durability and social consensus,
              followed by warranty and repairability.
            </p>
          </div>

          <div className="max-w-5xl mx-auto space-y-3">
            {/* Durability */}
            <div className="bg-brand-cream border-l-4 p-5 rounded-r-lg hover:shadow-lg transition-shadow" style={{ borderLeftColor: '#4A9D93' }}>
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-brand-teal rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xl">01</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-semibold text-brand-dark mb-2">Durability</h4>
                  <p className="text-brand-gray text-lg">
                    We consider real world evidence of quality materials and build quality, including factors like: are parts easily worn? Can it withstand everyday stresses?
                  </p>
                </div>
              </div>
            </div>

            {/* Repairability */}
            <div className="bg-brand-cream border-l-4 p-5 rounded-r-lg hover:shadow-lg transition-shadow" style={{ borderLeftColor: '#4A9D93' }}>
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-brand-teal rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xl">02</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-semibold text-brand-dark mb-2">Repairability</h4>
                  <p className="text-brand-gray text-lg">
                    How easily can you get parts and qualified repair services when needed? Many products cannot be repaired — or cost more to repair than replace.
                  </p>
                </div>
              </div>
            </div>

            {/* Warranty */}
            <div className="bg-brand-cream border-l-4 p-5 rounded-r-lg hover:shadow-lg transition-shadow" style={{ borderLeftColor: '#4A9D93' }}>
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-brand-teal rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xl">03</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-semibold text-brand-dark mb-2">Warranty</h4>
                  <p className="text-brand-gray text-lg">
                    We look at if there&apos;s a warranty offered, if the warranty is long, and if the company has a history of standing behind their products.
                  </p>
                </div>
              </div>
            </div>

            {/* Social Consensus */}
            <div className="bg-brand-cream border-l-4 p-5 rounded-r-lg hover:shadow-lg transition-shadow" style={{ borderLeftColor: '#4A9D93' }}>
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-brand-teal rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xl">04</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-semibold text-brand-dark mb-2">Social Consensus</h4>
                  <p className="text-brand-gray text-lg">
                    How often people buy the product when they think about buying in the long-term. Multiple owners over long time periods are key signals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Badge System Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-brand-dark mb-6">The Badge System</h2>
            <h3 className="text-2xl font-semibold text-brand-dark mb-4">Trust Signals You Can See at a Glance</h3>
            <p className="text-xl text-brand-gray max-w-4xl mx-auto">
              We created visual trust indicators to help you quickly understand why
              products are trusted by the community. These badges come from our data sources
              and is backed by data.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Gold Standard */}
            <Card className="bg-brand-cream border-0 shadow-lg hover:shadow-xl transition-all duration-300" style={{ '--hover-shadow': '0 20px 25px -5px rgba(74, 157, 147, 0.5), 0 10px 10px -5px rgba(74, 157, 147, 0.4)' } as React.CSSProperties} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--hover-shadow)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = ''}>
              <CardContent className="p-6 text-center">
                <div className="w-32 h-32 mx-auto mb-0">
                  <Image src="/badges/gold-standard.svg" alt="Gold Standard" width={128} height={128} className="w-full h-full" />
                </div>
                <h4 className="text-lg font-semibold text-brand-dark mb-1">Gold Standard</h4>
                <p className="text-xs text-brand-gray mb-3">9.0+ average across all scores</p>
                <p className="text-sm text-brand-gray">
                  A true BIFL benchmark.
                </p>
              </CardContent>
            </Card>

            {/* Lifetime Warranty */}
            <Card className="bg-brand-cream border-0 shadow-lg hover:shadow-xl transition-all duration-300" style={{ '--hover-shadow': '0 20px 25px -5px rgba(74, 157, 147, 0.5), 0 10px 10px -5px rgba(74, 157, 147, 0.4)' } as React.CSSProperties} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--hover-shadow)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = ''}>
              <CardContent className="p-6 text-center">
                <div className="w-32 h-32 mx-auto mb-0">
                  <Image src="/badges/lifetime-warranty.svg" alt="Lifetime Warranty" width={128} height={128} className="w-full h-full" />
                </div>
                <h4 className="text-lg font-semibold text-brand-dark mb-1">Lifetime Warranty</h4>
                <p className="text-xs text-brand-gray mb-3">Warranty score = 10</p>
                <p className="text-sm text-brand-gray">
                  Official lifetime coverage from the manufacturer.
                </p>
              </CardContent>
            </Card>

            {/* Crowd Favorite */}
            <Card className="bg-brand-cream border-0 shadow-lg hover:shadow-xl transition-all duration-300" style={{ '--hover-shadow': '0 20px 25px -5px rgba(74, 157, 147, 0.5), 0 10px 10px -5px rgba(74, 157, 147, 0.4)' } as React.CSSProperties} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--hover-shadow)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = ''}>
              <CardContent className="p-6 text-center">
                <div className="w-32 h-32 mx-auto mb-0">
                  <Image src="/badges/crowd-favorite.svg" alt="Crowd Favorite" width={128} height={128} className="w-full h-full" />
                </div>
                <h4 className="text-lg font-semibold text-brand-dark mb-1">Crowd Favorite</h4>
                <p className="text-xs text-brand-gray mb-3">Social score ≥ 8.5</p>
                <p className="text-sm text-brand-gray">
                  High consensus from long-term owners across Reddit and Amazon.
                </p>
              </CardContent>
            </Card>

            {/* BIFL Approved */}
            <Card className="bg-brand-cream border-0 shadow-lg hover:shadow-xl transition-all duration-300" style={{ '--hover-shadow': '0 20px 25px -5px rgba(74, 157, 147, 0.5), 0 10px 10px -5px rgba(74, 157, 147, 0.4)' } as React.CSSProperties} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--hover-shadow)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = ''}>
              <CardContent className="p-6 text-center">
                <div className="w-32 h-32 mx-auto mb-0">
                  <Image src="/badges/bifl-approved.svg" alt="BIFL Approved" width={128} height={128} className="w-full h-full" />
                </div>
                <h4 className="text-lg font-semibold text-brand-dark mb-1">BIFL Approved</h4>
                <p className="text-xs text-brand-gray mb-3">7.5+ across all categories</p>
                <p className="text-sm text-brand-gray">
                  No major weaknesses — a solid long-term pick.
                </p>
              </CardContent>
            </Card>

            {/* Repair Friendly */}
            <Card className="bg-brand-cream border-0 shadow-lg hover:shadow-xl transition-all duration-300" style={{ '--hover-shadow': '0 20px 25px -5px rgba(74, 157, 147, 0.5), 0 10px 10px -5px rgba(74, 157, 147, 0.4)' } as React.CSSProperties} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--hover-shadow)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = ''}>
              <CardContent className="p-6 text-center">
                <div className="w-32 h-32 mx-auto mb-0">
                  <Image src="/badges/repair-friendly.svg" alt="Repair Friendly" width={128} height={128} className="w-full h-full" />
                </div>
                <h4 className="text-lg font-semibold text-brand-dark mb-1">Repair Friendly</h4>
                <p className="text-xs text-brand-gray mb-3">Repairability score ≥ 8.5</p>
                <p className="text-sm text-brand-gray">
                  Exceptional repairability score — parts, guides, and a community to help you fix it.
                </p>
              </CardContent>
            </Card>

            {/* Eco Hero */}
            <Card className="bg-brand-cream border-0 shadow-lg hover:shadow-xl transition-all duration-300" style={{ '--hover-shadow': '0 20px 25px -5px rgba(74, 157, 147, 0.5), 0 10px 10px -5px rgba(74, 157, 147, 0.4)' } as React.CSSProperties} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--hover-shadow)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = ''}>
              <CardContent className="p-6 text-center">
                <div className="w-32 h-32 mx-auto mb-0">
                  <Image src="/badges/eco-hero.svg" alt="Eco Hero" width={128} height={128} className="w-full h-full" />
                </div>
                <h4 className="text-lg font-semibold text-brand-dark mb-1">Eco Hero</h4>
                <p className="text-xs text-brand-gray mb-3">Bonus Sustainability score ≥ 8.0</p>
                <p className="text-sm text-brand-gray">
                  Outstanding sustainability score, including packaging, materials, and ethics.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-bold text-brand-dark mb-3">FAQ</h2>
            <h3 className="text-xl font-semibold text-brand-dark">You asked. We answered</h3>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {/* FAQ Item 1 */}
            <Card className="bg-white border-0 shadow-lg">
              <CardContent className="p-0">
                <details className="group">
                  <summary className="flex cursor-pointer items-center justify-between p-4 text-base font-semibold text-brand-dark hover:bg-gray-50 transition-colors">
                    What is Buy-It-For-Life?
                    <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-4 pb-4 text-brand-gray text-sm">
                    <p>Buy It For Life (BIFL) refers to products that are built to last for decades or even a lifetime with proper care. These items prioritize quality, durability, and repairability over planned obsolescence.</p>
                  </div>
                </details>
              </CardContent>
            </Card>

            {/* FAQ Item 2 */}
            <Card className="bg-white border-0 shadow-lg">
              <CardContent className="p-0">
                <details className="group">
                  <summary className="flex cursor-pointer items-center justify-between p-4 text-base font-semibold text-brand-dark hover:bg-gray-50 transition-colors">
                    Where Do Your Scores Come From?
                    <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-4 pb-4 text-brand-gray text-sm">
                    <p>Our scores are generated from thousands of data sources including manufacturer specifications, warranty information, user reviews from multiple platforms, repair forums, and community discussions. We use AI to analyze this data objectively.</p>
                  </div>
                </details>
              </CardContent>
            </Card>

            {/* FAQ Item 3 */}
            <Card className="bg-white border-0 shadow-lg">
              <CardContent className="p-0">
                <details className="group">
                  <summary className="flex cursor-pointer items-center justify-between p-4 text-base font-semibold text-brand-dark hover:bg-gray-50 transition-colors">
                    Can I Suggest a Product?
                    <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-4 pb-4 text-brand-gray text-sm">
                    <p>Absolutely! We welcome product suggestions from our community. You can submit suggestions through our feedback form or contact us directly. We'll research and evaluate products based on our methodology.</p>
                  </div>
                </details>
              </CardContent>
            </Card>

            {/* FAQ Item 4 */}
            <Card className="bg-white border-0 shadow-lg">
              <CardContent className="p-0">
                <details className="group">
                  <summary className="flex cursor-pointer items-center justify-between p-4 text-base font-semibold text-brand-dark hover:bg-gray-50 transition-colors">
                    What if I Disagree With a Score?
                    <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-4 pb-4 text-brand-gray text-sm">
                    <p>We encourage feedback! Our scoring system is continuously updated as new data becomes available. If you have specific information about a product's performance, please share it with us through our data correction form.</p>
                  </div>
                </details>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Help Us Improve Section */}
      <section className="py-16 bg-brand-cream">
        <div className="container mx-auto px-6">
          <div className="border border-gray-200 rounded-2xl p-8 bg-white text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-2">Help Us Improve</h2>
            <p className="text-brand-gray mb-6 max-w-xl mx-auto">
              This site is for you. Help us make it better. We&apos;re constantly refining the way we score and present BIFL products. If something&apos;s missing, broken, or off — we want to hear from you.
            </p>
            <button
              onClick={() => setIsFeedbackModalOpen(true)}
              className="bg-gray-700 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Leave Us Feedback
            </button>
          </div>
        </div>
      </section>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
    </div>
  );
}