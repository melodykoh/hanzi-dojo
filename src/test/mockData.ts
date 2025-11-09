// Mock data for testing
import type { Entry, Reading, PracticeState, DictionaryEntry } from '../types'

export const mockEntry: Entry = {
  id: 'test-entry-1',
  owner_id: 'test-user-1',
  kid_id: 'test-kid-1',
  simp: '阳',
  trad: '陽',
  type: 'char',
  applicable_drills: ['zhuyin', 'trad'],
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
}

export const mockEntryIdenticalForms: Entry = {
  id: 'test-entry-2',
  owner_id: 'test-user-1',
  kid_id: 'test-kid-1',
  simp: '太',
  trad: '太',
  type: 'char',
  applicable_drills: ['zhuyin'],
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
}

export const mockReading: Reading = {
  id: 'test-reading-1',
  entry_id: 'test-entry-1',
  zhuyin: [['ㄧ', 'ㄤ', 'ˊ']],
  pinyin: 'yáng',
  created_at: '2025-01-01T00:00:00Z',
}

export const mockReadingMulti: Reading = {
  id: 'test-reading-2',
  entry_id: 'test-entry-multi',
  zhuyin: [['ㄓ', 'ㄠ', 'ˊ']],
  pinyin: 'zháo',
  created_at: '2025-01-01T00:00:00Z',
}

export const mockPracticeStateNew: PracticeState = {
  id: 'test-state-1',
  kid_id: 'test-kid-1',
  entry_id: 'test-entry-1',
  drill: 'zhuyin',
  first_try_success_count: 0,
  second_try_success_count: 0,
  consecutive_miss_count: 0,
  last_attempt_at: null,
  last_success_at: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
}

export const mockPracticeStateInProgress: PracticeState = {
  id: 'test-state-2',
  kid_id: 'test-kid-1',
  entry_id: 'test-entry-1',
  drill: 'zhuyin',
  first_try_success_count: 1,
  second_try_success_count: 0,
  consecutive_miss_count: 0,
  last_attempt_at: '2025-01-02T00:00:00Z',
  last_success_at: '2025-01-02T00:00:00Z',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-02T00:00:00Z',
}

export const mockPracticeStateKnown: PracticeState = {
  id: 'test-state-3',
  kid_id: 'test-kid-1',
  entry_id: 'test-entry-1',
  drill: 'zhuyin',
  first_try_success_count: 2,
  second_try_success_count: 1,
  consecutive_miss_count: 0,
  last_attempt_at: '2025-01-03T00:00:00Z',
  last_success_at: '2025-01-03T00:00:00Z',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-03T00:00:00Z',
}

export const mockPracticeStateStruggling: PracticeState = {
  id: 'test-state-4',
  kid_id: 'test-kid-1',
  entry_id: 'test-entry-1',
  drill: 'zhuyin',
  first_try_success_count: 1,
  second_try_success_count: 1,
  consecutive_miss_count: 2,
  last_attempt_at: '2025-01-04T00:00:00Z',
  last_success_at: '2025-01-02T00:00:00Z',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-04T00:00:00Z',
}

export const mockDictionaryEntry: DictionaryEntry = {
  id: 'dict-1',
  simp: '阳',
  trad: '陽',
  zhuyin: [['ㄧ', 'ㄤ', 'ˊ']],
  pinyin: 'yáng',
  frequency_rank: 450,
  meanings: ['sun', 'positive', 'male principle'],
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
}

export const mockDictionaryEntryMulti: DictionaryEntry = {
  id: 'dict-2',
  simp: '着',
  trad: '著',
  zhuyin: [['ㄓ', 'ㄠ', 'ˊ']],
  pinyin: 'zháo',
  frequency_rank: 100,
  meanings: ['to touch', 'to feel'],
  zhuyin_variants: [
    {
      zhuyin: [['ㄓ', 'ㄠ', 'ˊ']],
      pinyin: 'zháo',
      sense: 'to touch; to feel',
      context_words: ['着急'],
    },
    {
      zhuyin: [['ㄓ', 'ㄨㄛ', 'ˊ']],
      pinyin: 'zhuó',
      sense: 'to apply; to attach',
      context_words: ['着手'],
    },
    {
      zhuyin: [['˙ㄓ', 'ㄜ', '']],
      pinyin: 'zhe',
      sense: 'particle indicating action in progress',
      context_words: ['跟着'],
    },
  ],
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
}
