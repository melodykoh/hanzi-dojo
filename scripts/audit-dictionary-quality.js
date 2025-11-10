// Comprehensive Dictionary Quality Audit
// Scans ALL dictionary entries for data quality issues
// Run with: node scripts/audit-dictionary-quality.js

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local not found')
    process.exit(1)
  }
  
  const content = fs.readFileSync(envPath, 'utf8')
  const lines = content.split('\n')
  
  for (const line of lines) {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim()
      process.env[key] = value
    }
  }
}

loadEnv()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

const VALID_TONES = ['ˉ', 'ˊ', 'ˇ', 'ˋ', '˙']

// Track all issues found
const issues = {
  emptyTones: [],
  invalidTones: [],
  malformedMultiPronunciation: [],
  missingZhuyin: [],
  invalidStructure: [],
  suspiciousVariants: []
}

function checkZhuyinStructure(char, zhuyin, context = 'main') {
  if (!zhuyin || !Array.isArray(zhuyin)) {
    issues.missingZhuyin.push({ char, context, issue: 'Zhuyin is null or not an array' })
    return false
  }

  // Check if this looks like multiple pronunciations crammed together
  if (context === 'main' && zhuyin.length > 2) {
    // Single characters should typically have 1 syllable
    // Two-character words should have 2 syllables
    // If char is 1 character but has 3+ syllables, likely malformed
    if (char.length === 1 && zhuyin.length > 1) {
      issues.malformedMultiPronunciation.push({
        char,
        syllables: zhuyin.length,
        zhuyin: JSON.stringify(zhuyin),
        reason: `Single character with ${zhuyin.length} syllables - likely multiple pronunciations crammed together`
      })
    }
  }

  for (let i = 0; i < zhuyin.length; i++) {
    const syllable = zhuyin[i]
    
    if (!Array.isArray(syllable) || syllable.length !== 3) {
      issues.invalidStructure.push({
        char,
        context,
        syllableIndex: i,
        syllable: JSON.stringify(syllable),
        issue: 'Syllable is not [initial, final, tone] array'
      })
      continue
    }

    const [initial, final, tone] = syllable

    // Check for empty tone (should be "ˉ" for first tone)
    if (tone === '' || tone === null || tone === undefined) {
      issues.emptyTones.push({
        char,
        context,
        syllableIndex: i,
        syllable: JSON.stringify(syllable),
        initial,
        final
      })
    } else if (!VALID_TONES.includes(tone)) {
      issues.invalidTones.push({
        char,
        context,
        syllableIndex: i,
        syllable: JSON.stringify(syllable),
        tone,
        toneCharCode: tone.charCodeAt(0)
      })
    }
  }
}

