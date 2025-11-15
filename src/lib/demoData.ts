/**
 * Demo data for signed-out user experience
 * Provides realistic sample data to showcase app features
 */

import type { Entry, Reading, DictionaryEntry } from '../types'
import { DRILLS } from '../types'

/**
 * Sample entries for demo mode
 * Selected to showcase different features:
 * - Simple characters (你好)
 * - Multi-pronunciation (了)
 * - Identical forms (太)
 * - Common HSK vocabulary
 */
export const DEMO_ENTRIES: Entry[] = [
  {
    id: 'demo-entry-1',
    owner_id: 'demo-user',
    kid_id: 'demo-kid',
    simp: '你',
    trad: '你',
    type: 'char',
    applicable_drills: [DRILLS.ZHUYIN],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'demo-entry-2',
    owner_id: 'demo-user',
    kid_id: 'demo-kid',
    simp: '好',
    trad: '好',
    type: 'char',
    applicable_drills: [DRILLS.ZHUYIN],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'demo-entry-3',
    owner_id: 'demo-user',
    kid_id: 'demo-kid',
    simp: '学',
    trad: '學',
    type: 'char',
    applicable_drills: [DRILLS.ZHUYIN, DRILLS.TRAD],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'demo-entry-4',
    owner_id: 'demo-user',
    kid_id: 'demo-kid',
    simp: '阳',
    trad: '陽',
    type: 'char',
    applicable_drills: [DRILLS.ZHUYIN, DRILLS.TRAD],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'demo-entry-5',
    owner_id: 'demo-user',
    kid_id: 'demo-kid',
    simp: '中',
    trad: '中',
    type: 'char',
    applicable_drills: [DRILLS.ZHUYIN],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'demo-entry-6',
    owner_id: 'demo-user',
    kid_id: 'demo-kid',
    simp: '国',
    trad: '國',
    type: 'char',
    applicable_drills: [DRILLS.ZHUYIN, DRILLS.TRAD],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'demo-entry-7',
    owner_id: 'demo-user',
    kid_id: 'demo-kid',
    simp: '人',
    trad: '人',
    type: 'char',
    applicable_drills: [DRILLS.ZHUYIN],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'demo-entry-8',
    owner_id: 'demo-user',
    kid_id: 'demo-kid',
    simp: '大',
    trad: '大',
    type: 'char',
    applicable_drills: [DRILLS.ZHUYIN],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'demo-entry-9',
    owner_id: 'demo-user',
    kid_id: 'demo-kid',
    simp: '小',
    trad: '小',
    type: 'char',
    applicable_drills: [DRILLS.ZHUYIN],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'demo-entry-10',
    owner_id: 'demo-user',
    kid_id: 'demo-kid',
    simp: '爱',
    trad: '愛',
    type: 'char',
    applicable_drills: [DRILLS.ZHUYIN, DRILLS.TRAD],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
]

/**
 * Corresponding readings for demo entries
 */
export const DEMO_READINGS: Reading[] = [
  {
    id: 'demo-reading-1',
    entry_id: 'demo-entry-1',
    zhuyin: [['ㄋ', 'ㄧ', 'ˇ']],
    pinyin: 'nǐ',
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'demo-reading-2',
    entry_id: 'demo-entry-2',
    zhuyin: [['ㄏ', 'ㄠ', 'ˇ']],
    pinyin: 'hǎo',
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'demo-reading-3',
    entry_id: 'demo-entry-3',
    zhuyin: [['ㄒ', 'ㄩㄝ', 'ˊ']],
    pinyin: 'xué',
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'demo-reading-4',
    entry_id: 'demo-entry-4',
    zhuyin: [['ㄧ', 'ㄤ', 'ˊ']],
    pinyin: 'yáng',
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'demo-reading-5',
    entry_id: 'demo-entry-5',
    zhuyin: [['ㄓ', 'ㄨㄥ', 'ˉ']],
    pinyin: 'zhōng',
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'demo-reading-6',
    entry_id: 'demo-entry-6',
    zhuyin: [['ㄍ', 'ㄨㄛ', 'ˊ']],
    pinyin: 'guó',
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'demo-reading-7',
    entry_id: 'demo-entry-7',
    zhuyin: [['ㄖ', 'ㄣ', 'ˊ']],
    pinyin: 'rén',
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'demo-reading-8',
    entry_id: 'demo-entry-8',
    zhuyin: [['ㄉ', 'ㄚ', 'ˋ']],
    pinyin: 'dà',
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'demo-reading-9',
    entry_id: 'demo-entry-9',
    zhuyin: [['ㄒ', 'ㄧㄠ', 'ˇ']],
    pinyin: 'xiǎo',
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'demo-reading-10',
    entry_id: 'demo-entry-10',
    zhuyin: [['ㄞ', '', 'ˋ']],
    pinyin: 'ài',
    created_at: '2025-01-01T00:00:00Z',
  },
]

/**
 * Sample dashboard metrics for demo mode
 * Realistic values to showcase app features
 */
export const DEMO_METRICS = {
  totalCharacters: 47,
  knownCountDrillA: 18,
  knownCountDrillB: 12,
  weeklyFamiliarity: 15.5,
  currentBelt: 'White Belt',
  accuracyDrillA: 0.82,
  accuracyDrillB: 0.71,
  practiceStreak: 5,
  totalPracticeSessions: 23,
}

/**
 * Sample dictionary entry for Dictionary tab demo
 */
export const DEMO_DICTIONARY_ENTRY: DictionaryEntry = {
  id: 'demo-dict-1',
  simp: '学',
  trad: '學',
  zhuyin: [['ㄒ', 'ㄩㄝ', 'ˊ']],
  pinyin: 'xué',
  frequency_rank: 45,
  meanings: ['to study', 'to learn', 'school'],
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
}
