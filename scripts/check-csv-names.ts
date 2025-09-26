import Papa from 'papaparse'
import fs from 'fs'

interface CSVRow {
  product_name: string
  'category TEXT': string
  [key: string]: string
}

function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function checkCSVNames() {
  console.log('🔍 Checking CSV product names...')

  const csvFilePath = '/Users/stephen/Downloads/BIFL Score Card - BIFL_Score_Card_ (9).csv'
  const csvContent = fs.readFileSync(csvFilePath, 'utf-8')

  const { data: records } = Papa.parse<CSVRow>(csvContent, {
    header: true,
    skipEmptyLines: true
  })

  console.log(`\n📊 Found ${records.length} records in CSV (showing first 10):`)

  records.slice(0, 10).forEach((row, index) => {
    const productName = row.product_name
    const categoryText = row['category TEXT']
    const slug = createSlug(productName)

    console.log(`${index + 1}. Product: "${productName}"`)
    console.log(`   Category: "${categoryText}"`)
    console.log(`   Generated Slug: "${slug}"`)
    console.log('---')
  })
}

checkCSVNames().catch(console.error)