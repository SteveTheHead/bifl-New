'use client'

import { Check, X } from 'lucide-react'

interface Product {
  durability_score?: number | null
  durability_notes?: string | null
  repairability_score?: number | null
  repairability_notes?: string | null
  warranty_score?: number | null
  warranty_notes?: string | null
  social_score?: number | null
  social_notes?: string | null
  bifl_total_score?: number | null
  pros_cons?: {
    pros?: string[]
    cons?: string[]
  } | null
}

interface ProductProsConsProps {
  product: Product
}

export function ProductProsCons({ product }: ProductProsConsProps) {
  // Check if product has custom pros/cons in database
  if (product.pros_cons?.pros || product.pros_cons?.cons) {
    const { pros = [], cons = [] } = product.pros_cons

    if (pros.length === 0 && cons.length === 0) {
      return null
    }

    return renderProsConsSection(pros, cons, 'Pros and Cons')
  }

  // Generate pros/cons from product scores and notes
  const pros: string[] = []
  const cons: string[] = []

  // Durability
  if (product.durability_score && product.durability_score >= 8) {
    pros.push('Exceptional durability and build quality')
  } else if (product.durability_score && product.durability_score <= 5) {
    cons.push('Durability concerns reported')
  }

  // Repairability
  if (product.repairability_score && product.repairability_score >= 8) {
    pros.push('Highly repairable with available parts')
  } else if (product.repairability_score && product.repairability_score <= 5) {
    cons.push('Limited repairability options')
  }

  // Warranty
  if (product.warranty_score && product.warranty_score >= 8) {
    pros.push('Excellent warranty coverage')
  } else if (product.warranty_score && product.warranty_score <= 5) {
    cons.push('Limited warranty protection')
  }

  // Social/Sustainability
  if (product.social_score && product.social_score >= 8) {
    pros.push('Strong social and environmental responsibility')
  } else if (product.social_score && product.social_score <= 5) {
    cons.push('Social or sustainability concerns')
  }

  // Overall BIFL score
  if (product.bifl_total_score && product.bifl_total_score >= 9) {
    pros.push('Top-rated BIFL product - exceptional value')
  }

  // Parse notes for additional insights
  if (product.durability_notes) {
    extractInsights(product.durability_notes, pros, cons, 'durability')
  }
  if (product.repairability_notes) {
    extractInsights(product.repairability_notes, pros, cons, 'repairability')
  }

  if (pros.length === 0 && cons.length === 0) {
    return null
  }

  return renderProsConsSection(pros, cons, 'Pros and Cons')
}

// Helper function to extract insights from notes
function extractInsights(notes: string, pros: string[], cons: string[], category: string) {
  const lowerNotes = notes.toLowerCase()

  // Positive indicators
  if (lowerNotes.includes('lifetime') || lowerNotes.includes('decades')) {
    if (!pros.some(p => p.includes('Long-lasting'))) {
      pros.push('Long-lasting construction')
    }
  }
  if (lowerNotes.includes('easy to repair') || lowerNotes.includes('user-serviceable')) {
    if (!pros.some(p => p.includes('repair'))) {
      pros.push('Easy to maintain and repair')
    }
  }

  // Negative indicators
  if (lowerNotes.includes('expensive') && category === 'durability') {
    if (!cons.some(c => c.includes('price'))) {
      cons.push('Higher price point')
    }
  }
  if (lowerNotes.includes('difficult to') || lowerNotes.includes('hard to')) {
    if (!cons.some(c => c.includes('maintenance'))) {
      cons.push('Requires specific maintenance')
    }
  }
}

// Render function
function renderProsConsSection(pros: string[], cons: string[], title: string) {
  return (
    <section className="mt-16 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Pros Column */}
        <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-xl border border-teal-100">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center mr-3">
              <Check className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-teal-800">What Users Love</h3>
          </div>

          <div className="space-y-3">
            {pros.length > 0 ? (
              pros.map((pro, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700 leading-relaxed">{pro}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600 italic">No specific pros mentioned yet</p>
            )}
          </div>
        </div>

        {/* Cons Column */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-xl border border-red-100">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
              <X className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-red-800">Areas for Improvement</h3>
          </div>

          <div className="space-y-3">
            {cons.length > 0 ? (
              cons.map((con, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700 leading-relaxed">{con}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600 italic">No specific cons mentioned yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Based on our comprehensive product research and scoring methodology
        </p>
      </div>
    </section>
  )
}