// Comprehensive verification of multi-pronunciation characters
// Checks BOTH:
// 1. Characters with malformed data (syllables crammed together)
// 2. Characters that already have zhuyin_variants set correctly

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

async function comprehensiveCheck() {
  console.log('🔍 Comprehensive Multi-Pronunciation Verification\n')
  
  const { data: entries, error } = await supabase
    .from('dictionary_entries')
    .select('simp, trad, zhuyin, zhuyin_variants')
    .order('simp')
  
  if (error) {
    console.error('❌ Error:', error)
    return
  }
  
  console.log(`✅ Loaded ${entries.length} entries\n`)
  
  // Category 1: Characters with malformed multi-syllable arrays
  const malformed = []
  
  // Category 2: Characters with zhuyin_variants already set
  const withVariants = []
  
  // Category 3: Suspicious single-character with multiple syllables
  const suspicious = []
  
  for (const entry of entries) {
    const char = entry.simp
    const zhuyinLength = entry.zhuyin?.length || 0
    const hasVariants = entry.zhuyin_variants && entry.zhuyin_variants.length > 0
    
    // Check if has variants
    if (hasVariants) {
      withVariants.push({
        char,
        variantCount: entry.zhuyin_variants.length,
        variants: entry.zhuyin_variants
      })
    }
    
    // Check if single character with multiple syllables (potential issue)
    if (char.length === 1 && zhuyinLength > 1) {
      malformed.push({
        char,
        syllableCount: zhuyinLength,
        zhuyin: entry.zhuyin,
        hasVariants
      })
    }
    
    // Check for two-character words with unusual syllable counts
    if (char.length === 2 && zhuyinLength !== 2) {
      suspicious.push({
        char,
        expectedSyllables: 2,
        actualSyllables: zhuyinLength,
        hasVariants
      })
    }
  }
  
  // Report findings
  console.log('='.repeat(80))
  console.log('📊 FINDINGS')
  console.log('='.repeat(80))
  
  console.log(`\n1️⃣ Characters with zhuyin_variants ALREADY set: ${withVariants.length}`)
  if (withVariants.length > 0) {
    console.log('\nThese are CORRECT and should be left alone:\n')
    withVariants.forEach(item => {
      console.log(`  ${item.char}: ${item.variantCount} variants`)
      item.variants.forEach((v, idx) => {
        const contextPreview = v.context_words ? v.context_words.slice(0, 2).join(', ') : 'no context'
        console.log(`    ${idx + 1}. ${v.pinyin || 'no pinyin'} - ${contextPreview}`)
      })
    })
  }
  
  console.log(`\n\n2️⃣ Single characters with MALFORMED multi-syllable arrays: ${malformed.length}`)
  if (malformed.length > 0) {
    console.log('\nThese likely have multiple pronunciations crammed together:\n')
    
    // Group by whether they already have variants
    const withoutVariants = malformed.filter(m => !m.hasVariants)
    const alreadyHasVariants = malformed.filter(m => m.hasVariants)
    
    console.log(`  📌 WITHOUT variants (needs fixing): ${withoutVariants.length}`)
    withoutVariants.forEach(item => {
      console.log(`    ${item.char}: ${item.syllableCount} syllables`)
    })
    
    if (alreadyHasVariants.length > 0) {
      console.log(`\n  ✅ ALREADY has variants (may be intentional): ${alreadyHasVariants.length}`)
      alreadyHasVariants.forEach(item => {
        console.log(`    ${item.char}: ${item.syllableCount} syllables in main array but has variants`)
      })
    }
  }
  
  console.log(`\n\n3️⃣ Two-character words with unusual syllable counts: ${suspicious.length}`)
  if (suspicious.length > 0) {
    console.log('\nThese may have data quality issues:\n')
    suspicious.slice(0, 10).forEach(item => {
      console.log(`  ${item.char}: expected 2 syllables, has ${item.actualSyllables}`)
    })
    if (suspicious.length > 10) {
      console.log(`  ... and ${suspicious.length - 10} more`)
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(80))
  console.log('📋 SUMMARY')
  console.log('='.repeat(80))
  console.log(`\nTotal characters in dictionary: ${entries.length}`)
  console.log(`Characters with proper zhuyin_variants: ${withVariants.length}`)
  console.log(`Characters with malformed multi-pronunciation: ${malformed.filter(m => !m.hasVariants).length}`)
  console.log(`Suspicious entries: ${suspicious.length}`)
  
  console.log('\n✅ Migration should fix: ' + malformed.filter(m => !m.hasVariants).length + ' characters')
  console.log('✅ Already correct (skip): ' + withVariants.length + ' characters')
  
  // Check if our migration list (22 chars) matches
  const ourList = ['和','乐','仔','何','单','参','吗','员','咱','哪','啊','差','当','折','提','数','漂','空','累','胖','落','解']
  const actualMalformed = malformed.filter(m => !m.hasVariants).map(m => m.char)
  
  console.log('\n' + '='.repeat(80))
  console.log('🔍 VERIFICATION OF MIGRATION LIST')
  console.log('='.repeat(80))
  console.log(`\nOur migration targets: ${ourList.length} characters`)
  console.log(`Actually malformed: ${actualMalformed.length} characters`)
  
  const inMigrationButNotMalformed = ourList.filter(c => !actualMalformed.includes(c))
  const malformedButNotInMigration = actualMalformed.filter(c => !ourList.includes(c))
  
  if (inMigrationButNotMalformed.length > 0) {
    console.log(`\n⚠️  In migration but NOT malformed: ${inMigrationButNotMalformed.length}`)
    console.log(`   ${inMigrationButNotMalformed.join(', ')}`)
    console.log('   (These might already be fixed or not in dictionary)')
  }
  
  if (malformedButNotInMigration.length > 0) {
    console.log(`\n🔴 MISSING FROM MIGRATION: ${malformedButNotInMigration.length} characters`)
    console.log(`   ${malformedButNotInMigration.join(', ')}`)
    console.log('   ⚠️  THESE NEED TO BE ADDED TO MIGRATION!')
  }
  
  if (inMigrationButNotMalformed.length === 0 && malformedButNotInMigration.length === 0) {
    console.log('\n✅ Migration list is COMPLETE and ACCURATE!')
  }
  
  // Save detailed report
  const report = {
    totalEntries: entries.length,
    withVariants: withVariants.length,
    malformedWithoutVariants: malformed.filter(m => !m.hasVariants).length,
    malformedCharacters: actualMalformed,
    charactersWithVariants: withVariants.map(w => w.char),
    suspicious: suspicious.length,
    migrationListAccurate: malformedButNotInMigration.length === 0 && inMigrationButNotMalformed.length === 0,
    missingFromMigration: malformedButNotInMigration,
    unnecessaryInMigration: inMigrationButNotMalformed
  }
  
  const reportPath = path.join(process.cwd(), 'scripts', 'multi-pronunciation-verification.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log(`\n💾 Detailed report saved to: ${reportPath}`)
}

comprehensiveCheck().catch(console.error)