async function auditDictionary() {
  console.log('🔍 Starting comprehensive dictionary audit...\n')
  console.log('Fetching all dictionary entries...')

  // Fetch ALL entries
  const { data: entries, error } = await supabase
    .from('dictionary_entries')
    .select('id, simp, trad, zhuyin, zhuyin_variants')
    .order('simp')

  if (error) {
    console.error('❌ Error fetching entries:', error)
    return
  }

  console.log(`✅ Loaded ${entries.length} dictionary entries\n`)
  console.log('Analyzing data quality...\n')

  for (const entry of entries) {
    const char = entry.simp

    // Check main zhuyin
    checkZhuyinStructure(char, entry.zhuyin, 'main')

    // Check variants (if present)
    if (entry.zhuyin_variants && Array.isArray(entry.zhuyin_variants)) {
      if (entry.zhuyin_variants.length > 0) {
        for (let i = 0; i < entry.zhuyin_variants.length; i++) {
          const variant = entry.zhuyin_variants[i]
          if (variant && variant.zhuyin) {
            checkZhuyinStructure(char, variant.zhuyin, `variant-${i}`)
          } else {
            issues.suspiciousVariants.push({
              char,
              variantIndex: i,
              issue: 'Variant missing zhuyin field',
              variant: JSON.stringify(variant)
            })
          }
        }
      }
    }
  }

  // Print summary
  console.log('=' .repeat(80))
  console.log('📊 AUDIT RESULTS')
  console.log('='.repeat(80))

  console.log(`\n📈 Total Entries Scanned: ${entries.length}`)

  console.log(`\n🔴 CRITICAL ISSUES:`)
  console.log(`  - Empty Tones (should be "ˉ"): ${issues.emptyTones.length}`)
  console.log(`  - Invalid Tone Marks: ${issues.invalidTones.length}`)
  console.log(`  - Malformed Multi-Pronunciation: ${issues.malformedMultiPronunciation.length}`)
  
  console.log(`\n🟡 WARNINGS:`)
  console.log(`  - Missing Zhuyin: ${issues.missingZhuyin.length}`)
  console.log(`  - Invalid Structure: ${issues.invalidStructure.length}`)
  console.log(`  - Suspicious Variants: ${issues.suspiciousVariants.length}`)

  // Print detailed findings
  if (issues.emptyTones.length > 0) {
    console.log(`\n${'='.repeat(80)}`)
    console.log(`🔴 EMPTY TONES (${issues.emptyTones.length} found)`)
    console.log('='.repeat(80))
    console.log('These should use "ˉ" (U+02C9) for first tone:\n')
    
    // Group by character
    const byChar = {}
    issues.emptyTones.forEach(issue => {
      if (!byChar[issue.char]) byChar[issue.char] = []
      byChar[issue.char].push(issue)
    })
    
    Object.entries(byChar).forEach(([char, charIssues]) => {
      console.log(`  ${char}:`)
      charIssues.forEach(issue => {
        console.log(`    - ${issue.context} syllable ${issue.syllableIndex}: ["${issue.initial}", "${issue.final}", ""]`)
      })
    })
  }

  if (issues.malformedMultiPronunciation.length > 0) {
    console.log(`\n${'='.repeat(80)}`)
    console.log(`🔴 MALFORMED MULTI-PRONUNCIATION (${issues.malformedMultiPronunciation.length} found)`)
    console.log('='.repeat(80))
    console.log('These likely have multiple pronunciations crammed into main zhuyin array:')
    console.log('Should be restructured to use zhuyin_variants field.\n')
    
    issues.malformedMultiPronunciation.forEach(issue => {
      console.log(`  ${issue.char}:`)
      console.log(`    - Has ${issue.syllables} syllables`)
      console.log(`    - Reason: ${issue.reason}`)
      console.log(`    - Data: ${issue.zhuyin.substring(0, 100)}...`)
      console.log()
    })
  }

  if (issues.invalidTones.length > 0) {
    console.log(`\n${'='.repeat(80)}`)
    console.log(`🟡 INVALID TONE MARKS (${issues.invalidTones.length} found)`)
    console.log('='.repeat(80))
    
    const byChar = {}
    issues.invalidTones.forEach(issue => {
      if (!byChar[issue.char]) byChar[issue.char] = []
      byChar[issue.char].push(issue)
    })
    
    Object.entries(byChar).slice(0, 10).forEach(([char, charIssues]) => {
      console.log(`  ${char}:`)
      charIssues.forEach(issue => {
        console.log(`    - ${issue.context} syllable ${issue.syllableIndex}: tone="${issue.tone}" (U+${issue.toneCharCode.toString(16).toUpperCase()})`)
      })
    })
    
    if (Object.keys(byChar).length > 10) {
      console.log(`  ... and ${Object.keys(byChar).length - 10} more characters`)
    }
  }

  if (issues.invalidStructure.length > 0) {
    console.log(`\n${'='.repeat(80)}`)
    console.log(`🟡 INVALID STRUCTURE (${issues.invalidStructure.length} found)`)
    console.log('='.repeat(80))
    issues.invalidStructure.slice(0, 10).forEach(issue => {
      console.log(`  ${issue.char} (${issue.context}):`)
      console.log(`    - ${issue.issue}`)
      console.log(`    - Data: ${issue.syllable}`)
    })
    if (issues.invalidStructure.length > 10) {
      console.log(`  ... and ${issues.invalidStructure.length - 10} more`)
    }
  }

  // Generate migration data
  console.log(`\n${'='.repeat(80)}`)
  console.log('💾 GENERATING FIX DATA')
  console.log('='.repeat(80))

  const fixData = {
    emptyToneFixes: issues.emptyTones.map(issue => ({
      char: issue.char,
      context: issue.context,
      syllableIndex: issue.syllableIndex,
      initial: issue.initial,
      final: issue.final,
      fixedTone: 'ˉ'
    })),
    multiPronunciationFixes: issues.malformedMultiPronunciation.map(issue => ({
      char: issue.char,
      syllables: issue.syllables,
      needsManualReview: true
    }))
  }

  const outputPath = path.join(process.cwd(), 'scripts', 'dictionary-audit-results.json')
  fs.writeFileSync(outputPath, JSON.stringify(fixData, null, 2))
  console.log(`\n✅ Detailed fix data saved to: ${outputPath}`)

  // Summary
  console.log(`\n${'='.repeat(80)}`)
  console.log('📋 NEXT STEPS')
  console.log('='.repeat(80))
  
  const totalIssues = issues.emptyTones.length + 
                       issues.malformedMultiPronunciation.length + 
                       issues.invalidTones.length

  if (totalIssues === 0) {
    console.log('✅ No critical issues found! Dictionary is clean.')
  } else {
    console.log(`\n1. Review audit results above`)
    console.log(`2. Create migration to fix ${issues.emptyTones.length} empty tones`)
    console.log(`3. Manually review ${issues.malformedMultiPronunciation.length} multi-pronunciation entries`)
    console.log(`4. Test migration on staging before production`)
  }

  console.log('\n' + '='.repeat(80))
}

auditDictionary().catch(console.error)
