// Drill Builders - Generate 4-option drill questions with curated distractors

/**
 * Drill Builders Module
 *
 * Generates 4-option multiple choice drills with curated confusion-based distractors.
 *
 * OVERVIEW:
 * This module is responsible for creating realistic practice drills that test
 * learners on common confusion points in Mandarin Chinese. Instead of random
 * wrong answers, it generates distractors based on phonetic similarity (for Zhuyin)
 * and visual similarity (for Traditional characters).
 *
 * DRILL TYPES:
 * - **Drill A (Zhuyin Recognition):** Show character, answer with Zhuyin pronunciation
 *   - Uses tone confusion (same phoneme, different tone mark)
 *   - Uses initial consonant confusion (ㄓ vs ㄗ vs ㄐ)
 *   - Uses final vowel confusion (ㄢ vs ㄤ vs ㄣ vs ㄥ)
 *
 * - **Drill B (Simplified → Traditional):** Show simplified, answer with traditional form
 *   - Uses visual character confusion (門 vs 問 vs 間)
 *   - Ensures distractors are NOT valid traditional forms (prevents false negatives)
 *
 * CONFUSION MAPS:
 * Curated from real learner mistakes and phonetic/visual similarity:
 * - TONES: ˉ (1st), ˊ (2nd), ˇ (3rd), ˋ (4th), ˙ (neutral)
 * - CONFUSE_INITIAL: Phonetically similar consonants (ㄓ/ㄗ, ㄐ/ㄑ/ㄒ, ㄉ/ㄊ, etc.)
 * - CONFUSE_FINAL: Phonetically similar vowels (ㄢ/ㄤ/ㄣ/ㄥ, ㄚ/ㄛ/ㄜ, etc.)
 * - CONFUSE_TRAD_VISUAL: Visually similar traditional characters (陽/陰, 見/現, etc.)
 *
 * GENERATION ALGORITHM (Drill A - Zhuyin):
 * 1. Start with correct answer (target Zhuyin)
 * 2. Generate tone variants (change last syllable tone) - most common confusion
 * 3. Generate initial consonant variants (swap similar consonants)
 * 4. Generate final vowel variants (swap similar vowels)
 * 5. For multi-syllable words, tweak earlier syllables if needed
 * 6. Shuffle and ensure 4 unique options
 *
 * GENERATION ALGORITHM (Drill B - Traditional):
 * 1. Start with correct traditional form
 * 2. Generate single-character substitutions using visual confusion maps
 * 3. Validate substitutions are NOT valid traditional forms (prevent false negatives)
 * 4. For multi-character words, try multi-character substitutions
 * 5. Fallback to random common characters if confusion maps insufficient
 * 6. Shuffle and ensure 4 unique options
 *
 * VALIDATION:
 * - Ensures exactly 4 options generated
 * - Ensures exactly 1 correct answer per drill
 * - Ensures all options are unique (no duplicates)
 * - Logs warnings if generation struggles (rare edge cases)
 *
 * USAGE:
 * ```typescript
 * // Drill A - Zhuyin Recognition
 * const optionsA = buildDrillAOptions(
 *   [['\u3112', '\u3122', '\u02CA']], // 'ㄒㄢˊ' (xian)
 *   confusionData
 * )
 *
 * // Drill B - Simplified → Traditional
 * const optionsB = buildDrillBOptions(
 *   '学',         // Simplified
 *   '學',         // Correct Traditional
 *   dictionaryEntries,
 *   confusionData
 * )
 * ```
 *
 * @module drillBuilders
 */

import type { ZhuyinSyllable, DictionaryEntry } from '../types'
import { formatZhuyinDisplay } from './zhuyin'

// =============================================================================
// CONFUSION MAPS (From confusion_maps_v1.json)
// =============================================================================

// Tone confusion: change tone mark while keeping initial/final
const TONES = ['ˉ', 'ˊ', 'ˇ', 'ˋ', '˙'] as const

