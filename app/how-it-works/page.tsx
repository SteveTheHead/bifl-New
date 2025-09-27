"use client";

import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";

export default function HowItWorks() {
  return (
    <div className="min-h-screen">
      {/* The Process Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-brand-dark mb-6">The Process</h2>
            <h3 className="text-2xl font-semibold text-brand-dark mb-4">How We Actually Figure Out What's Built to Last</h3>
            <p className="text-xl text-brand-gray max-w-4xl mx-auto">
              We don't guess. We don't rely on opinions alone. We systematically dig through the internet's
              collective wisdom about durable goods, using research techniques and algorithms
              that have been field tested.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {/* Step 1 */}
            <Card className="bg-brand-cream border-0 shadow-lg hover:shadow-xl transition-shadow">
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
            <Card className="bg-brand-cream border-0 shadow-lg hover:shadow-xl transition-shadow">
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
            <Card className="bg-brand-cream border-0 shadow-lg hover:shadow-xl transition-shadow">
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
            <Card className="bg-brand-cream border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div style={{ width: '48px', height: '48px', backgroundColor: '#4A9D93', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" style={{ fill: '#FFFFFF' }}>
                    <path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-brand-dark mb-4">Scores That Update</h4>
                <p className="text-brand-gray">
                  Products don't stay static. We continuously scan data flows to our
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
                    We look at if there's a warranty offered, if the warranty is long, and if the company has a history of standing behind their products.
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
            <Card className="bg-brand-cream border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-32 h-32 mx-auto mb-0">
                  <img src="/badges/gold-standard.svg" alt="Gold Standard" className="w-full h-full" />
                </div>
                <h4 className="text-lg font-semibold text-brand-dark mb-1">Gold Standard</h4>
                <p className="text-xs text-brand-gray mb-3">9.0+ average across all scores</p>
                <p className="text-sm text-brand-gray">
                  A true BIFL benchmark.
                </p>
              </CardContent>
            </Card>

            {/* Lifetime Warranty */}
            <Card className="bg-brand-cream border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-32 h-32 mx-auto mb-0">
                  <img src="/badges/lifetime-warranty.svg" alt="Lifetime Warranty" className="w-full h-full" />
                </div>
                <h4 className="text-lg font-semibold text-brand-dark mb-1">Lifetime Warranty</h4>
                <p className="text-xs text-brand-gray mb-3">Warranty score = 10</p>
                <p className="text-sm text-brand-gray">
                  Official lifetime coverage from the manufacturer.
                </p>
              </CardContent>
            </Card>

            {/* Crowd Favorite */}
            <Card className="bg-brand-cream border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-32 h-32 mx-auto mb-0">
                  <img src="/badges/crowd-favorite.svg" alt="Crowd Favorite" className="w-full h-full" />
                </div>
                <h4 className="text-lg font-semibold text-brand-dark mb-1">Crowd Favorite</h4>
                <p className="text-xs text-brand-gray mb-3">Social score ≥ 8.5</p>
                <p className="text-sm text-brand-gray">
                  High consensus from long-term owners across Reddit and Amazon.
                </p>
              </CardContent>
            </Card>

            {/* BIFL Approved */}
            <Card className="bg-brand-cream border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-32 h-32 mx-auto mb-0">
                  <img src="/badges/bifl-approved.svg" alt="BIFL Approved" className="w-full h-full" />
                </div>
                <h4 className="text-lg font-semibold text-brand-dark mb-1">BIFL Approved</h4>
                <p className="text-xs text-brand-gray mb-3">7.5+ across all categories</p>
                <p className="text-sm text-brand-gray">
                  No major weaknesses — a solid long-term pick.
                </p>
              </CardContent>
            </Card>

            {/* Repair Friendly */}
            <Card className="bg-brand-cream border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-32 h-32 mx-auto mb-0">
                  <img src="/badges/repair-friendly.svg" alt="Repair Friendly" className="w-full h-full" />
                </div>
                <h4 className="text-lg font-semibold text-brand-dark mb-1">Repair Friendly</h4>
                <p className="text-xs text-brand-gray mb-3">Repairability score ≥ 8.5</p>
                <p className="text-sm text-brand-gray">
                  Exceptional repairability score — parts, guides, and a community to help you fix it.
                </p>
              </CardContent>
            </Card>

            {/* Eco Hero */}
            <Card className="bg-brand-cream border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-32 h-32 mx-auto mb-0">
                  <img src="/badges/eco-hero.svg" alt="Eco Hero" className="w-full h-full" />
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
  );
}