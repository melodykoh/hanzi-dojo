// Validation Layer - Pronunciation and Zhuyin structure validation
// Extracted from practiceQueueService.ts to separate validation concerns

import type { ZhuyinSyllable } from '../types'

/**
 * Validate Zhuyin syllable structure.
 * Each syllable must be [initial, final, tone] with valid tone marker.
 *
 * @param syllable - The syllable to validate
 * @returns true if syllable is valid ZhuyinSyllable structure
 */
export function validateZhuyinSyllable(syllable: any): syllable is ZhuyinSyllable {
  return (
    Array.isArray(syllable) &&
    syllable.length === 3 &&
    typeof syllable[0] === 'string' &&  // initial (can be empty)
    typeof syllable[1] === 'string' &&  // final
    typeof syllable[2] === 'string' &&  // tone
    ['ˉ', 'ˊ', 'ˇ', 'ˋ', '˙', ''].includes(syllable[2]) // valid tones
  )
}

/**
 * Validate complete pronunciation (array of syllables).
 *
 * @param pronunciation - The pronunciation to validate
 * @returns true if pronunciation is valid array of ZhuyinSyllables
 */
export function validatePronunciation(pronunciation: any): pronunciation is ZhuyinSyllable[] {
  return (
    Array.isArray(pronunciation) &&
    pronunciation.length > 0 &&
    pronunciation.every(validateZhuyinSyllable)
  )
}
