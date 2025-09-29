import { aiService } from './service'
import { SYSTEM_PROMPTS } from './prompts'

export interface PricePoint {
  price: number
  date: string
  source?: string
}

export interface PriceAnalysis {
  currentPrice: number
  avgPrice: number
  lowestPrice: number
  highestPrice: number
  trend: 'rising' | 'falling' | 'stable'
  recommendation: 'buy_now' | 'wait' | 'watch'
  reasoning: string
  bestTimeToBy?: string
  seasonalPattern?: string
  savings?: number
}

export class PriceAnalyzer {
  static async analyzePriceHistory(
    productName: string,
    priceHistory: PricePoint[],
    currentPrice: number
  ): Promise<PriceAnalysis> {
    if (priceHistory.length === 0) {
      return {
        currentPrice,
        avgPrice: currentPrice,
        lowestPrice: currentPrice,
        highestPrice: currentPrice,
        trend: 'stable',
        recommendation: 'watch',
        reasoning: 'Insufficient price history for analysis'
      }
    }

    // Calculate basic stats
    const prices = priceHistory.map(p => p.price)
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length
    const lowestPrice = Math.min(...prices)
    const highestPrice = Math.max(...prices)

    // Determine trend
    const recentPrices = prices.slice(-5)
    const trend = this.calculateTrend(recentPrices)

    // Use AI for intelligent analysis if available
    if (aiService.isAvailable()) {
      try {
        const aiAnalysis = await this.getAIAnalysis(
          productName,
          priceHistory,
          currentPrice,
          { avgPrice, lowestPrice, highestPrice, trend }
        )

        return {
          currentPrice,
          avgPrice,
          lowestPrice,
          highestPrice,
          trend,
          ...aiAnalysis
        }
      } catch (error) {
        console.error('AI price analysis failed:', error)
      }
    }

    // Fallback analysis
    return this.getBasicAnalysis(currentPrice, avgPrice, lowestPrice, highestPrice, trend)
  }

  private static calculateTrend(recentPrices: number[]): 'rising' | 'falling' | 'stable' {
    if (recentPrices.length < 2) return 'stable'

    const first = recentPrices[0]
    const last = recentPrices[recentPrices.length - 1]
    const change = (last - first) / first

    if (change > 0.05) return 'rising'
    if (change < -0.05) return 'falling'
    return 'stable'
  }

  private static async getAIAnalysis(
    productName: string,
    priceHistory: PricePoint[],
    currentPrice: number,
    stats: { avgPrice: number; lowestPrice: number; highestPrice: number; trend: string }
  ) {
    const prompt = `Analyze the price history for this BIFL product and provide buying recommendations:

Product: ${productName}
Current Price: $${currentPrice}
Average Price: $${stats.avgPrice.toFixed(2)}
Lowest Price: $${stats.lowestPrice}
Highest Price: $${stats.highestPrice}
Recent Trend: ${stats.trend}

Price History (last 30 data points):
${priceHistory.slice(-30).map(p => `${p.date}: $${p.price}`).join('\n')}

Provide:
1. Buying recommendation (buy_now, wait, or watch)
2. Reasoning for the recommendation
3. Best time to buy (if not now)
4. Seasonal patterns (if any)
5. Potential savings by waiting

Format as JSON with keys: recommendation, reasoning, bestTimeToBuy, seasonalPattern, savings`

    const response = await aiService.generateSimpleText(prompt, SYSTEM_PROMPTS.PRICE_ANALYSIS)

    try {
      // Try to parse as JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (error) {
      console.error('Failed to parse AI response as JSON:', error)
    }

    // Fallback parsing
    return this.parseAIResponse(response)
  }

  private static parseAIResponse(response: string) {
    const recommendation = response.toLowerCase().includes('buy now') || response.toLowerCase().includes('buy_now')
      ? 'buy_now'
      : response.toLowerCase().includes('wait')
      ? 'wait'
      : 'watch'

    return {
      recommendation,
      reasoning: response.split('\n').find(line =>
        line.toLowerCase().includes('reason') ||
        line.toLowerCase().includes('because')
      ) || 'AI analysis completed',
      bestTimeToBuy: response.includes('month') ? 'Check back in 1-2 months' : undefined,
      seasonalPattern: response.toLowerCase().includes('season') ? 'Seasonal variations detected' : undefined,
      savings: response.includes('$') ? 10 : undefined
    }
  }

  private static getBasicAnalysis(
    currentPrice: number,
    avgPrice: number,
    lowestPrice: number,
    highestPrice: number,
    trend: string
  ): PriceAnalysis {
    const priceVsAvg = (currentPrice - avgPrice) / avgPrice
    // const _priceVsLow = (currentPrice - lowestPrice) / lowestPrice // Unused variable

    let recommendation: 'buy_now' | 'wait' | 'watch'
    let reasoning: string

    if (currentPrice <= lowestPrice * 1.05) {
      recommendation = 'buy_now'
      reasoning = 'Current price is at or near historical low'
    } else if (priceVsAvg < -0.1) {
      recommendation = 'buy_now'
      reasoning = 'Current price is significantly below average'
    } else if (priceVsAvg > 0.15) {
      recommendation = 'wait'
      reasoning = 'Current price is above average - consider waiting for a drop'
    } else {
      recommendation = 'watch'
      reasoning = 'Price is near average - monitor for better opportunities'
    }

    return {
      currentPrice,
      avgPrice,
      lowestPrice,
      highestPrice,
      trend: trend as 'rising' | 'falling' | 'stable',
      recommendation,
      reasoning,
      savings: recommendation === 'wait' ? Math.round(currentPrice - lowestPrice) : undefined
    }
  }

  static async predictPriceDrop(
    productName: string,
    priceHistory: PricePoint[],
    currentPrice: number
  ): Promise<{
    likelihood: number // 0-100
    timeframe: string
    confidence: number // 0-100
    reasoning: string
  }> {
    if (!aiService.isAvailable()) {
      return {
        likelihood: 50,
        timeframe: '2-3 months',
        confidence: 30,
        reasoning: 'Basic analysis suggests moderate likelihood of price change'
      }
    }

    const prompt = `Predict the likelihood of a price drop for this BIFL product:

Product: ${productName}
Current Price: $${currentPrice}

Recent Price History:
${priceHistory.slice(-20).map(p => `${p.date}: $${p.price}`).join('\n')}

Predict:
1. Likelihood of price drop in next 3 months (0-100%)
2. Expected timeframe
3. Confidence level (0-100%)
4. Reasoning

Consider seasonal patterns, product lifecycle, market trends, and historical data.`

    try {
      const response = await aiService.generateSimpleText(prompt, SYSTEM_PROMPTS.PRICE_ANALYSIS)

      // Extract numbers and text from response
      const likelihoodMatch = response.match(/(\d+)%?\s*(?:likelihood|chance)/i)
      const confidenceMatch = response.match(/confidence.*?(\d+)%?/i)

      return {
        likelihood: likelihoodMatch ? parseInt(likelihoodMatch[1]) : 50,
        timeframe: response.includes('month') ? '1-2 months' : '2-3 months',
        confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 60,
        reasoning: response.split('\n').slice(0, 2).join(' ').substring(0, 200)
      }
    } catch (error) {
      console.error('Price prediction failed:', error)
      return {
        likelihood: 50,
        timeframe: '2-3 months',
        confidence: 30,
        reasoning: 'AI analysis unavailable - using basic prediction'
      }
    }
  }
}