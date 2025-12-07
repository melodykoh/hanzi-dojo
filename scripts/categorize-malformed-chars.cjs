// Script to categorize malformed characters for Issue #23
// Run with: node --env-file=.env.local scripts/categorize-malformed-chars.cjs

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function categorizeChars() {
  console.log('=== Categorizing Malformed Characters ===\n')

  // Query all dictionary entries for single-char entries
  const { data: entries, error } = await supabase
    .from('dictionary_entries')
    .select('simp, trad, zhuyin, zhuyin_variants')
    .limit(2000)

  if (error) {
    console.error('Query error:', error.message)
    return
  }

  // Filter for malformed single-char entries
  const malformed = entries.filter(e => {
    const isSingleChar = e.simp.length === 1
    const hasMultipleSyllables = Array.isArray(e.zhuyin) && e.zhuyin.length > 1
    return isSingleChar && hasMultipleSyllables
  })

  // Categorize into 3 groups:
  // Category 1: Has curated zhuyin_variants from 011b (with context_words)
  // Category 2: Has empty-context zhuyin_variants from 011c
  // Category 3: No zhuyin_variants at all

  const category1 = [] // Has curated variants (context_words populated)
  const category2 = [] // Has variants but empty context_words
  const category3 = [] // No variants

  malformed.forEach(e => {
    if (!e.zhuyin_variants || e.zhuyin_variants.length === 0) {
      category3.push(e)
    } else {
      // Check if context_words are populated
      const hasContextWords = e.zhuyin_variants.some(v =>
        v.context_words && v.context_words.length > 0
      )
      if (hasContextWords) {
        category1.push(e)
      } else {
        category2.push(e)
      }
    }
  })

  console.log(`Total malformed characters: ${malformed.length}\n`)

  console.log(`Category 1 (Has curated 011b variants): ${category1.length}`)
  console.log('  → Action: Only fix main zhuyin, preserve existing variants')
  if (category1.length > 0) {
    console.log('  Characters:', category1.map(e => e.simp).join(', '))
  }

  console.log(`\nCategory 2 (Has empty-context 011c variants): ${category2.length}`)
  console.log('  → Action: Fix zhuyin + add context words')
  if (category2.length > 0) {
    console.log('  Characters:', category2.map(e => e.simp).join(', '))
  }

  console.log(`\nCategory 3 (No variants): ${category3.length}`)
  console.log('  → Action: Create full Pattern A structure')
  if (category3.length > 0) {
    console.log('  Characters:', category3.map(e => e.simp).join(', '))
  }

  // Output detailed info for each character
  console.log('\n\n=== Detailed Character Info ===\n')

  console.log('--- Category 1 (Curated variants, only fix zhuyin) ---')
  category1.forEach(e => {
    const zhuyinDisplay = e.zhuyin.map(syl => syl.join('')).join(' | ')
    console.log(`${e.simp} (${e.trad}): ${zhuyinDisplay}`)
  })

  console.log('\n--- Category 2 (Empty context, add context words) ---')
  category2.forEach(e => {
    const zhuyinDisplay = e.zhuyin.map(syl => syl.join('')).join(' | ')
    console.log(`${e.simp} (${e.trad}): ${zhuyinDisplay}`)
  })

  console.log('\n--- Category 3 (No variants, create full structure) ---')
  category3.forEach(e => {
    const zhuyinDisplay = e.zhuyin.map(syl => syl.join('')).join(' | ')
    console.log(`${e.simp} (${e.trad}): ${zhuyinDisplay}`)
  })

  // Output JSON for processing
  const output = {
    total: malformed.length,
    category1: {
      count: category1.length,
      action: 'only_fix_zhuyin',
      chars: category1.map(e => ({
        simp: e.simp,
        trad: e.trad,
        current_zhuyin: e.zhuyin
      }))
    },
    category2: {
      count: category2.length,
      action: 'fix_zhuyin_and_add_context',
      chars: category2.map(e => ({
        simp: e.simp,
        trad: e.trad,
        current_zhuyin: e.zhuyin,
        current_variants: e.zhuyin_variants
      }))
    },
    category3: {
      count: category3.length,
      action: 'create_full_pattern_a',
      chars: category3.map(e => ({
        simp: e.simp,
        trad: e.trad,
        current_zhuyin: e.zhuyin
      }))
    }
  }

  console.log('\n\n=== JSON Output ===')
  console.log(JSON.stringify(output, null, 2))
}

categorizeChars().catch(console.error)
