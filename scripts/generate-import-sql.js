import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Read dictionary seed file
const seedPath = join(__dirname, '../data/dictionary_seed_v1.json')
const seedData = JSON.parse(readFileSync(seedPath, 'utf-8'))

console.log(`Generating SQL for ${seedData.entries.length} dictionary entries...\n`)

let sql = `-- Auto-generated dictionary import SQL
-- Generated from dictionary_seed_v1.json
-- Total entries: ${seedData.entries.length}

-- Temporarily disable RLS for import
ALTER TABLE dictionary_entries DISABLE ROW LEVEL SECURITY;

`

// Generate INSERT statements
for (const entry of seedData.entries) {
  const simp = entry.simp.replace(/'/g, "''")
  const trad = entry.trad.replace(/'/g, "''")
  
  // Handle zhuyin - use first variant if zhuyin is missing
  let zhuyinJson
  if (entry.zhuyin) {
    zhuyinJson = JSON.stringify(entry.zhuyin).replace(/'/g, "''")
  } else if (entry.zhuyin_variants && entry.zhuyin_variants.length > 0) {
    zhuyinJson = JSON.stringify(entry.zhuyin_variants[0].zhuyin).replace(/'/g, "''")
  } else {
    console.warn(`Warning: No zhuyin found for ${entry.simp}, skipping...`)
    continue
  }
  
  const pinyin = entry.pinyin ? `'${entry.pinyin.replace(/'/g, "''")}'` : 'NULL'
  const zhuyinVariantsJson = entry.zhuyin_variants ? `'${JSON.stringify(entry.zhuyin_variants).replace(/'/g, "''")}'` : 'NULL'
  const meaningsArray = entry.meanings ? `ARRAY['${entry.meanings.join("','")}']` : 'NULL'
  const freqRank = entry.frequency_rank || 'NULL'

  sql += `INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('${simp}', '${trad}', '${zhuyinJson}'::jsonb, ${pinyin}, ${zhuyinVariantsJson}::jsonb, ${meaningsArray}, ${freqRank})
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

`
}

sql += `
-- Re-enable RLS
ALTER TABLE dictionary_entries ENABLE ROW LEVEL SECURITY;

-- Verify import
SELECT COUNT(*) as total_entries FROM dictionary_entries;
`

// Write to file
const outputPath = join(__dirname, '../supabase/migrations/003_import_dictionary_data.sql')
writeFileSync(outputPath, sql, 'utf-8')

console.log(`✅ Generated SQL file: supabase/migrations/003_import_dictionary_data.sql`)
console.log(`\nTo import:`)
console.log(`1. Open Supabase SQL Editor`)
console.log(`2. Copy the contents of 003_import_dictionary_data.sql`)
console.log(`3. Paste and run in SQL Editor`)
console.log(`4. Verify count shows ${seedData.entries.length} entries\n`)
