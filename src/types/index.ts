// Hanzi Dojo Type Definitions

export type EntryType = 'char' | 'word'

export const DRILLS = {
  ZHUYIN: 'zhuyin',
  TRAD: 'trad',
  WORD_MATCH: 'word_match',
} as const

export type PracticeDrill = typeof DRILLS[keyof typeof DRILLS]

export type BeltRank = 'white' | 'yellow' | 'green' | 'blue' | 'red' | 'black'

// Zhuyin syllable structure: [initial, final, tone]
// Example: 媽 = [["ㄇ", "ㄚ", "ˉ"]]
export type ZhuyinSyllable = [string, string, string]

export interface Kid {
  id: string
  owner_id: string
  name: string
  belt_rank: BeltRank
  created_at: string
  updated_at: string
}

export interface Entry {
  id: string
  owner_id: string
  kid_id: string
  simp: string
  trad: string
  type: EntryType
  locked_reading_id?: string
  applicable_drills: PracticeDrill[]
  grade_label?: string
  school_week?: string
  created_at: string
  updated_at: string
}

export interface Reading {
  id: string
  entry_id: string
  zhuyin: ZhuyinSyllable[]
  pinyin?: string
  sense?: string
  context_words?: string[]
  audio_url?: string
  created_at: string
}

export interface PracticeState {
  id: string
  kid_id: string
  entry_id: string
  drill: PracticeDrill
  first_try_success_count: number
  second_try_success_count: number
  consecutive_miss_count: number
  last_attempt_at?: string
  last_success_at?: string
  created_at: string
  updated_at: string
}

export interface PracticeEvent {
  id: string
  kid_id: string
  entry_id: string | null
  drill: PracticeDrill
  attempt_index: 1 | 2
  is_correct: boolean
  points_awarded: 0 | 0.5 | 1.0
  chosen_option?: unknown
  created_at: string
}

export interface DictionaryEntry {
  id: string
  simp: string
  trad: string
  zhuyin: ZhuyinSyllable[]
  pinyin?: string
  zhuyin_variants?: ZhuyinVariant[]
  meanings?: string[]
  frequency_rank?: number
  created_at: string
  updated_at: string
}

export interface ZhuyinVariant {
  zhuyin: ZhuyinSyllable[]
  pinyin?: string
  context_words?: string[]
  meanings?: string[]
}

export interface DictionaryConfusion {
  id: string
  entry_id: string
  drill: PracticeDrill
  confusions: unknown
  created_at: string
}

export interface DictionaryMissing {
  id: string
  simp: string
  trad?: string
  zhuyin?: ZhuyinSyllable[]
  pinyin?: string
  reported_by: string
  created_at: string
}

// Dictionary Lookup Result (for RPC responses)
export interface DictionaryLookupResult {
  found: boolean
  entry?: DictionaryEntry
  confusions?: {
    zhuyin?: unknown
    trad?: unknown
  }
}

// Word Pairs (Drill C: Word Match)
export interface WordPair {
  id: string
  word: string
  char1: string
  char2: string
  category?: string
  created_at: string
}

export interface WordPairWithZhuyin {
  id: string
  word: string
  char1: string
  char1_zhuyin: ZhuyinSyllable[]
  char2: string
  char2_zhuyin: ZhuyinSyllable[]
  category: string | null
}

export interface WordMatchRoundData {
  leftColumn: WordMatchCard[]
  rightColumn: WordMatchCard[]
  pairs: WordPairWithZhuyin[]
}

export interface WordMatchCard {
  pairId: string
  char: string
  zhuyin: ZhuyinSyllable[]
}
