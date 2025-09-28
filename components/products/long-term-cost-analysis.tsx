'use client'

interface CostAnalysisData {
  biflProduct: {
    name: string
    initialCost: number
    maintenanceCosts?: {
      years: number[]
      cost: number
      description: string
    }[]
    expectedLifespan: number
  }
  typicalProduct: {
    name: string
    initialCost: number
    replacementFrequency: number // years
    expectedLifespan: number
  }
  analysisYears: number
}

// Category-specific cost analysis data
const CATEGORY_COST_DATA: Record<string, CostAnalysisData> = {
  footwear: {
    biflProduct: {
      name: "Iron Ranger (BIFL)",
      initialCost: 320,
      maintenanceCosts: [
        { years: [7], cost: 120, description: "Resole at year 7" }
      ],
      expectedLifespan: 15
    },
    typicalProduct: {
      name: "Typical Boots",
      initialCost: 80,
      replacementFrequency: 2.5,
      expectedLifespan: 2.5
    },
    analysisYears: 15
  },
  bags: {
    biflProduct: {
      name: "Premium Leather Bag (BIFL)",
      initialCost: 250,
      maintenanceCosts: [
        { years: [5, 10], cost: 40, description: "Conditioning treatment" }
      ],
      expectedLifespan: 20
    },
    typicalProduct: {
      name: "Typical Bag",
      initialCost: 60,
      replacementFrequency: 3,
      expectedLifespan: 3
    },
    analysisYears: 15
  },
  tools: {
    biflProduct: {
      name: "Professional Tool Set (BIFL)",
      initialCost: 450,
      maintenanceCosts: [
        { years: [8], cost: 80, description: "Handle replacement/sharpening" }
      ],
      expectedLifespan: 25
    },
    typicalProduct: {
      name: "Typical Tools",
      initialCost: 120,
      replacementFrequency: 4,
      expectedLifespan: 4
    },
    analysisYears: 15
  },
  kitchen: {
    biflProduct: {
      name: "Cast Iron Cookware (BIFL)",
      initialCost: 180,
      maintenanceCosts: [
        { years: [5, 10], cost: 25, description: "Re-seasoning service" }
      ],
      expectedLifespan: 50
    },
    typicalProduct: {
      name: "Typical Cookware",
      initialCost: 65,
      replacementFrequency: 3.5,
      expectedLifespan: 3.5
    },
    analysisYears: 15
  },
  outdoor: {
    biflProduct: {
      name: "Professional Backpack (BIFL)",
      initialCost: 280,
      maintenanceCosts: [
        { years: [6, 12], cost: 60, description: "Zipper/strap repair" }
      ],
      expectedLifespan: 20
    },
    typicalProduct: {
      name: "Typical Backpack",
      initialCost: 75,
      replacementFrequency: 2.5,
      expectedLifespan: 2.5
    },
    analysisYears: 15
  }
}

// Default fallback data
const DEFAULT_COST_DATA: CostAnalysisData = {
  biflProduct: {
    name: "BIFL Product",
    initialCost: 200,
    maintenanceCosts: [
      { years: [7], cost: 50, description: "Maintenance at year 7" }
    ],
    expectedLifespan: 15
  },
  typicalProduct: {
    name: "Typical Product",
    initialCost: 60,
    replacementFrequency: 3,
    expectedLifespan: 3
  },
  analysisYears: 15
}

interface LongTermCostAnalysisProps {
  product: any
  category?: string
}

function calculateCosts(data: CostAnalysisData) {
  const { biflProduct, typicalProduct, analysisYears } = data

  // Calculate BIFL total cost
  let biflTotalCost = biflProduct.initialCost
  if (biflProduct.maintenanceCosts) {
    biflProduct.maintenanceCosts.forEach(maintenance => {
      maintenance.years.forEach(year => {
        if (year <= analysisYears) {
          biflTotalCost += maintenance.cost
        }
      })
    })
  }

  // Calculate typical product total cost
  const replacementsNeeded = Math.floor(analysisYears / typicalProduct.replacementFrequency)
  const typicalTotalCost = typicalProduct.initialCost + (replacementsNeeded * typicalProduct.initialCost)

  // Calculate savings
  const savings = typicalTotalCost - biflTotalCost

  return {
    biflTotalCost,
    typicalTotalCost,
    savings,
    replacementsNeeded: replacementsNeeded + 1 // +1 for initial purchase
  }
}

