import Papa from 'papaparse'
import fs from 'fs'

interface CSVRow {
  product_name: string
  country_of_origin: string
  [key: string]: string
}

async function checkCSVCountries() {
  console.log('🌍 Checking country data in CSV...')

  const csvFilePath = '/Users/stephen/Downloads/BIFL Score Card - BIFL_Score_Card_ (9).csv'
  const csvContent = fs.readFileSync(csvFilePath, 'utf-8')

  const { data: records } = Papa.parse<CSVRow>(csvContent, {
    header: true,
    skipEmptyLines: true
  })

  // Get unique countries and count occurrences
  const countryCounts = records.reduce((acc: Record<string, number>, row) => {
    const country = row.country_of_origin?.trim()
    if (country && country !== '') {
      acc[country] = (acc[country] || 0) + 1
    }
    return acc
  }, {})

  console.log('\n📊 Countries in CSV (first 20 sorted by count):')
  Object.entries(countryCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20)
    .forEach(([country, count]) => {
      console.log(`"${country}": ${count} products`)
    })

  console.log(`\n📈 Total products with country data: ${Object.values(countryCounts).reduce((a, b) => a + b, 0)}`)
  console.log(`📈 Total unique countries: ${Object.keys(countryCounts).length}`)
}

checkCSVCountries().catch(console.error)