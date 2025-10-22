import * as fs from 'fs'
import { parse } from 'csv-parse/sync'

async function checkCSVBriggs() {
  const csvPath = '/Users/stephen/Downloads/BIFL Score Card - For Import (1).csv'
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true
  })

  const briefcase = records.find((row: any) =>
    row.product_name?.toLowerCase().includes('work briefcase')
  )

  if (!briefcase) {
    console.log('Not found!')
    return
  }

  console.log('\n=== Briggs & Riley Work Briefcase CSV Data ===\n')
  console.log('Brand:', briefcase.brand)
  console.log('Product:', briefcase.product_name)
  console.log('\nScores:')
  console.log('  durability_score:', briefcase.durability_score || 'MISSING')
  console.log('  repairability_score:', briefcase.repairability_score || 'MISSING')
  console.log('  warranty_score:', briefcase.warranty_score || 'MISSING')
  console.log('  social_score:', briefcase.social_score || 'MISSING')
  console.log('  sustainability_score:', briefcase.sustainability_score || 'MISSING')
  console.log('  bifl_total_score:', briefcase.bifl_total_score || 'MISSING')

  console.log('\nNotes (first 200 chars):')
  console.log('  durability_notes:', briefcase.durability_notes ? briefcase.durability_notes.substring(0, 200) + '...' : 'MISSING')
  console.log('  repairability_notes:', briefcase.repairability_notes ? briefcase.repairability_notes.substring(0, 200) + '...' : 'MISSING')
  console.log('  warranty_notes:', briefcase.warranty_notes ? briefcase.warranty_notes.substring(0, 200) + '...' : 'MISSING')
  console.log('  social_notes:', briefcase.social_notes ? briefcase.social_notes.substring(0, 200) + '...' : 'MISSING')
}

checkCSVBriggs()
