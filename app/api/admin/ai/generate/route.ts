import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai/service'
import { SYSTEM_PROMPTS, formatProductForAI, formatProductsForComparison, formatCategoryData } from '@/lib/ai/prompts'
import { getProductById, getCategories, getProducts } from '@/lib/supabase/queries'
import { isAdminRequest } from '@/lib/auth/admin'

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if AI service is available
    if (!aiService.isAvailable()) {
      return NextResponse.json({
        error: 'AI service not available. Please configure API keys.'
      }, { status: 503 })
    }

    const body = await request.json()
    const { type, productId, categoryId, productIds, customPrompt } = body

    let result: string

    switch (type) {
      case 'product-description':
        result = await generateProductDescription(productId)
        break

      case 'buying-guide':
        result = await generateBuyingGuide(categoryId)
        break

      case 'product-comparison':
        result = await generateProductComparison(productIds)
        break

      case 'custom':
        result = await generateCustomContent(customPrompt)
        break

      default:
        return NextResponse.json({ error: 'Invalid generation type' }, { status: 400 })
    }

    return NextResponse.json({
      content: result,
      provider: aiService.getProvider(),
      generated_at: new Date().toISOString()
    })

  } catch (error) {
    console.error('AI generation error:', error)
    return NextResponse.json({
      error: 'Failed to generate content'
    }, { status: 500 })
  }
}

async function generateProductDescription(productId: string): Promise<string> {
  const product = await getProductById(productId)
  if (!product) {
    throw new Error('Product not found')
  }

  const prompt = `Generate an enhanced product description for this BIFL product:

${formatProductForAI(product)}

Create a compelling description that highlights durability, quality, and long-term value. Keep it concise but informative (200-300 words).`

  return await aiService.generateSimpleText(
    prompt,
    SYSTEM_PROMPTS.PRODUCT_DESCRIPTION_GENERATOR
  )
}

async function generateBuyingGuide(categoryId: string): Promise<string> {
  const categories = await getCategories()
  const category = categories.find(c => c.id === categoryId)

  if (!category) {
    throw new Error('Category not found')
  }

  const products = await getProducts(0) // Get all products
  const categoryData = formatCategoryData(category, products)

  const prompt = `Create a comprehensive buying guide for the following category and products:

${categoryData}

Focus on helping customers choose durable, long-lasting products in this category. Include specific features to look for, materials to prefer, and common mistakes to avoid.`

  return await aiService.generateSimpleText(
    prompt,
    SYSTEM_PROMPTS.BUYING_GUIDE_GENERATOR,
    { maxTokens: 3000 }
  )
}

async function generateProductComparison(productIds: string[]): Promise<string> {
  if (!productIds || productIds.length < 2) {
    throw new Error('At least 2 products required for comparison')
  }

  const products = await Promise.all(
    productIds.map(id => getProductById(id))
  )

  const validProducts = products.filter(p => p !== null)
  if (validProducts.length < 2) {
    throw new Error('Not enough valid products for comparison')
  }

  const prompt = `Compare these BIFL products and help users choose between them:

${formatProductsForComparison(validProducts)}

Create a detailed comparison focusing on build quality, durability, value, and use cases. Include pros/cons for each and recommendations for different user needs.`

  return await aiService.generateSimpleText(
    prompt,
    SYSTEM_PROMPTS.COMPARISON_GENERATOR,
    { maxTokens: 3000 }
  )
}

async function generateCustomContent(customPrompt: string): Promise<string> {
  if (!customPrompt || customPrompt.trim().length === 0) {
    throw new Error('Custom prompt is required')
  }

  return await aiService.generateSimpleText(
    customPrompt,
    SYSTEM_PROMPTS.BUYING_GUIDE_GENERATOR
  )
}