'use client'

import { useState, useEffect } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Eye,
  RefreshCw
} from 'lucide-react'

interface PriceAnalysis {
  currentPrice: number
  avgPrice: number
  lowestPrice: number
  highestPrice: number
  trend: 'rising' | 'falling' | 'stable'
  recommendation: 'buy_now' | 'wait' | 'watch'
  reasoning: string
  bestTimeToBuy?: string
  seasonalPattern?: string
  savings?: number
}

interface PricePrediction {
  likelihood: number
  timeframe: string
  confidence: number
  reasoning: string
}

interface PriceInsightProps {
  productId: string
  productName: string
  currentPrice: number
  className?: string
}

export function PriceInsight({ productId, productName, currentPrice, className = '' }: PriceInsightProps) {
  const [analysis, setAnalysis] = useState<PriceAnalysis | null>(null)
  const [prediction, setPrediction] = useState<PricePrediction | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPriceAnalysis()
  }, [productId])

  const loadPriceAnalysis = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/price-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          analysisType: 'full'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load price analysis')
      }

      setAnalysis(data.analysis)
      setPrediction(data.prediction)
    } catch (error) {
      console.error('Price analysis error:', error)
      setError('Unable to load price insights')
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising':
        return <TrendingUp className="w-4 h-4 text-red-500" />
      case 'falling':
        return <TrendingDown className="w-4 h-4 text-green-500" />
      default:
        return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'buy_now':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'wait':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'buy_now':
        return <CheckCircle className="w-4 h-4" />
      case 'wait':
        return <Clock className="w-4 h-4" />
      default:
        return <Eye className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-brand-teal mr-2" />
          <span className="text-brand-gray">Analyzing price data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center text-red-600">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
        <button
          onClick={loadPriceAnalysis}
          className="mt-3 text-sm text-brand-teal hover:text-brand-teal/80"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!analysis) {
    return null
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-brand-dark flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-brand-teal" />
          Price Insights
        </h3>
        <button
          onClick={loadPriceAnalysis}
          className="p-1 text-brand-gray hover:text-brand-dark transition-colors"
          title="Refresh analysis"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Price Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <p className="text-sm text-brand-gray">Current</p>
          <p className="text-lg font-bold text-brand-dark">${analysis.currentPrice}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-brand-gray">Average</p>
          <p className="text-lg font-bold text-brand-dark">${analysis.avgPrice.toFixed(0)}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-brand-gray">Lowest</p>
          <p className="text-lg font-bold text-green-600">${analysis.lowestPrice}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-brand-gray">Highest</p>
          <p className="text-lg font-bold text-red-500">${analysis.highestPrice}</p>
        </div>
      </div>

      {/* Trend and Recommendation */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            {getTrendIcon(analysis.trend)}
            <span className="ml-2 text-sm font-medium text-brand-dark">
              Price Trend: {analysis.trend.charAt(0).toUpperCase() + analysis.trend.slice(1)}
            </span>
          </div>
        </div>

        <div className={`p-4 border rounded-lg ${getRecommendationColor(analysis.recommendation)}`}>
          <div className="flex items-center mb-2">
            {getRecommendationIcon(analysis.recommendation)}
            <span className="ml-2 font-semibold">
              {analysis.recommendation === 'buy_now' ? 'Good Time to Buy' :
               analysis.recommendation === 'wait' ? 'Consider Waiting' : 'Keep Watching'}
            </span>
          </div>
          <p className="text-sm">{analysis.reasoning}</p>

          {analysis.bestTimeToBuy && (
            <p className="text-sm mt-2">
              <strong>Best time:</strong> {analysis.bestTimeToBuy}
            </p>
          )}

          {analysis.savings && (
            <p className="text-sm mt-2">
              <strong>Potential savings:</strong> ${analysis.savings}
            </p>
          )}
        </div>

        {/* Price Drop Prediction */}
        {prediction && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Price Drop Prediction</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-600">Likelihood:</span>
                <span className="ml-2 font-semibold">{prediction.likelihood}%</span>
              </div>
              <div>
                <span className="text-blue-600">Timeframe:</span>
                <span className="ml-2 font-semibold">{prediction.timeframe}</span>
              </div>
            </div>
            <p className="text-sm text-blue-700 mt-2">{prediction.reasoning}</p>
            <p className="text-xs text-blue-600 mt-2">
              Confidence: {prediction.confidence}%
            </p>
          </div>
        )}

        {/* Seasonal Pattern */}
        {analysis.seasonalPattern && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Seasonal Pattern:</strong> {analysis.seasonalPattern}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}