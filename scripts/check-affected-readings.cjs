// Script to check how many user readings have malformed multi-syllable data
// Run with: node --env-file=.env.local scripts/check-affected-readings.cjs

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
  console.log('Make sure to run with: node --env-file=.env.local scripts/check-affected-readings.cjs')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDictionary() {
  console.log('\n=== Checking Dictionary (Public Data) ===')

  // Query dictionary for malformed entries (this is public data)
  const { data: dictEntries, error: dictError } = await supabase
    .from('dictionary_entries')
    .select('simp, trad, zhuyin')
    .limit(1000)

  if (dictError) {
    console.error('Dictionary query error:', dictError.message)
    return
  }

  // Find single-character entries with multi-syllable zhuyin
  const malformedDict = dictEntries.filter(e => {
    const isSingleChar = e.simp.length === 1
    const hasMultipleSyllables = Array.isArray(e.zhuyin) && e.zhuyin.length > 1
    return isSingleChar && hasMultipleSyllables
  })

  console.log('Total dictionary entries checked:', dictEntries.length)
  console.log('Malformed single-char entries in dictionary:', malformedDict.length)

  if (malformedDict.length > 0) {
    console.log('\nFirst 20 malformed dictionary entries:')
    malformedDict.slice(0, 20).forEach(e => {
      const zhuyinDisplay = e.zhuyin.map(syl => syl.join('')).join(' | ')
      console.log(`  ${e.simp} (${e.trad}): ${zhuyinDisplay}`)
    })

    if (malformedDict.length > 20) {
      console.log(`  ... and ${malformedDict.length - 20} more`)
    }
  }
}

async function checkReadingsWithAuth() {
  console.log('\n=== Checking Readings (Requires Auth) ===')
  console.log('Note: Readings table has RLS - requires authenticated user')
  console.log('To check your readings, run this query in Supabase Dashboard SQL Editor:')
  console.log(`
SELECT r.id, e.simp, r.zhuyin, jsonb_array_length(r.zhuyin) as syllable_count
FROM readings r
JOIN entries e ON r.entry_id = e.id
WHERE e.type = 'char'
  AND length(e.simp) = 1
  AND jsonb_array_length(r.zhuyin) > 1
ORDER BY e.simp;
  `)
}

async function main() {
  await checkDictionary()
  await checkReadingsWithAuth()
}

main().catch(console.error)
