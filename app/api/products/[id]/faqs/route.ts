import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Try to get product details first to check if the product exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Fetch FAQs for this product
    const { data: faqs, error } = await supabase
      .from('product_faqs')
      .select('*')
      .eq('product_id', id)
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      // If table doesn't exist or there's a relation error, return clean generated FAQs
      console.log('FAQ table may not exist yet:', error.message)
      const defaultFAQs = generateDefaultFAQs(product)
      return NextResponse.json({ faqs: defaultFAQs })
    }

    // If no FAQs exist for this product, return clean generated FAQs
    if (!faqs || faqs.length === 0) {
      const defaultFAQs = generateDefaultFAQs(product)
      return NextResponse.json({ faqs: defaultFAQs })
    }

    return NextResponse.json({ faqs })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateDefaultFAQs(product: any) {
  return [
    {
      id: '1',
      question: 'How long does this product typically last?',
      answer: product.lifespan_expectation
        ? `Based on user reviews and testing, this product typically lasts ${product.lifespan_expectation} years with proper care and maintenance.`
        : 'This product is built to last many years with proper care and maintenance.',
      display_order: 1
    },
    {
      id: '2',
      question: 'Is this product repairable?',
      answer: (() => {
        const score = product.repairability_score || 0
        if (score >= 8) return 'Yes, this product is highly repairable with readily available parts and service documentation.'
        if (score >= 6) return 'Yes, this product can be repaired, though some specialized knowledge may be required.'
        if (score >= 4) return 'Partial repairability - some components can be fixed but others may require professional service.'
        return 'Limited repairability - most issues require professional service or replacement.'
      })(),
      display_order: 2
    },
    {
      id: '3',
      question: 'What warranty does this product come with?',
      answer: product.warranty_years
        ? `This product comes with a ${product.warranty_years}-year warranty covering manufacturing defects.`
        : 'Please check with the manufacturer for specific warranty information.',
      display_order: 3
    },
    {
      id: '4',
      question: 'Where is this product made?',
      answer: product.country_of_origin
        ? `This product is manufactured in ${product.country_of_origin}.`
        : 'Please check with the manufacturer for country of origin information.',
      display_order: 4
    },
    {
      id: '5',
      question: 'How does this product compare to similar items?',
      answer: `This product scores ${product.bifl_total_score ? product.bifl_total_score.toFixed(1) : 'well'} in our BIFL rating system, taking into account durability, repairability, warranty, and social factors. Check our comparison section for detailed analysis against similar products.`,
      display_order: 5
    }
  ]
}

