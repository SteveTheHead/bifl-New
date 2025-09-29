'use client'

import { BuyingGuide } from '@/lib/ai/buying-guide'
import { BookOpen, CheckCircle, DollarSign, Info } from 'lucide-react'

interface BuyingGuideSectionProps {
  buyingGuide: BuyingGuide | null
  loading: boolean
  categoryName: string
}

export function BuyingGuideSection({ buyingGuide, loading, categoryName }: BuyingGuideSectionProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="animate-pulse">
          <div className="flex items-center mb-6">
            <BookOpen className="w-6 h-6 mr-3 text-brand-teal" />
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!buyingGuide) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <BookOpen className="w-12 h-12 mx-auto text-brand-gray mb-4" />
        <h3 className="text-lg font-semibold text-brand-dark mb-2">
          Buying Guide Unavailable
        </h3>
        <p className="text-brand-gray">
          We're working on generating a comprehensive buying guide for {categoryName}.
          Please check back soon!
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-teal to-brand-teal/80 text-white p-6">
        <div className="flex items-center mb-3">
          <BookOpen className="w-6 h-6 mr-3" />
          <h3 className="text-xl font-bold">AI-Generated Buying Guide</h3>
        </div>
        <p className="text-brand-teal-light/90 leading-relaxed">
          {buyingGuide.introduction}
        </p>
      </div>

      <div className="p-6">
        {/* Key Factors */}
        {buyingGuide.keyFactors && buyingGuide.keyFactors.length > 0 && (
          <div className="mb-8">
            <h4 className="font-semibold text-brand-dark mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-brand-teal" />
              Key Factors to Consider
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {buyingGuide.keyFactors.map((factor, index) => (
                <div
                  key={index}
                  className="bg-brand-teal/5 border border-brand-teal/20 rounded-lg px-3 py-2 text-sm font-medium text-brand-teal text-center"
                >
                  {factor}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Guide Sections */}
        <div className="space-y-8 mb-8">
          {buyingGuide.sections
            .sort((a, b) => a.order - b.order)
            .map((section, index) => (
              <div key={index} className="border-l-4 border-brand-teal pl-6">
                <h4 className="font-semibold text-brand-dark mb-3 flex items-center">
                  <div className="w-8 h-8 bg-brand-teal text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    {section.order}
                  </div>
                  {section.title}
                </h4>
                <div className="prose prose-sm max-w-none text-brand-gray leading-relaxed">
                  {section.content.split('\n').map((paragraph, pIndex) => (
                    <p key={pIndex} className={pIndex > 0 ? 'mt-3' : ''}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))}
        </div>

        {/* Price Ranges */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h4 className="font-semibold text-brand-dark mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-brand-teal" />
            Price Range Guide
          </h4>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h5 className="font-medium text-green-600 mb-2">Budget</h5>
              <p className="text-sm text-brand-gray leading-relaxed">
                {buyingGuide.priceRanges.budget}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h5 className="font-medium text-blue-600 mb-2">Mid-Range</h5>
              <p className="text-sm text-brand-gray leading-relaxed">
                {buyingGuide.priceRanges.midRange}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h5 className="font-medium text-purple-600 mb-2">Premium</h5>
              <p className="text-sm text-brand-gray leading-relaxed">
                {buyingGuide.priceRanges.premium}
              </p>
            </div>
          </div>
        </div>

        {/* Conclusion */}
        <div className="bg-brand-teal/5 border border-brand-teal/20 rounded-lg p-6">
          <h4 className="font-semibold text-brand-dark mb-3 flex items-center">
            <Info className="w-5 h-5 mr-2 text-brand-teal" />
            Bottom Line
          </h4>
          <div className="prose prose-sm max-w-none text-brand-gray leading-relaxed">
            {buyingGuide.conclusion.split('\n').map((paragraph, index) => (
              <p key={index} className={index > 0 ? 'mt-3' : ''}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* AI Disclaimer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-brand-gray text-center">
            This buying guide was generated using AI based on product data and expert insights.
            Individual needs may vary - consider your specific requirements when making purchases.
          </p>
        </div>
      </div>
    </div>
  )
}