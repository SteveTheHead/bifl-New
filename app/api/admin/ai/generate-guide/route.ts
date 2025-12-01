import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai/service'
import { createAdminClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

async function checkAdminAuth() {
  const cookieStore = await cookies()
  const adminSessionCookie = cookieStore.get('admin-session')

  if (!adminSessionCookie) return false

  try {
    const adminSession = JSON.parse(adminSessionCookie.value)
    const sessionAge = Date.now() - (adminSession.loginTime || 0)
    const maxAge = 24 * 60 * 60 * 1000
    return sessionAge <= maxAge
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  const isAuthenticated = await checkAdminAuth()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    if (!aiService.isAvailable()) {
      return NextResponse.json({
        error: 'AI service not available. Please configure OPENAI_API_KEY or ANTHROPIC_API_KEY.'
      }, { status: 503 })
    }

    const { curationId, guideTitle } = await request.json()

    if (!curationId) {
      return NextResponse.json({ error: 'Curation ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Fetch the curation with its products
    const { data: curation, error: curationError } = await supabase
      .from('curations')
      .select(`
        id,
        name,
        description,
        curation_products (
          products (
            id,
            name,
            slug,
            excerpt,
            price,
            bifl_total_score,
            primary_material,
            warranty_years,
            country_of_origin,
            use_case,
            pros,
            cons,
            brands!brand_id (name)
          )
        )
      `)
      .eq('id', curationId)
      .single()

    if (curationError || !curation) {
      return NextResponse.json({ error: 'Curation not found' }, { status: 404 })
    }

    // Extract products from the curation (type assertion for complex nested query)
    const curationData = curation as any
    const products = curationData.curation_products
      ?.map((cp: any) => cp.products)
      .filter(Boolean) || []

    if (products.length === 0) {
      return NextResponse.json({ error: 'No products in this curation' }, { status: 400 })
    }

    // Format products for AI context
    const productContext = products.map((p: any) => `
- ${p.name} by ${p.brands?.name || 'Unknown Brand'}
  Price: $${p.price || 'N/A'}
  BIFL Score: ${p.bifl_total_score || 'N/A'}/10
  Material: ${p.primary_material || 'N/A'}
  Warranty: ${p.warranty_years ? `${p.warranty_years} years` : 'N/A'}
  Use Case: ${p.use_case || 'General'}
  Pros: ${p.pros?.join(', ') || 'N/A'}
  Cons: ${p.cons?.join(', ') || 'N/A'}
`).join('\n')

    const title = guideTitle || curationData.name

    // Generate intro content
    const introPrompt = `You are writing a buying guide for BIFL (Buy It For Life) products. The guide is titled "${title}".

Here are the products featured in this guide:
${productContext}

Write an engaging introduction paragraph (2-3 paragraphs) for this buying guide.

Important guidelines:
- Mention that recommendations come from scouring Reddit, Amazon reviews, YouTube, Quora, and the entire web for real user experiences
- Focus on durability, long-term value, and quality
- Do NOT use em dashes (use commas or periods instead)
- Be specific about what makes these products "buy it for life" worthy
- Keep it informative but conversational`

    const introContent = await aiService.generateSimpleText(introPrompt, undefined, { maxTokens: 800 })

    // Generate buying criteria
    const criteriaPrompt = `Based on these ${title} products:
${productContext}

Generate 5-6 key buying criteria that shoppers should consider when purchasing this type of product. Each criterion should help someone evaluate quality and durability.

Format your response as a JSON array with this structure:
[
  {
    "title": "Short title (2-4 words)",
    "description": "1-2 sentence explanation of why this matters and what to look for",
    "icon": "one of: fabric, stitch, zipper, repair, warranty"
  }
]

Only output valid JSON, no markdown code blocks or extra text. Do NOT use em dashes.`

    const criteriaResponse = await aiService.generateSimpleText(criteriaPrompt, undefined, { maxTokens: 1000 })

    let buyingCriteria = []
    try {
      // Clean up the response in case there are markdown code blocks
      const cleanedResponse = criteriaResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      buyingCriteria = JSON.parse(cleanedResponse)
    } catch (e) {
      console.error('Failed to parse buying criteria:', e)
      buyingCriteria = []
    }

    // Generate FAQs
    const faqPrompt = `Based on these ${title} products:
${productContext}

Generate 4-5 frequently asked questions that shoppers typically have about this product category. Focus on durability, care, value, and common concerns.

Format your response as a JSON array with this structure:
[
  {
    "question": "The question",
    "answer": "A helpful 2-3 sentence answer"
  }
]

Only output valid JSON, no markdown code blocks or extra text. Do NOT use em dashes.`

    const faqResponse = await aiService.generateSimpleText(faqPrompt, undefined, { maxTokens: 1000 })

    let faqs = []
    try {
      const cleanedResponse = faqResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      faqs = JSON.parse(cleanedResponse)
    } catch (e) {
      console.error('Failed to parse FAQs:', e)
      faqs = []
    }

    return NextResponse.json({
      intro_content: introContent,
      buying_criteria: buyingCriteria,
      faqs: faqs,
      provider: aiService.getProvider(),
      generated_at: new Date().toISOString()
    })

  } catch (error) {
    console.error('AI guide generation error:', error)
    return NextResponse.json({
      error: 'Failed to generate guide content'
    }, { status: 500 })
  }
}
