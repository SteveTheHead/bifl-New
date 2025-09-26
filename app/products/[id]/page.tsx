import { getProductById } from '@/lib/supabase/queries'
import { BiflScore } from '@/components/bifl/bifl-score'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Heart, Share2 } from 'lucide-react'
import { notFound } from 'next/navigation'

interface ProductPageProps {
  params: {
    id: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  try {
    const product = await getProductById(params.id)

    if (!product) {
      notFound()
    }

    const totalScore = product.bifl_total_score || 0

    // Get score badge styling based on BIFL score
    function getScoreBadgeStyle(score: number) {
      if (score >= 9.0) {
        return "bg-score-green text-white shadow-score-green-glow"
      } else if (score >= 8.0) {
        return "bg-score-yellow text-white shadow-score-yellow-glow"
      } else if (score >= 7.0) {
        return "bg-score-red text-white shadow-score-red-glow"
      } else {
        return "bg-brand-gray text-white"
      }
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-cream to-white">
        <div className="container mx-auto py-8 px-4">
          {/* Back Navigation */}
          <div className="mb-6">
            <Link
              href="/products"
              className="inline-flex items-center text-brand-teal hover:text-brand-teal/80 font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <Card className="overflow-hidden bg-white border border-brand-teal/20 rounded-2xl shadow-lg">
                <div className="aspect-square relative">
                  {product.featured_image_url ? (
                    <Image
                      src={product.featured_image_url}
                      alt={product.name || 'Product'}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-brand-gray bg-gradient-to-br from-brand-cream to-white">
                      <div className="text-center">
                        <div className="w-24 h-24 mx-auto mb-4 bg-brand-teal/10 rounded-full flex items-center justify-center">
                          <div className="w-12 h-12 bg-brand-teal/20 rounded"></div>
                        </div>
                        <p className="text-lg text-brand-gray">No image available</p>
                      </div>
                    </div>
                  )}

                  {/* BIFL Score badge */}
                  <div className={`absolute top-4 right-4 px-4 py-2 rounded-full text-lg font-bold ${getScoreBadgeStyle(totalScore)}`}>
                    {totalScore.toFixed(1)}
                  </div>
                </div>
              </Card>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Category Badge */}
              <Badge className="bg-brand-teal/10 text-brand-teal border border-brand-teal/20 font-medium px-3 py-1">
                {product.category_name || 'Uncategorized'}
              </Badge>

              {/* Product Info */}
              <div className="space-y-4">
                <h1 className="text-4xl font-bold text-brand-dark leading-tight">
                  {product.name}
                </h1>
                <p className="text-xl text-brand-teal font-semibold uppercase tracking-wide">
                  {product.brand_name}
                </p>
              </div>

              {/* Pricing and Lifespan */}
              <div className="flex items-center gap-6">
                {product.price && (
                  <div className="text-3xl font-bold text-brand-dark">
                    ${product.price}
                  </div>
                )}
                {product.lifespan_expectation && (
                  <div className="bg-white px-4 py-2 rounded-full border border-brand-teal/20">
                    <span className="text-brand-gray font-medium">
                      {product.lifespan_expectation}+ years lifespan
                    </span>
                  </div>
                )}
              </div>

              {/* BIFL Score */}
              <Card className="bg-white border border-brand-teal/20 rounded-2xl shadow-lg">
                <CardHeader>
                  <CardTitle className="text-brand-dark">BIFL Score Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <BiflScore
                    totalScore={totalScore}
                    subscores={product.durability_score ? {
                      durability: product.durability_score,
                      repairability: product.repairability_score || 0,
                      warranty: product.warranty_score || 0,
                      sustainability: product.sustainability_score || 0,
                      social: product.social_score || 0
                    } : undefined}
                  />
                </CardContent>
              </Card>

              {/* Description */}
              {product.description && (
                <Card className="bg-white border border-brand-teal/20 rounded-2xl shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-brand-dark">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-brand-gray leading-relaxed">
                      {product.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                {product.affiliate_url && (
                  <Button className="flex-1 bg-brand-teal text-white hover:bg-brand-teal/90 rounded-xl px-6 py-3 text-lg font-bold shadow-md hover:shadow-teal-glow transition-all">
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Buy Now
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white rounded-xl px-6 py-3"
                >
                  <Heart className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  className="border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white rounded-xl px-6 py-3"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          {(product.materials_description || product.origin_country || product.manufacturing_date) && (
            <div className="mt-12">
              <Card className="bg-white border border-brand-teal/20 rounded-2xl shadow-lg">
                <CardHeader>
                  <CardTitle className="text-brand-dark">Product Details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {product.materials_description && (
                    <div>
                      <h4 className="font-semibold text-brand-dark mb-2">Materials</h4>
                      <p className="text-brand-gray text-sm">{product.materials_description}</p>
                    </div>
                  )}
                  {product.origin_country && (
                    <div>
                      <h4 className="font-semibold text-brand-dark mb-2">Origin</h4>
                      <p className="text-brand-gray text-sm">{product.origin_country}</p>
                    </div>
                  )}
                  {product.manufacturing_date && (
                    <div>
                      <h4 className="font-semibold text-brand-dark mb-2">Manufacturing Date</h4>
                      <p className="text-brand-gray text-sm">
                        {new Date(product.manufacturing_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-cream to-white">
        <div className="container mx-auto py-12">
          <Card className="border-score-red bg-white shadow-lg rounded-2xl max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-score-red/10 rounded-full flex items-center justify-center">
                <div className="w-10 h-10 bg-score-red/20 rounded-full"></div>
              </div>
              <h3 className="text-2xl font-bold text-score-red mb-3">
                Failed to load product
              </h3>
              <p className="text-brand-gray mb-6">
                {error instanceof Error ? error.message : 'Unknown error occurred'}
              </p>
              <Link
                href="/products"
                className="inline-flex items-center text-brand-teal hover:text-brand-teal/80 font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Products
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
}