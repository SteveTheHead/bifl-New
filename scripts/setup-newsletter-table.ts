import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function setupNewsletterTable() {
  console.log('Setting up newsletter_subscribers table...\n')

  try {
    // Read the SQL file
    const sqlPath = join(process.cwd(), 'newsletter-table-setup.sql')
    const sql = readFileSync(sqlPath, 'utf-8')

    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      console.error('❌ Error executing SQL:', error)

      // Try alternative approach - execute statements individually
      console.log('\n Trying alternative approach...\n')

      // Create table
      const { error: createError } = await supabase.from('newsletter_subscribers').select('*').limit(1)

      if (createError) {
        console.log('Table does not exist yet, creating...')
        // Since we can't execute raw SQL directly, we'll note that manual setup is needed
        console.log('\n⚠️  Unable to create table automatically.')
        console.log('Please run the SQL manually in your Supabase SQL Editor:\n')
        console.log('1. Go to https://app.supabase.com/project/_/sql/new')
        console.log('2. Copy and paste the contents of newsletter-table-setup.sql')
        console.log('3. Click "Run" to execute\n')
        process.exit(1)
      } else {
        console.log('✅ Table already exists!')
      }
    } else {
      console.log('✅ Newsletter table setup complete!')
    }

    // Verify the table exists
    const { data, error: verifyError } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .limit(1)

    if (verifyError) {
      console.error('\n❌ Table verification failed:', verifyError)
      console.log('\nPlease create the table manually in Supabase SQL Editor.')
      process.exit(1)
    } else {
      console.log('\n✅ Verification successful - newsletter_subscribers table is ready!')
    }

  } catch (err) {
    console.error('❌ Error:', err)
    process.exit(1)
  }
}

setupNewsletterTable()
