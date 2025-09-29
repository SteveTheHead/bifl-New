import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface CareData {
  frequency?: {
    frequency: string
    description: string
  }
  steps?: Array<{
    step: number
    title: string
    icon: 'clean' | 'condition' | 'protect'
    description: string
    products?: Array<{ name: string; price?: string }>
  }>
}

interface FAQ {
  question: string
  answer: string
  display_order: number
}

function parseMarkdownFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8')
  // Handle different line endings and remove BOM if present
  const cleanContent = content.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').trim()
  const lines = cleanContent.split('\n')

  // Extract product name from title (first line)
  const titleMatch = lines[0].match(/^#\s*(.+?)(?:\s*\(.+?\))?\s*:\s*A Comprehensive Report/i)
  const productName = titleMatch ? titleMatch[1].trim() : null

  // Find Care and Maintenance section
  let careStartIdx = -1
  let careEndIdx = -1
  let faqStartIdx = -1

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/^##\s*\d+\.\s*Care and Maintenance/i)) {
      careStartIdx = i
    }
    if (lines[i].match(/^##\s*\d+\.\s*Frequently Asked Questions/i)) {
      faqStartIdx = i
      if (careStartIdx >= 0 && careEndIdx === -1) {
        careEndIdx = i
      }
    }
  }

  const careData = careStartIdx >= 0 ? parseCareSection(lines.slice(careStartIdx, careEndIdx >= 0 ? careEndIdx : faqStartIdx >= 0 ? faqStartIdx : lines.length)) : null
  const faqs = faqStartIdx >= 0 ? parseFAQSection(lines.slice(faqStartIdx)) : []

  return { productName, careData, faqs }
}

