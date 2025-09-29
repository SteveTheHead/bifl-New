import { AIService } from './index'

export interface BuyingGuideSection {
  title: string
  content: string
  order: number
}

export interface BuyingGuide {
  introduction: string
  sections: BuyingGuideSection[]
  conclusion: string
  keyFactors: string[]
  priceRanges: {
    budget: string
    midRange: string
    premium: string
  }
}

export class BuyingGuideGenerator {
  private aiService: AIService

  constructor() {
    this.aiService = new AIService()
  }

  async generateBuyingGuide(
    categoryName: string,
    categoryDescription: string | null,
    products: any[]
  ): Promise<BuyingGuide> {
    const prompt = this.createBuyingGuidePrompt(categoryName, categoryDescription, products)

    try {
      const response = await this.aiService.generateContent(prompt)
      return this.parseBuyingGuideResponse(response)
    } catch (error) {
      console.error('Error generating buying guide:', error)
      return this.getFallbackBuyingGuide(categoryName)
    }
  }

  private createBuyingGuidePrompt(
    categoryName: string,
    categoryDescription: string | null,
    products: any[]
  ): string {
    const productInfo = products.slice(0, 10).map(p => ({
      name: p.name,
      brand: p.brand_name,
      price: p.price,
      durabilityScore: p.durability_score,
      repairabilityScore: p.repairability_score,
      warrantyYears: p.warranty_years,
      keyFeatures: p.key_features,
      pros: p.pros,
      cons: p.cons
    }))

    return `Create a comprehensive buying guide for ${categoryName} products.
${categoryDescription ? `Category description: ${categoryDescription}` : ''}

Based on the following products in this category:
${JSON.stringify(productInfo, null, 2)}

Generate a detailed buying guide in JSON format with the following structure:
{
  "introduction": "Brief introduction explaining what makes these products BIFL quality",
  "sections": [
    {
      "title": "Key Features to Look For",
      "content": "Detailed explanation of important features",
      "order": 1
    },
    {
      "title": "Material Quality and Durability",
      "content": "What materials and construction to prioritize",
      "order": 2
    },
    {
      "title": "Repairability and Maintenance",
      "content": "How to ensure long-term serviceability",
      "order": 3
    },
    {
      "title": "Warranty and Support",
      "content": "What warranty coverage to expect",
      "order": 4
    },
    {
      "title": "Brand Recommendations",
      "content": "Top brands in this category and why",
      "order": 5
    }
  ],
  "conclusion": "Summary of key takeaways for buyers",
  "keyFactors": ["Factor 1", "Factor 2", "Factor 3", "Factor 4", "Factor 5"],
  "priceRanges": {
    "budget": "Description of budget options ($X-Y range)",
    "midRange": "Description of mid-range options ($X-Y range)",
    "premium": "Description of premium options ($X-Y range)"
  }
}

Focus on BIFL principles: durability, repairability, warranty, and long-term value. Make the content practical and actionable for buyers.`
  }

  private parseBuyingGuideResponse(response: string): BuyingGuide {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])

        // Validate the structure
        if (parsed.introduction && parsed.sections && parsed.conclusion) {
          return {
            introduction: parsed.introduction,
            sections: Array.isArray(parsed.sections) ? parsed.sections : [],
            conclusion: parsed.conclusion,
            keyFactors: Array.isArray(parsed.keyFactors) ? parsed.keyFactors : [],
            priceRanges: parsed.priceRanges || {
              budget: "Budget-friendly options typically range from $50-150",
              midRange: "Mid-range options typically range from $150-400",
              premium: "Premium options typically range from $400+"
            }
          }
        }
      }

      // If JSON parsing fails, try to extract content manually
      return this.extractContentFromText(response)
    } catch (error) {
      console.error('Error parsing AI response:', error)
      throw new Error('Failed to parse buying guide response')
    }
  }

  private extractContentFromText(text: string): BuyingGuide {
    // Fallback: extract content from unstructured text
    const lines = text.split('\n').filter(line => line.trim())

    return {
      introduction: lines[0] || "A comprehensive guide to choosing the best products in this category.",
      sections: [
        {
          title: "Key Features to Look For",
          content: "Focus on build quality, materials, and construction methods that ensure longevity.",
          order: 1
        },
        {
          title: "Material Quality and Durability",
          content: "Look for high-quality materials and robust construction that can withstand regular use.",
          order: 2
        },
        {
          title: "Repairability and Maintenance",
          content: "Choose products that can be easily maintained and repaired when needed.",
          order: 3
        }
      ],
      conclusion: "Investing in quality products that last a lifetime is both economical and environmentally responsible.",
      keyFactors: ["Durability", "Repairability", "Warranty", "Material Quality", "Brand Reputation"],
      priceRanges: {
        budget: "Budget options typically offer good value with basic durability features",
        midRange: "Mid-range products balance cost with enhanced durability and features",
        premium: "Premium products offer the highest quality materials and longest lifespans"
      }
    }
  }

  private getFallbackBuyingGuide(categoryName: string): BuyingGuide {
    return {
      introduction: `When choosing ${categoryName}, focus on products built to last a lifetime. Quality construction, repairability, and strong warranties are key indicators of BIFL-worthy items.`,
      sections: [
        {
          title: "Build Quality and Materials",
          content: `Look for ${categoryName} made with premium materials and solid construction. Avoid products with plastic components in high-stress areas.`,
          order: 1
        },
        {
          title: "Repairability",
          content: `Choose ${categoryName} that can be easily serviced and repaired. Products with readily available parts and service documentation are preferred.`,
          order: 2
        },
        {
          title: "Warranty and Support",
          content: `Strong warranty coverage indicates manufacturer confidence. Look for comprehensive warranties and responsive customer support.`,
          order: 3
        },
        {
          title: "Long-term Value",
          content: `Consider the total cost of ownership including maintenance, repairs, and replacement frequency when evaluating ${categoryName}.`,
          order: 4
        }
      ],
      conclusion: `Investing in quality ${categoryName} may cost more upfront but saves money over time through reduced replacements and repairs.`,
      keyFactors: ["Material Quality", "Construction Method", "Repairability", "Warranty Coverage", "Brand Reputation"],
      priceRanges: {
        budget: "Budget options focus on basic functionality with acceptable durability",
        midRange: "Mid-range products offer enhanced materials and better construction",
        premium: "Premium products use the finest materials and offer exceptional longevity"
      }
    }
  }
}