// Initial consonant confusion (phonetically similar)
const CONFUSE_INITIAL: Record<string, string[]> = {
  'ㄓ': ['ㄗ', 'ㄐ'],
  'ㄗ': ['ㄓ', 'ㄘ'],
  'ㄐ': ['ㄑ', 'ㄒ', 'ㄓ'],
  'ㄑ': ['ㄐ', 'ㄒ'],
  'ㄒ': ['ㄐ', 'ㄑ'],
  'ㄉ': ['ㄊ'],
  'ㄊ': ['ㄉ'],
  'ㄌ': ['ㄋ'],
  'ㄋ': ['ㄌ'],
  'ㄍ': ['ㄎ'],
  'ㄎ': ['ㄍ'],
  'ㄅ': ['ㄆ'],
  'ㄆ': ['ㄅ']
}

// Final vowel confusion (phonetically similar)
const CONFUSE_FINAL: Record<string, string[]> = {
  'ㄢ': ['ㄤ', 'ㄣ'],
  'ㄤ': ['ㄢ', 'ㄥ'],
  'ㄣ': ['ㄥ', 'ㄢ'],
  'ㄥ': ['ㄣ', 'ㄤ'],
  'ㄚ': ['ㄛ', 'ㄜ'],
  'ㄛ': ['ㄚ', 'ㄜ'],
  'ㄜ': ['ㄚ', 'ㄛ'],
  'ㄞ': ['ㄟ'],
  'ㄟ': ['ㄞ'],
  'ㄠ': ['ㄡ'],
  'ㄡ': ['ㄠ']
}

