// Triage the 161 characters to determine which are truly multi-pronunciation
// vs data errors

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

// Known high-frequency multi-pronunciation characters
// Source: Common Chinese dictionaries
const KNOWN_MULTI_PRONUNCIATION = new Set([
  // Very common multi-pronunciation characters
  '和', '行', '重', '还', '长', '觉', '教', '调', '都', '量', '没', '少',
  '给', '结', '种', '只', '更', '为', '将', '处', '传', '乐', '着', '了',
  '差', '数', '解', '当', '似', '正', '看', '供', '应', '朝', '便', '地',
  '相', '间', '把', '得', '要', '会', '空', '干', '背', '几', '担', '冲',
  '缝', '角', '扁', '系', '削', '奔', '切', '折', '省', '场', '挑', '累',
  '提', '蒙', '参', '漂', '单', '什', '落', '藏', '转', '曾', '露', '率',
  '分', '晃', '答', '胖', '假', '弹', '扫', '降', '待', '舍', '燕', '佛',
  '缝', '划', '劲', '兴', '鲜', '难', '薄', '泊', '华', '载', '扎', '帖'
])

async function triageCharacters() {
  console.log('🔍 Triaging 161 Characters\n')
  
  const { data: entries } = await supabase
    .from('dictionary_entries')
    .select('simp, trad, zhuyin, pinyin')
    .order('simp')
  
  const malformed = entries.filter(e => 
    e.simp.length === 1 && 
    e.zhuyin && 
    e.zhuyin.length > 1
  )
  
  console.log(`Found ${malformed.length} single characters with multiple syllables\n`)
  
  // Categorize
  const categories = {
    knownMultiPronunciation: [],
    likelyMultiPronunciation: [],
    possibleDataError: [],
    needsResearch: []
  }
  
  for (const entry of malformed) {
    const char = entry.simp
    const syllableCount = entry.zhuyin.length
    
    if (KNOWN_MULTI_PRONUNCIATION.has(char)) {
      categories.knownMultiPronunciation.push({
        char,
        syllableCount,
        zhuyin: entry.zhuyin,
        pinyin: entry.pinyin
      })
    } else if (syllableCount >= 3) {
      // 3+ syllables is almost certainly multi-pronunciation
      categories.likelyMultiPronunciation.push({
        char,
        syllableCount,
        zhuyin: entry.zhuyin
      })
    } else if (syllableCount === 2) {
      // Could go either way - needs research
      categories.needsResearch.push({
        char,
        syllableCount,
        zhuyin: entry.zhuyin
      })
    }
  }
  
  // Report
  console.log('='.repeat(80))
  console.log('📊 TRIAGE RESULTS')
  console.log('='.repeat(80))
  
  console.log(`\n✅ KNOWN MULTI-PRONUNCIATION (${categories.knownMultiPronunciation.length})`)
  console.log('These are confirmed multi-pronunciation characters:\n')
  categories.knownMultiPronunciation.forEach(item => {
    console.log(`  ${item.char}: ${item.syllableCount} syllables - ${item.pinyin || 'no pinyin'}`)
  })
  
  console.log(`\n\n🔶 LIKELY MULTI-PRONUNCIATION (${categories.likelyMultiPronunciation.length})`)
  console.log('3+ syllables = almost certainly multi-pronunciation:\n')
  categories.likelyMultiPronunciation.forEach(item => {
    console.log(`  ${item.char}: ${item.syllableCount} syllables`)
  })
  
  console.log(`\n\n❓ NEEDS RESEARCH (${categories.needsResearch.length})`)
  console.log('2 syllables - could be multi-pronunciation OR data error:\n')
  console.log('First 30 characters:')
  categories.needsResearch.slice(0, 30).forEach(item => {
    console.log(`  ${item.char}`)
  })
  if (categories.needsResearch.length > 30) {
    console.log(`  ... and ${categories.needsResearch.length - 30} more`)
  }
  
  // Recommendation
  console.log('\n' + '='.repeat(80))
  console.log('💡 RECOMMENDATION')
  console.log('='.repeat(80))
  
  const definitelyFix = categories.knownMultiPronunciation.length + categories.likelyMultiPronunciation.length
  
  console.log(`\n📌 Definitely fix (known + likely): ${definitelyFix} characters`)
  console.log(`🔍 Needs research: ${categories.needsResearch.length} characters`)
  console.log(`\nApproach:`)
  console.log(`1. Fix ${definitelyFix} confirmed multi-pronunciation characters now`)
  console.log(`2. Research ${categories.needsResearch.length} questionable characters separately`)
  console.log(`3. Create follow-up migration for researched characters`)
  
  // Save report
  const report = {
    totalMalformed: malformed.length,
    knownMultiPronunciation: categories.knownMultiPronunciation.map(c => c.char),
    likelyMultiPronunciation: categories.likelyMultiPronunciation.map(c => c.char),
    needsResearch: categories.needsResearch.map(c => c.char),
    recommendedFixNow: definitelyFix,
    recommendedResearchLater: categories.needsResearch.length
  }
  
  const reportPath = path.join(process.cwd(), 'scripts', 'triage-results.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log(`\n💾 Detailed report saved to: ${reportPath}`)
}

triageCharacters().catch(console.error)
