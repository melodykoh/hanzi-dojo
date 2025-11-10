// Debug script to check dictionary entries for specific characters
// Run with: node scripts/debug-dictionary-chars.js

import { createClient } from '@supabase/supabase-js'

// Read from .env.local
import * as fs from 'fs'
import * as path from 'path'

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) {
    console.error('.env.local not found')
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

async function checkChars() {
  const chars = ['什', '和', '麼', '著', '因', '星', '它']
  
  console.log('🔍 Checking dictionary entries...\n')
  
  const { data, error } = await supabase
    .from('dictionary_entries')
    .select('simp, trad, zhuyin, zhuyin_variants')
    .in('simp', chars)
    .order('simp')
  
  if (error) {
    console.error('❌ Error:', error)
    return
  }
  
  console.log(`✅ Found ${data?.length || 0} entries:\n`)
  
  for (const char of chars) {
    const entry = data?.find(e => e.simp === char)
    
    console.log(`\n${'='.repeat(50)}`)
    console.log(`Character: ${char}`)
    console.log('='.repeat(50))
    
    if (!entry) {
      console.log('❌ NOT FOUND IN DICTIONARY')
      continue
    }
    
    console.log(`Traditional: ${entry.trad}`)
    console.log(`Zhuyin: ${JSON.stringify(entry.zhuyin, null, 2)}`)
    
    // Check zhuyin structure
    if (entry.zhuyin && Array.isArray(entry.zhuyin)) {
      console.log(`\n📊 Zhuyin Analysis:`)
      console.log(`  - Syllables count: ${entry.zhuyin.length}`)
      
      entry.zhuyin.forEach((syllable, idx) => {
        if (Array.isArray(syllable) && syllable.length === 3) {
          const [initial, final, tone] = syllable
          console.log(`  - Syllable ${idx + 1}: ["${initial}", "${final}", "${tone}"]`)
          console.log(`    - Tone char code: ${tone.charCodeAt(0)} (U+${tone.charCodeAt(0).toString(16).toUpperCase()})`)
          
          // Check if tone is valid
          const validTones = ['ˉ', 'ˊ', 'ˇ', 'ˋ', '˙']
          const isValid = validTones.includes(tone)
          console.log(`    - Valid tone? ${isValid ? '✅' : '❌'}`)
          
          if (!isValid) {
            console.log(`    - ⚠️ PROBLEM: Tone "${tone}" not in valid set`)
            console.log(`    - Valid tones: ${validTones.map(t => `"${t}" (U+${t.charCodeAt(0).toString(16).toUpperCase()})`).join(', ')}`)
          }
        } else {
          console.log(`  - Syllable ${idx + 1}: ⚠️ MALFORMED: ${JSON.stringify(syllable)}`)
        }
      })
    } else {
      console.log(`\n⚠️ Zhuyin is not an array`)
    }
    
    // Check variants
    if (entry.zhuyin_variants && entry.zhuyin_variants.length > 0) {
      console.log(`\n🎭 Variants (多音字): ${entry.zhuyin_variants.length} pronunciations`)
      entry.zhuyin_variants.forEach((variant, idx) => {
        console.log(`  ${idx + 1}. ${JSON.stringify(variant.zhuyin)}`)
        if (variant.context_words) {
          console.log(`     Context: ${variant.context_words.join(', ')}`)
        }
      })
    } else {
      console.log(`\n📝 No variants (single pronunciation)`)
    }
  }
  
  console.log('\n' + '='.repeat(50))
  console.log('✅ Check complete')
}

checkChars().catch(console.error)