function parseCareSection(lines: string[]): CareData | null {
  const careData: CareData = {}

  // Look for frequency information
  const freqMatch = lines.join('\n').match(/It is recommended to treat.*?(\d+-?\d*\s*times?\s*(?:per\s+)?(?:a\s+)?year)/i)
  if (freqMatch) {
    const freqLine = lines.find(l => l.includes(freqMatch[0]))
    careData.frequency = {
      frequency: freqMatch[1],
      description: freqLine?.replace(/^###\s*\d+\.\d+\.?\s*/, '').trim() || ''
    }
  }

  const steps: CareData['steps'] = []
  let currentStep: any = null
  let plainTextSteps: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Match numbered steps with bold title (e.g., "1. **Clean:** description")
    const numberedBoldMatch = line.match(/^\d+\.\s+\*\*(.+?):\*\*\s*(.+)?/)
    if (numberedBoldMatch) {
      if (currentStep) steps.push(currentStep)

      const title = numberedBoldMatch[1].trim()
      let icon: 'clean' | 'condition' | 'protect' = 'clean'
      if (title.toLowerCase().includes('condition')) icon = 'condition'
      else if (title.toLowerCase().includes('protect')) icon = 'protect'

      currentStep = {
        step: steps.length + 1,
        title,
        icon,
        description: numberedBoldMatch[2] || '',
        products: []
      }
    }
    // Match bullet points as steps (e.g., "- **Avoid direct heat:** description" or just "- Avoid direct heat")
    else if (line.match(/^[-*]\s+/)) {
      const bulletBoldMatch = line.match(/^[-*]\s+\*\*(.+?):\*\*\s*(.+)?/)
      if (bulletBoldMatch) {
        if (currentStep) steps.push(currentStep)

        const title = bulletBoldMatch[1].trim()
        let icon: 'clean' | 'condition' | 'protect' = 'clean'
        if (title.toLowerCase().includes('condition')) icon = 'condition'
        else if (title.toLowerCase().includes('protect')) icon = 'protect'

        currentStep = {
          step: steps.length + 1,
          title,
          icon,
          description: bulletBoldMatch[2]?.trim() || '',
          products: []
        }
      } else {
        // Plain bullet point - collect for general care
        const bulletText = line.replace(/^[-*]\s+/, '').trim()
        if (bulletText && !line.includes('|')) {
          plainTextSteps.push(bulletText)
        }
      }
    }
    // Match subsection headings as steps (e.g., "### Cleaning" or "### 2.1 Frequency")
    else if (line.match(/^###\s+(?:\d+\.\d+\.?\s+)?(.+)/)) {
      const headingMatch = line.match(/^###\s+(?:\d+\.\d+\.?\s+)?(.+)/)
      if (headingMatch && !headingMatch[1].toLowerCase().includes('frequently asked')) {
        const title = headingMatch[1].trim()
        // Skip if it's a question (FAQ section)
        if (!title.match(/^Q\d+:/)) {
          if (currentStep) steps.push(currentStep)

          let icon: 'clean' | 'condition' | 'protect' = 'clean'
          if (title.toLowerCase().includes('condition')) icon = 'condition'
          else if (title.toLowerCase().includes('protect')) icon = 'protect'

          currentStep = {
            step: steps.length + 1,
            title,
            icon,
            description: '',
            products: []
          }
        }
      }
    }
    else if (currentStep && line.trim() && !line.match(/^#+/) && !line.startsWith('##')) {
      // Add to description if it's part of the current step
      if (!line.includes('|') && !line.match(/^[-*]\s+/)) {
        currentStep.description += (currentStep.description ? ' ' : '') + line.trim()
      }
    }

    // Look for product table
    if (line.includes('| Product |') || line.includes('| Style Number |')) {
      let j = i + 2 // Skip header and separator
      while (j < lines.length && lines[j].startsWith('|')) {
        const cols = lines[j].split('|').map(c => c.trim()).filter(c => c)
        if (cols.length >= 3 && currentStep) {
          currentStep.products.push({
            name: cols[0],
            price: cols[2]
          })
        }
        j++
      }
      i = j
    }
  }

  if (currentStep) steps.push(currentStep)

  // If no structured steps found but we have plain text, create a general care step
  if (steps.length === 0 && plainTextSteps.length > 0) {
    steps.push({
      step: 1,
      title: 'General Care',
      icon: 'clean',
      description: plainTextSteps.join(' '),
      products: []
    })
  }

  if (steps.length > 0) careData.steps = steps

  return Object.keys(careData).length > 0 ? careData : null
}

function parseFAQSection(lines: string[]): FAQ[] {
  const faqs: FAQ[] = []
  let currentFAQ: Partial<FAQ> | null = null
  let displayOrder = 1

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Match question heading - multiple formats:
    // "### Q1: Question text?"
    // "### Question text?"
    // "**Question text?**"
    const headingMatch = line.match(/^###\s*(?:Q\d+:\s*)?(.+)/)
    const boldMatch = line.match(/^\*\*(.+?)\?\*\*/)

    if (headingMatch || boldMatch) {
      if (currentFAQ && currentFAQ.question && currentFAQ.answer) {
        faqs.push(currentFAQ as FAQ)
      }
      let question = (headingMatch?.[1] || boldMatch?.[1] || '').trim()
      // Ensure question ends with ?
      if (!question.endsWith('?')) question += '?'

      currentFAQ = {
        question,
        answer: '',
        display_order: displayOrder++
      }
    }
    // Match answer in format "**A:** answer text"
    else if (line.match(/^\*\*A(?:nswer)?:\*\*/)) {
      if (currentFAQ) {
        currentFAQ.answer = line.replace(/^\*\*A(?:nswer)?:\*\*\s*/, '').trim()
      }
    }
    // If we have a question but no answer yet, next paragraph becomes the answer
    else if (currentFAQ && currentFAQ.answer === '' && line.trim() && !line.startsWith('#') && !line.startsWith('**')) {
      currentFAQ.answer = line.trim()
    }
    // Continue building answer
    else if (currentFAQ && currentFAQ.answer && line.trim() && !line.startsWith('#') && !line.match(/^##\s*\d+\./)) {
      currentFAQ.answer += ' ' + line.trim()
    }

    // Stop at next major section
    if (line.match(/^##\s*\d+\./) && !line.toLowerCase().includes('frequently asked')) {
      break
    }
  }

  if (currentFAQ && currentFAQ.question && currentFAQ.answer) {
    faqs.push(currentFAQ as FAQ)
  }

  return faqs
}

async function matchProductByName(productName: string) {
  // Try exact match first
  let { data } = await supabase
    .from('products')
    .select('id, name, slug')
    .ilike('name', productName)
    .limit(1)

  if (data && data.length > 0) return data[0]

  // Extract key words from product name (remove brand, common filler words)
  const keywords = productName
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .split(' ')
    .filter(w => !['the', 'a', 'an', 'and', 'or', 'for', 'with', 'model', 'no', 'style', 'mens', 'men', 'womens', 'women', 'unisex'].includes(w))
    .filter(w => w.length > 2)  // Remove very short words

  // Try matching by slug (which includes brand)
  const slugPattern = keywords.slice(0, 5).join('%')
  const { data: slugData } = await supabase
    .from('products')
    .select('id, name, slug')
    .ilike('slug', `%${slugPattern}%`)
    .limit(5)

  if (slugData && slugData.length > 0) {
    console.log(`    Slug match found: ${slugData[0].name} (${slugData[0].slug})`)
    return slugData[0]
  }

  // Try matching by name with key words
  const namePattern = keywords.slice(0, 4).join('%')
  const { data: fuzzyData } = await supabase
    .from('products')
    .select('id, name, slug')
    .ilike('name', `%${namePattern}%`)
    .limit(5)

  if (fuzzyData && fuzzyData.length > 0) {
    console.log(`    Name match found: ${fuzzyData[0].name}`)
    return fuzzyData[0]
  }

  return null
}

async function importProductReports(directory: string) {
  const files = fs.readdirSync(directory).filter(f => f.endsWith('.md'))

  console.log(`Found ${files.length} markdown files to process\n`)

  let processed = 0
  let careUpdated = 0
  let faqsUpdated = 0
  let notFound = 0

  for (const file of files) {
    const filePath = path.join(directory, file)
    console.log(`Processing: ${file}`)

    try {
      const { productName, careData, faqs } = parseMarkdownFile(filePath)

      if (!productName) {
        console.log('  ⚠️  Could not extract product name')
        continue
      }

      console.log(`  Product: ${productName}`)

      const product = await matchProductByName(productName)

      if (!product) {
        console.log('  ❌ Product not found in database')
        notFound++
        continue
      }

      console.log(`  ✓ Matched to: ${product.name} (${product.id})`)

      // Update care data
      if (careData) {
        const { error } = await supabase
          .from('products')
          .update({ care_and_maintenance: careData })
          .eq('id', product.id)

        if (error) {
          console.log(`  ❌ Error updating care data: ${error.message}`)
        } else {
          console.log(`  ✓ Updated care & maintenance`)
          careUpdated++
        }
      }

      // Update FAQs
      if (faqs.length > 0) {
        // Delete existing FAQs
        await supabase.from('product_faqs').delete().eq('product_id', product.id)

        // Insert new FAQs
        const faqsToInsert = faqs.map(faq => ({
          product_id: product.id,
          question: faq.question,
          answer: faq.answer,
          display_order: faq.display_order,
          is_active: true
        }))

        const { error } = await supabase.from('product_faqs').insert(faqsToInsert)

        if (error) {
          console.log(`  ❌ Error updating FAQs: ${error.message}`)
        } else {
          console.log(`  ✓ Updated ${faqs.length} FAQs`)
          faqsUpdated++
        }
      }

      processed++
    } catch (error) {
      console.log(`  ❌ Error: ${error}`)
    }

    console.log('')
  }

  console.log('\n=== Import Summary ===')
  console.log(`Total files: ${files.length}`)
  console.log(`Processed: ${processed}`)
  console.log(`Care data updated: ${careUpdated}`)
  console.log(`FAQs updated: ${faqsUpdated}`)
  console.log(`Not found in DB: ${notFound}`)
}

// Run the import
const reportsDir = '/Users/stephen/Downloads/home/ubuntu/product_reports'
importProductReports(reportsDir).catch(console.error)