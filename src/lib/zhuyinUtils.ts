// Hanzi Dojo - Zhuyin Utility Functions
// Shared utilities for pronunciation serialization and manipulation

import type { ZhuyinSyllable } from '../types'

/**
 * Serialize Zhuyin pronunciation to string for comparison/deduplication.
 *
 * Format: "{initial}|{final}|{tone};{initial}|{final}|{tone};..."
 *
 * @example
 * serializePronunciation([['ㄒ', 'ㄢ', 'ˊ']]) // "ㄒ|ㄢ|ˊ"
 * serializePronunciation([['', 'ㄨㄟ', 'ˊ']]) // "|ㄨㄟ|ˊ" (empty initial for vowel-initial)
 */
export function serializePronunciation(zhuyin: ZhuyinSyllable[]): string {
  return zhuyin.map(([ini, fin, tone]) => `${ini}|${fin}|${tone}`).join(';')
}

/**
 * Deserialize Zhuyin pronunciation string back to syllable array.
 *
 * @example
 * deserializePronunciation("ㄒ|ㄢ|ˊ") // [['ㄒ', 'ㄢ', 'ˊ']]
 */
export function deserializePronunciation(serialized: string): ZhuyinSyllable[] {
  return serialized.split(';').map(syllable => {
    const [ini, fin, tone] = syllable.split('|')
    return [ini, fin, tone] as ZhuyinSyllable
  })
}
