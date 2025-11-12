import type { ZhuyinSyllable } from '../types'

const FIRST_TONE_MARK = 'ˉ'

export function formatZhuyinDisplay(syllables: ZhuyinSyllable[]): string {
  return syllables
    .map(([initial, final, tone]) => `${initial}${final}${tone === FIRST_TONE_MARK ? '' : tone}`)
    .join(' ')
    .trim()
}
