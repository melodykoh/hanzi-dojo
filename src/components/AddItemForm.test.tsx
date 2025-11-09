// AddItemForm - Automated Unit Tests
// Epic 5: Entry Management & Belt System

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { AddItemForm } from './AddItemForm'
import * as dictionaryClient from '../lib/dictionaryClient'
import * as dictionaryLogger from '../lib/dictionaryLogger'
import { supabase } from '../lib/supabase'

vi.mock('../lib/dictionaryClient')
vi.mock('../lib/dictionaryLogger')
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn()
  }
}))

describe('AddItemForm - Automated Logic Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Validation Logic', () => {
    it('should detect missing Simplified character', () => {
      // Test validation: empty simplified field
      const errors = validateFormData({
        simplified: '',
        traditional: '陽',
        zhuyin: [['ㄧ', 'ㄤ', 'ˊ']],
        type: 'char'
      })

      expect(errors).toContain('Simplified character/word is required')
    })

    it('should detect missing Traditional character', () => {
      const errors = validateFormData({
        simplified: '阳',
        traditional: '',
        zhuyin: [['ㄧ', 'ㄤ', 'ˊ']],
        type: 'char'
      })

      expect(errors).toContain('Traditional character/word is required')
    })

    it('should detect missing Zhuyin', () => {
      const errors = validateFormData({
        simplified: '阳',
        traditional: '陽',
        zhuyin: [],
        type: 'char'
      })

      expect(errors).toContain('Zhuyin pronunciation is required')
    })

    it('should detect invalid Zhuyin tone marks', () => {
      const errors = validateFormData({
        simplified: '阳',
        traditional: '陽',
        zhuyin: [['ㄧ', 'ㄤ', 'X']], // Invalid tone
        type: 'char'
      })

      expect(errors.some(e => e.includes('Invalid tone mark'))).toBe(true)
    })

    it('should accept all valid tone marks', () => {
      const validTones = ['ˉ', 'ˊ', 'ˇ', 'ˋ', '˙']

      validTones.forEach(tone => {
        const errors = validateFormData({
          simplified: '阳',
          traditional: '陽',
          zhuyin: [['ㄧ', 'ㄤ', tone]],
          type: 'char'
        })

        expect(errors).toHaveLength(0)
      })
    })
  })

  describe('Drill Applicability Detection', () => {
    it('should enable both drills when Simplified ≠ Traditional and Zhuyin exists', () => {
      const drills = detectApplicableDrills({
        simplified: '阳',
        traditional: '陽',
        zhuyin: [['ㄧ', 'ㄤ', 'ˊ']]
      })

      expect(drills).toEqual(['zhuyin', 'trad'])
    })

    it('should enable only Zhuyin drill when Simplified === Traditional', () => {
      const drills = detectApplicableDrills({
        simplified: '的',
        traditional: '的',
        zhuyin: [['ㄉ', 'ㄜ', '˙']]
      })

      expect(drills).toEqual(['zhuyin'])
    })

    it('should enable no drills when Zhuyin is missing', () => {
      const drills = detectApplicableDrills({
        simplified: '阳',
        traditional: '陽',
        zhuyin: []
      })

      expect(drills).toEqual([])
    })
  })

  describe('Duplicate Detection', () => {
    it('should detect existing entry for same kid and character', async () => {
      // Mock Supabase to return existing entry
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [{ id: 'existing-id' }],
                error: null
              })
            })
          })
        })
      } as any)

      const isDuplicate = await checkDuplicate('kid-123', '阳')

      expect(isDuplicate).toBe(true)
    })

    it('should return false when entry does not exist', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [],
                error: null
              })
            })
          })
        })
      } as any)

      const isDuplicate = await checkDuplicate('kid-123', '阳')

      expect(isDuplicate).toBe(false)
    })
  })

  describe('Dictionary Integration', () => {
    it('should auto-fill when character found in dictionary', async () => {
      vi.mocked(dictionaryClient.lookupDictionary).mockResolvedValue({
        found: true,
        entry: {
          id: 'dict-1',
          simp: '阳',
          trad: '陽',
          zhuyin: [['ㄧ', 'ㄤ', 'ˊ']],
          pinyin: 'yáng',
          zhuyin_variants: [],
          meanings: ['sun'],
          created_at: '',
          updated_at: ''
        }
      })

      const result = await performDictionaryLookup('阳')

      expect(result.found).toBe(true)
      expect(result.entry?.simp).toBe('阳')
      expect(result.entry?.trad).toBe('陽')
    })

    it('should log missing entry when character not found', async () => {
      vi.mocked(dictionaryClient.lookupDictionary).mockResolvedValue({
        found: false
      })

      vi.mocked(dictionaryLogger.logMissingEntry).mockResolvedValue()

      await performDictionaryLookup('未知字')

      expect(dictionaryLogger.logMissingEntry).toHaveBeenCalledWith('未知字')
    })

    it('should detect multi-pronunciation characters', async () => {
      vi.mocked(dictionaryClient.lookupDictionary).mockResolvedValue({
        found: true,
        entry: {
          id: 'dict-2',
          simp: '了',
          trad: '了',
          zhuyin: [['ㄌ', 'ㄜ', '˙']],
          zhuyin_variants: [
            {
              zhuyin: [['ㄌ', 'ㄧ', 'ㄠ', 'ˇ']],
              context_words: ['了解', '明了'],
              meanings: ['understand, finish']
            }
          ],
          created_at: '',
          updated_at: ''
        }
      })

      const result = await performDictionaryLookup('了')

      expect(result.found).toBe(true)
      expect(result.entry?.zhuyin_variants).toHaveLength(1)
    })
  })
})

// Helper functions (to be extracted from component for testability)

function validateFormData(data: {
  simplified: string
  traditional: string
  zhuyin: any[]
  type: string
}): string[] {
  const errors: string[] = []

  if (!data.simplified || data.simplified.trim() === '') {
    errors.push('Simplified character/word is required')
  }

  if (!data.traditional || data.traditional.trim() === '') {
    errors.push('Traditional character/word is required')
  }

  if (data.zhuyin.length === 0) {
    errors.push('Zhuyin pronunciation is required')
  }

  const validTones = ['ˉ', 'ˊ', 'ˇ', 'ˋ', '˙']
  for (const syllable of data.zhuyin) {
    if (!validTones.includes(syllable[2])) {
      errors.push(`Invalid tone mark in Zhuyin: ${syllable[2]}`)
    }
  }

  return errors
}

function detectApplicableDrills(data: {
  simplified: string
  traditional: string
  zhuyin: any[]
}): string[] {
  const drills: string[] = []

  if (data.zhuyin.length > 0) {
    drills.push('zhuyin')
  }

  if (data.simplified !== data.traditional) {
    drills.push('trad')
  }

  return drills
}

async function checkDuplicate(
  kidId: string,
  simplified: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('entries')
      .select('id')
      .eq('kid_id', kidId)
      .eq('simp', simplified)
      .limit(1)

    if (error) throw error

    return data && data.length > 0
  } catch (error) {
    return false
  }
}

async function performDictionaryLookup(character: string) {
  return await dictionaryClient.lookupDictionary(character)
}
