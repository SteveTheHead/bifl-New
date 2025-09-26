import Papa from 'papaparse'
import fs from 'fs'

interface CSVRow {
  COE: string
  bifl_certification: string
  [key: string]: string
}

async function checkCOEColumns() {
  console.log('🔍 Checking COE and bifl_certification columns...')

  const csvFilePath = '/Users/stephen/Downloads/BIFL Score Card - BIFL_Score_Card_ (9).csv'
  const csvContent = fs.readFileSync(csvFilePath, 'utf-8')

  const { data: records } = Papa.parse<CSVRow>(csvContent, {
    header: true,
    skipEmptyLines: true
  })

  // Get unique COE values
  const coeCounts = records.reduce((acc: Record<string, number>, row) => {
    const coe = row.COE?.trim()
    if (coe && coe !== '') {
      acc[coe] = (acc[coe] || 0) + 1
    }
    return acc
  }, {})

  // Get unique bifl_certification values
  const certCounts = records.reduce((acc: Record<string, number>, row) => {
    const cert = row.bifl_certification?.trim()
    if (cert && cert !== '') {
      acc[cert] = (acc[cert] || 0) + 1
    }
    return acc
  }, {})

  console.log('\n📍 COE (Country of Equipment) values:')
  Object.entries(coeCounts)
    .sort(([,a], [,b]) => b - a)
    .forEach(([coe, count]) => {
      console.log(`"${coe}": ${count} products`)
    })

  console.log('\n🏆 BIFL Certification values:')
  Object.entries(certCounts)
    .sort(([,a], [,b]) => b - a)
    .forEach(([cert, count]) => {
      console.log(`"${cert}": ${count} products`)
    })

  console.log(`\n📈 Total products with COE data: ${Object.values(coeCounts).reduce((a, b) => a + b, 0)}`)
  console.log(`📈 Total products with certification data: ${Object.values(certCounts).reduce((a, b) => a + b, 0)}`)
}

checkCOEColumns().catch(console.error)