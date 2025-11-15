/**
 * Static demo data for unauthenticated users
 * Shows sample progress data without requiring signup
 */

import type { DictionaryEntry, BeltRank } from '../types'

/**
 * Demo metrics structure for unauthenticated users
 * Mirrors real metrics from DashboardMetrics component
 */
interface DemoMetrics {
  /** Total number of characters in the study list */
  totalCharacters: number
  /** Count of known characters for Drill A (Zhuyin Recognition) */
  knownCountDrillA: number
  /** Count of known characters for Drill B (Simplified to Traditional) */
  knownCountDrillB: number
  /** Familiarity points gained in the current week */
  weeklyFamiliarity: number
  /** Current belt rank based on familiarity progression */
  currentBelt: BeltRank
  /** Accuracy rate for Drill A (0.0 - 1.0) */
  accuracyDrillA: number
  /** Accuracy rate for Drill B (0.0 - 1.0) */
  accuracyDrillB: number
  /** Number of consecutive days with practice sessions */
  practiceStreak: number
}

/**
 * Sample dashboard metrics for demo mode
 * Static values to showcase app features without backend data
 */
export const DEMO_METRICS: DemoMetrics = {
  totalCharacters: 47,
  knownCountDrillA: 18,
  knownCountDrillB: 12,
  weeklyFamiliarity: 15.5,
  currentBelt: 'white',
  accuracyDrillA: 0.82,
  accuracyDrillB: 0.71,
  practiceStreak: 5,
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