export function LongTermCostAnalysis({ product, category }: LongTermCostAnalysisProps) {
  // Determine which cost data to use based on category
  const getCostData = (): CostAnalysisData => {
    if (category && CATEGORY_COST_DATA[category.toLowerCase()]) {
      return CATEGORY_COST_DATA[category.toLowerCase()]
    }

    // Try to match by product name or other attributes
    const productName = (product.name || '').toLowerCase()
    const productCategory = (product.category || '').toLowerCase()

    if (productName.includes('boot') || productName.includes('shoe') || productCategory.includes('footwear')) {
      return CATEGORY_COST_DATA.footwear
    }
    if (productName.includes('bag') || productName.includes('backpack') || productCategory.includes('bag')) {
      return productCategory.includes('outdoor') ? CATEGORY_COST_DATA.outdoor : CATEGORY_COST_DATA.bags
    }
    if (productName.includes('tool') || productCategory.includes('tool')) {
      return CATEGORY_COST_DATA.tools
    }
    if (productName.includes('cook') || productName.includes('kitchen') || productCategory.includes('kitchen')) {
      return CATEGORY_COST_DATA.kitchen
    }
    if (productCategory.includes('outdoor') || productName.includes('backpack')) {
      return CATEGORY_COST_DATA.outdoor
    }

    return DEFAULT_COST_DATA
  }

  const costData = getCostData()
  const calculations = calculateCosts(costData)

  // Update with actual product data if available
  if (product.price) {
    costData.biflProduct.initialCost = parseFloat(product.price)
    costData.biflProduct.name = product.name || costData.biflProduct.name
  }

  // Recalculate with updated data
  const finalCalculations = calculateCosts(costData)

  return (
    <section className="mt-16 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-center">Long-term Cost Analysis</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* BIFL Product Column */}
        <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-xl border border-teal-100">
          <h3 className="text-lg font-bold text-teal-800 mb-4">{costData.biflProduct.name}</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Initial cost:</span>
              <span className="font-semibold">${costData.biflProduct.initialCost}</span>
            </div>

            {costData.biflProduct.maintenanceCosts?.map((maintenance, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-gray-600">{maintenance.description}:</span>
                <span className="font-semibold">${maintenance.cost}</span>
              </div>
            ))}

            <div className="flex justify-between">
              <span className="text-gray-600">Expected lifespan:</span>
              <span className="font-semibold">{costData.biflProduct.expectedLifespan}+ years</span>
            </div>

            <div className="border-t border-teal-200 pt-3 mt-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-teal-800">Total {costData.analysisYears}-year cost:</span>
                <span className="font-bold text-lg text-green-600">${finalCalculations.biflTotalCost}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Typical Product Column */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-xl border border-red-100">
          <h3 className="text-lg font-bold text-red-800 mb-4">{costData.typicalProduct.name}</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Initial cost:</span>
              <span className="font-semibold">${costData.typicalProduct.initialCost}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Replacements ({finalCalculations.replacementsNeeded - 1}x):</span>
              <span className="font-semibold">${(finalCalculations.replacementsNeeded - 1) * costData.typicalProduct.initialCost}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Expected lifespan:</span>
              <span className="font-semibold">{costData.typicalProduct.expectedLifespan} years each</span>
            </div>

            <div className="border-t border-red-200 pt-3 mt-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-red-800">Total {costData.analysisYears}-year cost:</span>
                <span className="font-bold text-lg text-red-600">${finalCalculations.typicalTotalCost}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Savings Summary */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-teal-500 to-green-500 text-white px-6 py-3 rounded-full">
          <span className="text-lg font-bold">
            Save ${finalCalculations.savings} over {costData.analysisYears} years + superior performance
          </span>
        </div>

        <p className="mt-4 text-sm text-gray-600 max-w-2xl mx-auto">
          This analysis assumes typical replacement patterns and maintenance costs.
          BIFL products often provide additional benefits like superior performance,
          warranty coverage, and environmental sustainability that aren't reflected in cost alone.
        </p>
      </div>
    </section>
  )
}