import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function importDictionary() {
  console.log('🚀 Starting dictionary import...\n')

  // Read dictionary seed file
  const seedPath = join(__dirname, '../data/dictionary_seed_v1.json')
  const seedData = JSON.parse(readFileSync(seedPath, 'utf-8'))

  console.log(`📚 Found ${seedData.entries.length} dictionary entries to import\n`)

  // Import dictionary entries
  console.log('Importing dictionary entries...')
  let successCount = 0
  let errorCount = 0

  for (const entry of seedData.entries) {
    const { error } = await supabase
      .from('dictionary_entries')
      .insert({
        simp: entry.simp,
        trad: entry.trad,
        zhuyin: entry.zhuyin,
        pinyin: entry.pinyin,
        zhuyin_variants: entry.zhuyin_variants || null,
        meanings: entry.meanings || [],
        frequency_rank: entry.frequency_rank
      })

    if (error) {
      console.error(`  ❌ Failed to import ${entry.simp}:`, error.message)
      errorCount++
    } else {
      successCount++
      if (successCount % 10 === 0) {
        process.stdout.write(`  ✓ Imported ${successCount}/${seedData.entries.length}...\r`)
      }
    }
  }

  console.log(`\n✅ Dictionary entries: ${successCount} imported, ${errorCount} failed`)

  // Verify final count
  const { count } = await supabase
    .from('dictionary_entries')
    .select('*', { count: 'exact', head: true })

  console.log(`\n🎉 Import complete! Total entries in database: ${count}`)
}

importDictionary().catch(err => {
  console.error('❌ Import failed:', err)
  process.exit(1)
})
