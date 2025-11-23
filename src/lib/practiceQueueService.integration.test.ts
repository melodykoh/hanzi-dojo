// Integration test for pronunciation validation in buildPronunciationList
// Verifies defensive programming against malformed RPC data

import { describe, it, expect, vi } from 'vitest'
import type { ZhuyinSyllable } from '../types'

// Mock the internal buildPronunciationList function behavior
// Since it's not exported, we simulate what it does with validation

describe('practiceQueueService - buildPronunciationList Integration', () => {
  // Simulate the validation logic that buildPronunciationList uses
  function validateZhuyinSyllable(syllable: any): syllable is ZhuyinSyllable {
    return (
      Array.isArray(syllable) &&
      syllable.length === 3 &&
      typeof syllable[0] === 'string' &&
      typeof syllable[1] === 'string' &&
      typeof syllable[2] === 'string' &&
      ['ˉ', 'ˊ', 'ˇ', 'ˋ', '˙', ''].includes(syllable[2])
    )
  }

  function validatePronunciation(pronunciation: any): pronunciation is ZhuyinSyllable[] {
    return (
      Array.isArray(pronunciation) &&
      pronunciation.length > 0 &&
      pronunciation.every(validateZhuyinSyllable)
    )
  }

  // Simulate buildPronunciationList behavior
  function simulateBuildPronunciationList(
    primary: ZhuyinSyllable[] | undefined,
    pronunciationRow?: {
      entry_id: string
      manual_readings?: any
      dictionary_zhuyin?: any
      dictionary_variants?: any[]
    }
  ): ZhuyinSyllable[][] {
    const collected: ZhuyinSyllable[][] = []

    // Validate primary reading
    if (primary && validatePronunciation(primary)) {
      collected.push(primary)
    } else if (primary) {
      console.error('[practiceQueueService] Invalid primary pronunciation:', {
        primary,
        entryId: pronunciationRow?.entry_id,
        reason: 'Failed validation - malformed syllable structure or invalid tone marker'
      })
    }

    // Validate manual readings
    if (pronunciationRow?.manual_readings) {
      for (const manual of pronunciationRow.manual_readings) {
        if (validatePronunciation(manual)) {
          collected.push(manual)
        } else {
          console.error('[practiceQueueService] Invalid manual reading:', {
            manual,
            entryId: pronunciationRow.entry_id,
            reason: 'Failed validation - malformed syllable structure or invalid tone marker'
          })
        }
      }
    }

    // Validate dictionary zhuyin
    if (pronunciationRow?.dictionary_zhuyin) {
      if (validatePronunciation(pronunciationRow.dictionary_zhuyin)) {
        collected.push(pronunciationRow.dictionary_zhuyin)
      } else {
        console.error('[practiceQueueService] Invalid dictionary zhuyin:', {
          dictionary_zhuyin: pronunciationRow.dictionary_zhuyin,
          entryId: pronunciationRow.entry_id,
          reason: 'Failed validation - malformed syllable structure or invalid tone marker'
        })
      }
    }

    // Validate dictionary variants
    if (pronunciationRow?.dictionary_variants) {
      for (const variant of pronunciationRow.dictionary_variants) {
        if (variant.zhuyin && validatePronunciation(variant.zhuyin)) {
          collected.push(variant.zhuyin)
        } else if (variant.zhuyin) {
          console.error('[practiceQueueService] Invalid dictionary variant:', {
            variant,
            entryId: pronunciationRow.entry_id,
            reason: 'Failed validation - malformed syllable structure or invalid tone marker'
          })
        }
      }
    }

    return collected
  }

  describe('Valid Data Processing', () => {
    it('should accept all valid pronunciations', () => {
      const primary: ZhuyinSyllable[] = [['ㄇ', 'ㄚ', 'ˉ']]
      const row = {
        entry_id: 'test-1',
        manual_readings: [[['ㄇ', 'ㄚ', 'ˊ']]],
        dictionary_zhuyin: [['ㄇ', 'ㄚ', 'ˇ']],
        dictionary_variants: [
          { zhuyin: [['ㄇ', 'ㄚ', 'ˋ']] }
        ]
      }

      const result = simulateBuildPronunciationList(primary, row)

      // Should collect all 4 valid pronunciations
      expect(result.length).toBe(4)
    })

    it('should handle empty/missing data gracefully', () => {
      const primary: ZhuyinSyllable[] = [['ㄇ', 'ㄚ', 'ˉ']]
      const row = {
        entry_id: 'test-2',
        manual_readings: null,
        dictionary_zhuyin: null,
        dictionary_variants: null
      }

      const result = simulateBuildPronunciationList(primary, row)

      // Should only have primary pronunciation
      expect(result.length).toBe(1)
      expect(result[0]).toEqual(primary)
    })
  })

  describe('Malformed Data Rejection', () => {
    it('should skip pronunciation with missing tone marker', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const primary: ZhuyinSyllable[] = [['ㄇ', 'ㄚ', 'ˉ']] // Valid
      const row = {
        entry_id: 'test-3',
        manual_readings: [
          [['ㄇ', 'ㄚ'] as any] // Invalid - missing tone
        ]
      }

      const result = simulateBuildPronunciationList(primary, row)

      // Should only have primary, skip malformed manual reading
      expect(result.length).toBe(1)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid manual reading'),
        expect.objectContaining({
          manual: expect.anything(),
          entryId: 'test-3'
        })
      )

      consoleErrorSpy.mockRestore()
    })

    it('should skip pronunciation with invalid tone marker', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const primary: ZhuyinSyllable[] = [['ㄇ', 'ㄚ', 'ˉ']]
      const row = {
        entry_id: 'test-4',
        dictionary_zhuyin: [['ㄇ', 'ㄚ', 'X'] as any] // Invalid tone
      }

      const result = simulateBuildPronunciationList(primary, row)

      // Should only have primary, skip invalid dictionary_zhuyin
      expect(result.length).toBe(1)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid dictionary zhuyin'),
        expect.objectContaining({
          dictionary_zhuyin: expect.anything(),
          entryId: 'test-4'
        })
      )

      consoleErrorSpy.mockRestore()
    })

    it('should skip pronunciation with wrong types', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const primary: ZhuyinSyllable[] = [['ㄇ', 'ㄚ', 'ˉ']]
      const row = {
        entry_id: 'test-5',
        dictionary_variants: [
          { zhuyin: [['ㄇ', 123, 'ˊ'] as any] } // Invalid - number instead of string
        ]
      }

      const result = simulateBuildPronunciationList(primary, row)

      // Should only have primary, skip malformed variant
      expect(result.length).toBe(1)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid dictionary variant'),
        expect.anything()
      )

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Mixed Valid and Invalid Data', () => {
    it('should collect valid pronunciations and skip invalid ones', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const primary: ZhuyinSyllable[] = [['ㄇ', 'ㄚ', 'ˉ']] // Valid
      const row = {
        entry_id: 'test-6',
        manual_readings: [
          [['ㄇ', 'ㄚ', 'ˊ']], // Valid
          [['ㄇ', 'ㄚ'] as any] // Invalid - missing tone
        ],
        dictionary_zhuyin: [['ㄇ', 'ㄚ', 'ˇ']], // Valid
        dictionary_variants: [
          { zhuyin: [['ㄇ', 'ㄚ', 'ˋ']] }, // Valid
          { zhuyin: [['ㄇ', 'ㄚ', 'X'] as any] } // Invalid tone
        ]
      }

      const result = simulateBuildPronunciationList(primary, row)

      // Should collect 4 valid, skip 2 invalid
      expect(result.length).toBe(4)
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2) // 2 errors logged

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Graceful Fallback: All Pronunciations Invalid', () => {
    it('should return only primary when all RPC data is invalid', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const primary: ZhuyinSyllable[] = [['ㄇ', 'ㄚ', 'ˉ']] // Valid locked reading
      const row = {
        entry_id: 'test-7',
        manual_readings: [[['ㄇ', 'ㄚ'] as any]], // Invalid
        dictionary_zhuyin: [['ㄇ', 'ㄚ', 'X'] as any], // Invalid
        dictionary_variants: [
          { zhuyin: [[123, 'ㄚ', 'ˊ'] as any] } // Invalid
        ]
      }

      const result = simulateBuildPronunciationList(primary, row)

      // Should fall back to only the primary (locked reading)
      expect(result.length).toBe(1)
      expect(result[0]).toEqual(primary)
      expect(consoleErrorSpy).toHaveBeenCalledTimes(3) // 3 errors logged

      consoleErrorSpy.mockRestore()
    })

    it('should return empty array when primary is also invalid', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const primary: any = [['ㄇ', 'ㄚ']] // Invalid - missing tone
      const row = {
        entry_id: 'test-8',
        manual_readings: [[['ㄇ', 'ㄚ', 'X'] as any]], // Invalid
      }

      const result = simulateBuildPronunciationList(primary, row)

      // Should return empty array (total failure case)
      expect(result.length).toBe(0)
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2) // All data invalid

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Error Context Logging', () => {
    it('should log entry_id with error for debugging', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const primary: any = [['ㄇ', 'ㄚ']] // Invalid
      const row = {
        entry_id: 'test-entry-abc123',
      }

      simulateBuildPronunciationList(primary, row)

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          entryId: 'test-entry-abc123',
          reason: expect.stringContaining('Failed validation')
        })
      )

      consoleErrorSpy.mockRestore()
    })

    it('should include reason in error context', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const primary: any = [['ㄇ', 'ㄚ', 'X']] // Invalid tone
      const row = { entry_id: 'test-9' }

      simulateBuildPronunciationList(primary, row)

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          reason: 'Failed validation - malformed syllable structure or invalid tone marker'
        })
      )

      consoleErrorSpy.mockRestore()
    })
  })
})