async function scrapeAmazonFAQs(amazonUrl: string) {
  try {
    console.log('Attempting to scrape Amazon FAQs from:', amazonUrl)

    // Add user agent and headers to avoid blocking
    const response = await fetch(amazonUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'no-cache',
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    const faqs = []
    let count = 0

    // Multiple selectors to try for Amazon Q&A sections
    const selectors = [
      // Main Q&A section
      '#ask-btf_feature_div [data-asin] .a-fixed-left-grid',
      // Customer questions section
      '#ask-dp-search_feature_div .askTeaserQuestions .a-spacing-base',
      // Alternative Q&A format
      '.askInlineWidget .a-spacing-base',
      // Product-specific questions
      '[data-hook="ask-widget"] .a-spacing-medium',
      // Any element containing question marks
      '*:contains("?")',
    ]

    for (const selector of selectors) {
      if (count >= 5) break

      try {
        $(selector).each((index, element) => {
          if (count >= 5) return false

          const $el = $(element)

          // Look for question text
          let question = ''
          let answer = ''

          // Try different ways to extract question
          const questionSelectors = [
            '.askQuestionText',
            '.a-link-normal',
            '[data-hook="question-text"]',
            '.cr-original-review-text',
          ]

          for (const qSelector of questionSelectors) {
            const qElement = $el.find(qSelector).first()
            if (qElement.length > 0) {
              const qText = qElement.text().trim()
              if (qText && qText.includes('?') && qText.length > 10 && qText.length < 200) {
                question = qText
                break
              }
            }
          }

          // Try different ways to extract answer
          const answerSelectors = [
            '.askAnswerText',
            '.a-spacing-top-mini',
            '[data-hook="answer-text"]',
            '.a-spacing-small',
          ]

          for (const aSelector of answerSelectors) {
            const aElement = $el.find(aSelector).first()
            if (aElement.length > 0) {
              const aText = aElement.text().trim()
              if (aText && aText.length > 20 && aText.length < 500 && !aText.includes('?') && !aText.includes('{') && !aText.includes('function')) {
                answer = aText
                break
              }
            }
          }

          // If we found both question and answer, validate they look like real content
          if (question && answer && question !== answer) {
            const cleanQuestion = cleanText(question)
            const cleanAnswer = cleanText(answer)

            // Additional validation to prevent code/junk
            const isValidQuestion = cleanQuestion.length > 10 &&
                                  cleanQuestion.length < 200 &&
                                  cleanQuestion.includes('?') &&
                                  !cleanQuestion.includes('{') &&
                                  !cleanQuestion.includes('function') &&
                                  !cleanQuestion.includes('var ') &&
                                  !cleanQuestion.includes('const ') &&
                                  !/[{}[\]();,]{3,}/.test(cleanQuestion)

            const isValidAnswer = cleanAnswer.length > 20 &&
                                 cleanAnswer.length < 500 &&
                                 !cleanAnswer.includes('{') &&
                                 !cleanAnswer.includes('function') &&
                                 !cleanAnswer.includes('var ') &&
                                 !cleanAnswer.includes('const ') &&
                                 !/[{}[\]();,]{3,}/.test(cleanAnswer)

            if (isValidQuestion && isValidAnswer) {
              faqs.push({
                id: `amazon-${count + 1}`,
                question: cleanQuestion,
                answer: cleanAnswer,
                display_order: count + 1
              })
              count++
            }
          }
        })
      } catch (selectorError) {
        console.log(`Selector ${selector} failed:`, selectorError.message)
        continue
      }
    }

    // Fallback: Look for any text containing common question patterns
    if (faqs.length === 0) {
      const questionPatterns = [
        /how\s+.{10,}\?/gi,
        /what\s+.{10,}\?/gi,
        /when\s+.{10,}\?/gi,
        /where\s+.{10,}\?/gi,
        /why\s+.{10,}\?/gi,
        /is\s+.{10,}\?/gi,
        /does\s+.{10,}\?/gi,
        /can\s+.{10,}\?/gi,
        /will\s+.{10,}\?/gi,
      ]

      const pageText = $.text()

      for (const pattern of questionPatterns) {
        if (count >= 5) break

        const matches = pageText.match(pattern)
        if (matches) {
          matches.slice(0, 5 - count).forEach((match, index) => {
            const question = match.trim()
            // Create a generic answer based on question type
            let answer = ''

            if (question.toLowerCase().includes('how long')) {
              answer = 'Based on customer reviews, this product typically lasts several years with proper care.'
            } else if (question.toLowerCase().includes('warranty')) {
              answer = 'Please check the product details or contact the manufacturer for warranty information.'
            } else if (question.toLowerCase().includes('size') || question.toLowerCase().includes('dimension')) {
              answer = 'Product dimensions can be found in the product specifications section above.'
            } else if (question.toLowerCase().includes('material')) {
              answer = 'Material information is available in the product description and specifications.'
            } else {
              answer = 'For detailed information about this question, please refer to the product description or customer reviews.'
            }

            faqs.push({
              id: `amazon-pattern-${count + 1}`,
              question: cleanText(question),
              answer: answer,
              display_order: count + 1
            })
            count++
          })
        }
      }
    }

    console.log(`Successfully scraped ${faqs.length} FAQs from Amazon`)
    return faqs

  } catch (error) {
    console.error('Amazon scraping error:', error)
    return []
  }
}

function cleanText(text: string): string {
  return text
    // First decode HTML entities
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
    .replace(/&([a-zA-Z]+);/g, ' ')
    // Remove any HTML tags
    .replace(/<[^>]*>/g, '')
    // Clean up whitespace
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, ' ')
    .replace(/\t+/g, ' ')
    // Remove any remaining code-like patterns
    .replace(/\{[^}]*\}/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\([^)]*function[^)]*\)/gi, '')
    // Clean up punctuation
    .replace(/\.{2,}/g, '.')
    .replace(/\?{2,}/g, '?')
    .replace(/!{2,}/g, '!')
    // Trim and clean
    .trim()
    // Ensure proper sentence structure
    .replace(/([.!?])\s*([a-z])/g, (match, punct, letter) => punct + ' ' + letter.toUpperCase())
}