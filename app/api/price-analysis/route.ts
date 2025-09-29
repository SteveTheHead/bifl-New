import { NextRequest, NextResponse } from 'next/server'
import { PriceAnalyzer, PricePoint, PriceAnalysis } from '@/lib/ai/price-analysis'
import { getProductById } from '@/lib/supabase/queries'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, priceHistory, analysisType = 'full' } = body

    // Validate input
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // Get product details
    const product = await getProductById(productId)
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const currentPrice = parseFloat((product as any).price || '0')
    const productName = `${(product as any).name} - ${(product as any).brands?.name || 'Unknown Brand'}`

    // Generate sample price history if none provided (for demonstration)
    const finalPriceHistory: PricePoint[] = priceHistory || generateSamplePriceHistory(currentPrice)

    const result: {
      analysis?: PriceAnalysis;
      prediction?: {
        likelihood: number;
        timeframe: string;
        confidence: number;
        reasoning: string;
      };
    } = {}

    if (analysisType === 'full' || analysisType === 'analysis') {
      // Full price analysis
      const analysis = await PriceAnalyzer.analyzePriceHistory(
        productName,
        finalPriceHistory,
        currentPrice
      )
      result.analysis = analysis
    }

    if (analysisType === 'full' || analysisType === 'prediction') {
      // Price drop prediction
      const prediction = await PriceAnalyzer.predictPriceDrop(
        productName,
        finalPriceHistory,
        currentPrice
      )
      result.prediction = prediction
    }

    return NextResponse.json({
      product: {
        id: (product as any).id,
        name: productName,
        currentPrice
      },
      priceHistory: finalPriceHistory.length,
      ...result,
      generated_at: new Date().toISOString()
    })

  } catch (error) {
    console.error('Price analysis error:', error)
    return NextResponse.json({
      error: 'Failed to analyze price data'
    }, { status: 500 })
  }
}

// Generate sample price history for demonstration
function generateSamplePriceHistory(currentPrice: number): PricePoint[] {
  const history: PricePoint[] = []
  const now = new Date()

  // Generate 90 days of sample data
  for (let i = 90; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    // Add some realistic price variation
    const variation = 0.1 + (Math.random() * 0.2) // ±10-20% variation
    const seasonalFactor = 1 + 0.1 * Math.sin((i / 90) * Math.PI * 2) // Seasonal pattern
    const trendFactor = 1 - (i / 90) * 0.05 // Slight downward trend over time

    const price = currentPrice * variation * seasonalFactor * trendFactor

    history.push({
      price: Math.round(price * 100) / 100,
      date: date.toISOString().split('T')[0],
      source: 'sample'
    })
  }

  return history
}

// GET endpoint for retrieving analysis for a specific product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // For now, return a simple response indicating the endpoint is available
    const product = await getProductById(productId)
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({
      productId,
      name: (product as any).name,
      currentPrice: parseFloat((product as any).price || '0'),
      analysisAvailable: true,
      message: 'Use POST request with price history for full analysis'
    })

  } catch (error) {
    console.error('Price analysis GET error:', error)
    return NextResponse.json({
      error: 'Failed to retrieve price analysis'
    }, { status: 500 })
  }
}