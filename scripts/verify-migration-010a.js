// Verify Migration 010a Success
// Run after applying migration via Supabase Dashboard
// Usage: node scripts/verify-migration-010a.js

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local')
  const content = fs.readFileSync(envPath, 'utf8')
  const lines = content.split('\n')
  for (const line of lines) {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) process.env[match[1].trim()] = match[2].trim()
  }
}

loadEnv()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

const FIXED_CHARS = ['和', '乐', '仔', '何', '单', '参', '吗', '员', '咱', '哪', '啊', '差', '当', '折', '提', '数', '漂', '空', '累', '胖', '落', '解']
const USER_REPORTED = ['和', '因', '星', '它']

async function verify() {
  console.log('🔍 Verifying Migration 010a Results')
  console.log('=' .repeat(80))
  console.log()
  
  let allPassed = true
  
  // Test 1: Check for empty tone marks
  console.log('Test 1: Verify empty tone marks fixed...')
  const { data: emptyTones, error: e1 } = await supabase
    .from('dictionary_entries')
    .select('simp, trad, zhuyin')
    .contains('zhuyin', [['""', '""', '""']])
  
  if (e1) {
    console.error('  ❌ Query failed:', e1.message)
    allPassed = false
  } else if (emptyTones && emptyTones.length > 0) {
    console.log(`  ❌ FAILED: Found ${emptyTones.length} entries still with empty tones`)
    console.log('  First 5:', emptyTones.slice(0, 5).map(e => e.simp).join(', '))
    allPassed = false
  } else {
    console.log('  ✅ PASSED: No empty tone marks found')
  }
  console.log()
  
  // Test 2: Check multi-pronunciation characters have variants
  console.log('Test 2: Verify 22 multi-pronunciation characters restructured...')
  const { data: multiPron, error: e2 } = await supabase
    .from('dictionary_entries')
    .select('simp, trad, zhuyin_variants')
    .in('simp', FIXED_CHARS)
  
  if (e2) {
    console.error('  ❌ Query failed:', e2.message)
    allPassed = false
  } else if (multiPron) {
    const withVariants = multiPron.filter(e => e.zhuyin_variants && e.zhuyin_variants.length > 0)
    const missing = FIXED_CHARS.filter(char => !withVariants.find(e => e.simp === char))
    
    console.log(`  Found: ${withVariants.length}/${FIXED_CHARS.length} characters with variants`)
    
    if (withVariants.length === FIXED_CHARS.length) {
      console.log('  ✅ PASSED: All 22 characters have zhuyin_variants')
      
      // Show variant counts
      console.log('\n  Variant counts:')
      withVariants.forEach(e => {
        const count = e.zhuyin_variants ? e.zhuyin_variants.length : 0
        console.log(`    ${e.simp}: ${count} variants`)
      })
    } else {
      console.log(`  ❌ FAILED: Missing variants for: ${missing.join(', ')}`)
      allPassed = false
    }
  }
  console.log()
  
  // Test 3: Check 麼 character added
  console.log('Test 3: Verify 麼 character added...')
  const { data: meMissing, error: e3 } = await supabase
    .from('dictionary_entries')
    .select('simp, trad, zhuyin, zhuyin_variants')
    .or('simp.eq.么,trad.eq.麼')
  
  if (e3) {
    console.error('  ❌ Query failed:', e3.message)
    allPassed = false
  } else if (!meMissing || meMissing.length === 0) {
    console.log('  ❌ FAILED: Character 麼 not found')
    allPassed = false
  } else {
    console.log('  ✅ PASSED: Character 麼 found')
    console.log(`    Simplified: ${meMissing[0].simp}`)
    console.log(`    Traditional: ${meMissing[0].trad}`)
    console.log(`    Variants: ${meMissing[0].zhuyin_variants?.length || 0}`)
  }
  console.log()
  
  // Test 4: Spot check user-reported characters
  console.log('Test 4: Spot check user-reported characters...')
  for (const char of USER_REPORTED) {
    const { data: charData, error } = await supabase
      .from('dictionary_entries')
      .select('simp, trad, zhuyin, zhuyin_variants')
      .eq('simp', char)
      .single()
    
    if (error) {
      console.log(`  ⚠️  ${char}: Not found or error - ${error.message}`)
      continue
    }
    
    if (!charData) {
      console.log(`  ❌ ${char}: Not found in dictionary`)
      allPassed = false
      continue
    }
    
    // Check for proper structure
    const hasZhuyin = charData.zhuyin && charData.zhuyin.length > 0
    const hasVariants = charData.zhuyin_variants && charData.zhuyin_variants.length > 0
    const hasEmptyTone = hasZhuyin && charData.zhuyin.some(syl => syl[2] === '')
    
    if (hasEmptyTone) {
      console.log(`  ❌ ${char}: Still has empty tone marks`)
      allPassed = false
    } else if (hasVariants) {
      console.log(`  ✅ ${char}: Multi-pronunciation (${charData.zhuyin_variants.length} variants)`)
    } else if (hasZhuyin) {
      console.log(`  ✅ ${char}: Single pronunciation with valid tone`)
    } else {
      console.log(`  ⚠️  ${char}: Has unexpected structure`)
    }
  }
  console.log()
  
  // Summary
  console.log('=' .repeat(80))
  if (allPassed) {
    console.log('✅✅✅ ALL TESTS PASSED - Migration 010a successful!')
    console.log()
    console.log('Next steps:')
    console.log('1. Test in production app: https://hanzi-dojo.vercel.app')
    console.log('2. Try adding: 和, 因, 星, 它')
    console.log('3. Verify error messages are gone')
    console.log('4. Update SESSION_LOG.md with results')
  } else {
    console.log('❌ SOME TESTS FAILED - Review output above')
    console.log()
    console.log('Troubleshooting:')
    console.log('1. Verify migration SQL was executed completely')
    console.log('2. Check Supabase Dashboard SQL Editor for error messages')
    console.log('3. Re-run migration if needed (it\'s idempotent)')
  }
  console.log('=' .repeat(80))
  console.log()
}

verify().catch(console.error)