// Traditional character visual confusion (similar shapes)
const CONFUSE_TRAD_VISUAL: Record<string, string[]> = {
  '陽': ['陰', '際', '陪', '場'],
  '陰': ['陽', '陳', '阮'],
  '見': ['現', '覺', '規', '視'],
  '現': ['見', '視', '親'],
  '燈': ['登', '澄', '橙'],
  '後': ['后', '厚', '候'],
  '著': ['者', '煮', '諸'],
  '頭': ['投', '夭', '買', '實'],
  '發': ['髮', '灋', '廢'],
  '髮': ['發', '髪', '鬆'],
  '門': ['問', '閂', '閃', '間'],
  '問': ['門', '間', '聞'],
  '媽': ['馬', '嗎', '瑪'],
  '馬': ['媽', '嗎', '碼', '罵'],
  '嗎': ['媽', '馬', '麻', '碼'],
  // Additional common characters
  '太': ['大', '犬', '夫'],
  '黑': ['墨', '點', '默'],
  '前': ['剪', '煎', '箭'],
  '光': ['先', '兄', '充'],
  '亮': ['京', '高', '諒'],
  '灯': ['丁', '打', '町'],
  '繁': ['緊', '繫', '織'],
  '體': ['禮', '體', '軆'],
  '間': ['問', '門', '聞'],
  '學': ['覺', '學', '斈'],
  '會': ['繪', '會', '曾'],
  '來': ['未', '來', '求'],
  '個': ['箇', '個', '固'],
  '們': ['門', '們', '閂']
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Deep clone an array of Zhuyin syllables
 *
 * Creates a new array with new syllable tuples to prevent mutation of original data.
 * Necessary because we modify syllables when generating drill variants.
 *
 * @param syllables - Array of ZhuyinSyllable tuples to clone
 *   - Each syllable: [initial, final, tone]
 *
 * @returns New array with cloned syllable tuples
 *
 * @example
 * ```typescript
 * const original = [['ㄒ', 'ㄢ', 'ˊ']]
 * const clone = cloneSyllables(original)
 * clone[0][2] = 'ˇ' // Modify tone
 * // original is unchanged: [['ㄒ', 'ㄢ', 'ˊ']]
 * // clone is modified:     [['ㄒ', 'ㄢ', 'ˇ']]
 * ```
 */
function cloneSyllables(syllables: ZhuyinSyllable[]): ZhuyinSyllable[] {
  return syllables.map(([ini, fin, tone]) => [ini, fin, tone] as ZhuyinSyllable)
}

/**
 * Check if two syllable arrays are identical
 *
 * Deep equality check for Zhuyin syllable arrays.
 * Used to prevent duplicate options in drill generation.
 *
 * @param a - First syllable array
 * @param b - Second syllable array
 *
 * @returns `true` if arrays are identical (same length, same syllables in order)
 *
 * @example
 * ```typescript
 * const a = [['ㄒ', 'ㄢ', 'ˊ']]
 * const b = [['ㄒ', 'ㄢ', 'ˊ']]
 * const c = [['ㄒ', 'ㄢ', 'ˇ']]
 * areSyllablesEqual(a, b) // true (identical)
 * areSyllablesEqual(a, c) // false (different tone)
 * ```
 */
function areSyllablesEqual(a: ZhuyinSyllable[], b: ZhuyinSyllable[]): boolean {
  if (a.length !== b.length) return false
  return a.every((syl, i) => {
    const [ini1, fin1, tone1] = syl
    const [ini2, fin2, tone2] = b[i]
    return ini1 === ini2 && fin1 === fin2 && tone1 === tone2
  })
}

/**
 * Shuffle array using Fisher-Yates algorithm
 *
 * Randomizes option order so correct answer isn't always in same position.
 * Creates new array (does not mutate original).
 *
 * @param array - Array to shuffle (any type)
 *
 * @returns New shuffled array (original unchanged)
 *
 * @example
 * ```typescript
 * const options = [
 *   { traditional: '學', isCorrect: true },
 *   { traditional: '覺', isCorrect: false },
 *   { traditional: '斈', isCorrect: false },
 *   { traditional: '壆', isCorrect: false }
 * ]
 * const shuffled = shuffle(options)
 * // Correct answer now in random position (not always first)
 * ```
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export { formatZhuyinDisplay as formatZhuyin } from './zhuyin'

// =============================================================================
// DRILL A: ZHUYIN RECOGNITION
// =============================================================================

export interface DrillAOption {
  zhuyin: ZhuyinSyllable[]
  display: string
  isCorrect: boolean
}

/**
 * Build Drill A options (Zhuyin recognition)
 *
 * Generates 4 unique multiple-choice options for Zhuyin pronunciation drill.
 * Uses curated confusion maps to create realistic distractors based on common
 * learner mistakes.
 *
 * ALGORITHM STRATEGY:
 * 1. Start with correct Zhuyin answer
 * 2. Generate tone variants (change last syllable tone) - MOST common confusion
 * 3. Generate initial consonant variants (swap phonetically similar consonants)
 * 4. Generate final vowel variants (swap phonetically similar vowels)
 * 5. For multi-syllable words, tweak earlier syllables if still < 4 options
 * 6. Fallback to random tone changes if confusion maps insufficient
 * 7. Shuffle and return exactly 4 options
 *
 * CONFUSION PRIORITY:
 * - **Highest:** Tone changes on last syllable (e.g., ㄒㄢˊ → ㄒㄢˇ)
 * - **Medium:** Initial consonant swaps (e.g., ㄓㄠˊ → ㄗㄠˊ)
 * - **Medium:** Final vowel swaps (e.g., ㄒㄢˊ → ㄒㄤˊ)
 * - **Lowest:** Earlier syllable changes (multi-syllable words only)
 *
 * UNIQUENESS GUARANTEE:
 * - Uses areSyllablesEqual() to prevent duplicate options
 * - Will generate up to 4 unique options (pads with duplicates if impossible, rare)
 *
 * @param correctZhuyin - The correct Zhuyin pronunciation as syllable array
 *   - Example: [['ㄒ', 'ㄢ', 'ˊ']] for "xián" (鹹)
 *   - Each syllable: [initial, final, tone]
 * @param _confusionData - Reserved for future custom confusion data (currently unused)
 *
 * @returns Array of 4 DrillAOption objects with:
 *   - `zhuyin`: ZhuyinSyllable[] (the pronunciation)
 *   - `display`: string (formatted for UI: "ㄒㄢˊ")
 *   - `isCorrect`: boolean (true for correct answer, false for distractors)
 *
 * @example
 * ```typescript
 * const options = buildDrillAOptions(
 *   [['ㄒ', 'ㄢ', 'ˊ']], // Correct: "ㄒㄢˊ" (xián)
 * )
 * // Returns 4 shuffled options:
 * // [
 * //   { zhuyin: [['ㄒ', 'ㄢ', 'ˊ']], display: "ㄒㄢˊ", isCorrect: true },
 * //   { zhuyin: [['ㄒ', 'ㄢ', 'ˇ']], display: "ㄒㄢˇ", isCorrect: false }, // Tone change
 * //   { zhuyin: [['ㄒ', 'ㄤ', 'ˊ']], display: "ㄒㄤˊ", isCorrect: false }, // Final change
 * //   { zhuyin: [['ㄑ', 'ㄢ', 'ˊ']], display: "ㄑㄢˊ", isCorrect: false }, // Initial change
 * // ]
 * ```
 *
 * @throws Never throws - Will pad with duplicates if unable to generate 4 unique options
 *   (logs console.warn in rare edge cases)
 */
export function buildDrillAOptions(
  correctZhuyin: ZhuyinSyllable[],
  _confusionData?: any
): DrillAOption[] {
  const options: ZhuyinSyllable[][] = [correctZhuyin]
  const lastIdx = correctZhuyin.length - 1
  const [lastIni, lastFin, lastTone] = correctZhuyin[lastIdx]
  
  // Strategy 1: Tone variants on last syllable (most common confusion)
  for (const tone of TONES) {
    if (tone === lastTone) continue
    
    const variant = cloneSyllables(correctZhuyin)
    variant[lastIdx] = [lastIni, lastFin, tone]
    
    if (!options.some(opt => areSyllablesEqual(opt, variant))) {
      options.push(variant)
    }
    
    if (options.length === 4) break
  }
  
  // Strategy 2: Initial consonant confusion on last syllable
  if (options.length < 4 && lastIni && CONFUSE_INITIAL[lastIni]) {
    for (const altIni of CONFUSE_INITIAL[lastIni]) {
      const variant = cloneSyllables(correctZhuyin)
      variant[lastIdx] = [altIni, lastFin, lastTone]
      
      if (!options.some(opt => areSyllablesEqual(opt, variant))) {
        options.push(variant)
      }
      
      if (options.length === 4) break
    }
  }
  
  // Strategy 3: Final vowel confusion on last syllable
  if (options.length < 4 && CONFUSE_FINAL[lastFin]) {
    for (const altFin of CONFUSE_FINAL[lastFin]) {
      const variant = cloneSyllables(correctZhuyin)
      variant[lastIdx] = [lastIni, altFin, lastTone]
      
      if (!options.some(opt => areSyllablesEqual(opt, variant))) {
        options.push(variant)
      }
      
      if (options.length === 4) break
    }
  }
  
  // Strategy 4: Multi-syllable fallback (tweak earlier syllables)
  if (options.length < 4 && correctZhuyin.length > 1) {
    for (let i = 0; i < lastIdx && options.length < 4; i++) {
      const [ini, fin, tone] = correctZhuyin[i]
      
      // Try tone changes on earlier syllables
      for (const altTone of TONES) {
        if (altTone === tone) continue
        
        const variant = cloneSyllables(correctZhuyin)
        variant[i] = [ini, fin, altTone]
        
        if (!options.some(opt => areSyllablesEqual(opt, variant))) {
          options.push(variant)
        }
        
        if (options.length === 4) break
      }
    }
  }
  
  // Strategy 5: Random tone changes if still not enough (fallback)
  if (options.length < 4) {
    const attempts = 100
    for (let attempt = 0; attempt < attempts && options.length < 4; attempt++) {
      const variant = cloneSyllables(correctZhuyin)
      const randIdx = Math.floor(Math.random() * variant.length)
      const [ini, fin, tone] = variant[randIdx]
      const randTone = TONES[Math.floor(Math.random() * TONES.length)]
      
      if (randTone !== tone) {
        variant[randIdx] = [ini, fin, randTone]
        
        if (!options.some(opt => areSyllablesEqual(opt, variant))) {
          options.push(variant)
        }
      }
    }
  }
  
  // Ensure we have exactly 4 options (pad with duplicates if needed, but this should be rare)
  while (options.length < 4) {
    console.warn('DrillA: Could not generate 4 unique options, adding duplicate')
    options.push(cloneSyllables(correctZhuyin))
  }
  
  // Shuffle and convert to option objects
  const shuffled = shuffle(options.slice(0, 4))
  return shuffled.map(zhuyin => ({
    zhuyin,
    display: formatZhuyinDisplay(zhuyin),
    isCorrect: areSyllablesEqual(zhuyin, correctZhuyin)
  }))
}

// =============================================================================
// DRILL B: SIMPLIFIED → TRADITIONAL
// =============================================================================

export interface DrillBOption {
  traditional: string
  isCorrect: boolean
}

/**
 * Build Drill B options (Simplified → Traditional mapping)
 *
 * Generates 4 unique multiple-choice options for Simplified→Traditional character drill.
 * Uses visual similarity confusion maps to create realistic distractors that look
 * similar to the correct traditional form.
 *
 * ALGORITHM STRATEGY:
 * 1. Start with correct Traditional form
 * 2. Generate single-character substitutions using visual confusion maps
 * 3. CRITICAL: Validate substitutions are NOT valid Traditional forms (prevents false negatives)
 * 4. For multi-character words, try multi-character substitutions
 * 5. Fallback to random common Traditional characters if confusion maps insufficient
 * 6. Last resort: Character swaps or appends to ensure 4 options
 * 7. Shuffle and return exactly 4 options
 *
 * FALSE NEGATIVE PREVENTION:
 * - Uses dictionaryEntries to build set of valid Traditional forms for this Simplified
 * - Rejects any distractor that matches a valid Traditional form
 * - Example: For '着' (simp), valid traditional forms are '著' and '着'
 *   - Won't use '著' as distractor if it's a valid alternative
 *
 * CONFUSION PRIORITY:
 * - **Highest:** Single-character visual substitutions (e.g., 門 → 問, 見 → 現)
 * - **Medium:** Multi-character substitutions (for longer words)
 * - **Lower:** Random common Traditional characters
 * - **Lowest:** Character swaps or appends (rare fallback)
 *
 * UNIQUENESS GUARANTEE:
 * - Uses Set to prevent duplicate options
 * - Will generate exactly 4 unique options (uses fallback strategies to ensure success)
 *
 * @param simplified - The simplified character(s) shown to user
 *   - Example: "学" (learn)
 * @param correctTraditional - The correct traditional form
 *   - Example: "學"
 * @param dictionaryEntries - All dictionary entries (used to identify valid forms)
 *   - Used to filter out valid traditional forms from distractors
 *   - Example: For "着", prevents using "著" as wrong answer
 * @param _confusionData - Reserved for future custom confusion data (currently unused)
 *
 * @returns Array of 4 DrillBOption objects with:
 *   - `traditional`: string (the traditional character(s))
 *   - `isCorrect`: boolean (true for correct answer, false for distractors)
 *
 * @example
 * ```typescript
 * const options = buildDrillBOptions(
 *   '学',  // Simplified
 *   '學',  // Correct Traditional
 *   dictionaryEntries
 * )
 * // Returns 4 shuffled options:
 * // [
 * //   { traditional: '學', isCorrect: true },  // Correct
 * //   { traditional: '覺', isCorrect: false }, // Visual similarity (見 radical)
 * //   { traditional: '斈', isCorrect: false }, // Visual similarity
 * //   { traditional: '壆', isCorrect: false }, // Visual similarity
 * // ]
 * ```
 *
 * @throws Never throws - Uses multiple fallback strategies to ensure 4 options
 *   (logs console.error if struggles, but still returns valid drill)
 */
export function buildDrillBOptions(
  simplified: string,
  correctTraditional: string,
  dictionaryEntries?: DictionaryEntry[],
  _confusionData?: any
): DrillBOption[] {
  const options = new Set<string>([correctTraditional])
  const chars = [...correctTraditional]
  
  // Build a set of all valid Traditional forms from dictionary (to avoid false positives)
  const validTraditionalForms = new Set<string>(
    dictionaryEntries?.filter(e => e.simp === simplified).map(e => e.trad) || []
  )
  
  // Strategy 1: Single-character replacements using visual confusion maps
  for (let i = 0; i < chars.length && options.size < 4; i++) {
    const char = chars[i]
    const confusions = CONFUSE_TRAD_VISUAL[char] || []
    
    for (const altChar of confusions) {
      const candidate = chars.map((c, idx) => (idx === i ? altChar : c)).join('')
      
      // Skip if it's the correct answer or a valid Traditional form
      if (candidate === correctTraditional) continue
      if (validTraditionalForms.has(candidate)) continue
      
      options.add(candidate)
      if (options.size === 4) break
    }
  }
  
  // Strategy 2: Multi-character tweaks (for longer words)
  if (options.size < 4 && chars.length > 1) {
    for (let i = 0; i < chars.length && options.size < 4; i++) {
      for (let j = i + 1; j < chars.length && options.size < 4; j++) {
        const char1 = chars[i]
        const char2 = chars[j]
        const confusions1 = CONFUSE_TRAD_VISUAL[char1] || []
        const confusions2 = CONFUSE_TRAD_VISUAL[char2] || []
        
        if (confusions1.length > 0 && confusions2.length > 0) {
          const candidate = chars
            .map((c, idx) => {
              if (idx === i) return confusions1[0]
              if (idx === j) return confusions2[0]
              return c
            })
            .join('')
          
          if (candidate !== correctTraditional && !validTraditionalForms.has(candidate)) {
            options.add(candidate)
          }
        }
      }
    }
  }
  
  // Strategy 3: Fabricate plausible but incorrect forms (fallback)
  if (options.size < 4) {
    // Use characters from confusion maps as substitutes
    const allConfusionChars = new Set<string>()
    for (const char of chars) {
      const confusions = CONFUSE_TRAD_VISUAL[char] || []
      confusions.forEach(c => allConfusionChars.add(c))
    }
    
    const confusionArray = Array.from(allConfusionChars)
    const attempts = 50
    
    for (let attempt = 0; attempt < attempts && options.size < 4; attempt++) {
      const randIdx = Math.floor(Math.random() * chars.length)
      const randChar = confusionArray[Math.floor(Math.random() * confusionArray.length)]
      
      if (!randChar) continue
      
      const candidate = chars.map((c, idx) => (idx === randIdx ? randChar : c)).join('')
      
      if (candidate !== correctTraditional && !validTraditionalForms.has(candidate)) {
        options.add(candidate)
      }
    }
  }
  
  // Strategy 4: If still not enough, swap characters within the word
  if (options.size < 4 && chars.length > 1) {
    for (let i = 0; i < chars.length - 1 && options.size < 4; i++) {
      const swapped = [...chars]
      ;[swapped[i], swapped[i + 1]] = [swapped[i + 1], swapped[i]]
      const candidate = swapped.join('')
      
      if (candidate !== correctTraditional && !validTraditionalForms.has(candidate)) {
        options.add(candidate)
      }
    }
  }
  
  // Ensure we have exactly 4 options
  const optionsArray = Array.from(options)

  // Final fallback: Use common Traditional characters as substitutes
  const commonTradChars = ['門', '見', '馬', '陽', '來', '學', '會', '後', '頭', '燈', '問', '間', '時', '話', '說', '人', '們', '個', '來', '說', '話', '裡', '這', '那', '你', '我', '他']

  let fallbackAttempts = 0
  const maxAttempts = 100

  while (optionsArray.length < 4 && fallbackAttempts < maxAttempts) {
    fallbackAttempts++

    // Strategy: Replace a random character with a common Traditional character
    const randIdx = Math.floor(Math.random() * chars.length)
    const randChar = commonTradChars[Math.floor(Math.random() * commonTradChars.length)]
    const fallback = chars.map((c, idx) => (idx === randIdx ? randChar : c)).join('')

    // Only add if unique and not correct
    if (fallback !== correctTraditional && !optionsArray.includes(fallback) && !validTraditionalForms.has(fallback)) {
      optionsArray.push(fallback)
    }
  }

  // Absolute last resort: Pad with variations if we still don't have 4
  // This ensures drill doesn't break, even if options aren't perfect
  if (optionsArray.length < 4) {
    console.error('DrillB: Could only generate', optionsArray.length, 'unique options for', correctTraditional, '- padding with variations')

    while (optionsArray.length < 4) {
      // Add character with a random common character appended/prepended
      const suffix = commonTradChars[optionsArray.length % commonTradChars.length]
      const variation = optionsArray.length % 2 === 0
        ? correctTraditional + suffix
        : suffix + correctTraditional

      if (!optionsArray.includes(variation)) {
        optionsArray.push(variation)
      } else {
        // If even that fails, just add a plausible wrong answer
        optionsArray.push(correctTraditional + '字')
        break
      }
    }
  }
  
  // Shuffle and convert to option objects
  const shuffled = shuffle(optionsArray.slice(0, 4))
  return shuffled.map(trad => ({
    traditional: trad,
    isCorrect: trad === correctTraditional
  }))
}

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Validate drill options have exactly one correct answer
 *
 * Ensures drill integrity by checking:
 * 1. Exactly 4 options present
 * 2. Exactly 1 option marked as correct
 *
 * This prevents broken drills where:
 * - Too few/many options confuse the UI
 * - Multiple correct answers make drill unsolvable
 * - No correct answer makes drill impossible
 *
 * @param options - Array of drill options (DrillAOption or DrillBOption)
 *   - Each must have `isCorrect: boolean` property
 *
 * @returns Validation result object:
 *   - `valid: true` if drill is well-formed
 *   - `valid: false, error: string` if drill is broken with description
 *
 * @example
 * ```typescript
 * const options = buildDrillAOptions([['ㄒ', 'ㄢ', 'ˊ']])
 * const result = validateDrillOptions(options)
 * if (!result.valid) {
 *   console.error('Invalid drill:', result.error)
 * }
 * ```
 */
export function validateDrillOptions<T extends { isCorrect: boolean }>(
  options: T[]
): { valid: boolean; error?: string } {
  if (options.length !== 4) {
    return { valid: false, error: `Expected 4 options, got ${options.length}` }
  }
  
  const correctCount = options.filter(opt => opt.isCorrect).length
  if (correctCount !== 1) {
    return { valid: false, error: `Expected 1 correct option, got ${correctCount}` }
  }
  
  return { valid: true }
}

/**
 * Ensure all options are unique
 *
 * Validates that drill options don't contain duplicate answers.
 * Duplicates confuse learners and reduce drill effectiveness (only 3 real choices).
 *
 * DRILL-SPECIFIC LOGIC:
 * - **Drill A (Zhuyin):** Compares formatted display strings (e.g., "ㄒㄢˊ")
 * - **Drill B (Traditional):** Compares traditional character strings (e.g., "學")
 *
 * @param options - Array of DrillAOption or DrillBOption
 *   - Type detected automatically via duck typing ('zhuyin' property check)
 *
 * @returns `true` if all options are unique, `false` if duplicates found
 *
 * @example
 * ```typescript
 * const options = buildDrillBOptions('学', '學', dictionaryEntries)
 * if (!validateUniqueness(options)) {
 *   console.warn('Drill has duplicate options!')
 * }
 * ```
 */
export function validateUniqueness(options: DrillAOption[]): boolean
export function validateUniqueness(options: DrillBOption[]): boolean
export function validateUniqueness(options: any[]): boolean {
  if (options.length === 0) return true
  
  if ('zhuyin' in options[0]) {
    // DrillA
    const displays = options.map((opt: DrillAOption) => opt.display)
    return new Set(displays).size === displays.length
  } else {
    // DrillB
    const traditionals = options.map((opt: DrillBOption) => opt.traditional)
    return new Set(traditionals).size === traditionals.length
  }
}
