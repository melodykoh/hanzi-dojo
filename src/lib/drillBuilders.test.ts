// Test suite for Drill Builders
// Covers: Option generation, validation, confusion logic

import { describe, it, expect } from 'vitest'
import { buildDrillAOptions, buildDrillBOptions } from './drillBuilders'
import { mockEntry, mockReading, mockReadingMulti } from '../test/mockData'
import type { ZhuyinSyllable } from '../types'

const buildZhuyinOptions = (
  reading = mockReading,
  valid: ZhuyinSyllable[][] = []
) => buildDrillAOptions(reading.zhuyin, valid)

const buildTraditionalOptions = (entry = mockEntry) =>
  buildDrillBOptions(entry.simp, entry.trad)

describe('drillBuilders', () => {
  describe('buildZhuyinOptions', () => {
    it('should generate exactly 4 unique options', () => {
      const options = buildZhuyinOptions()
      expect(options).toHaveLength(4)

      // Check uniqueness
      const uniqueOptions = new Set(options.map(opt => JSON.stringify(opt.zhuyin)))
      expect(uniqueOptions.size).toBe(4)
    })

    it('should include the correct answer', () => {
      const options = buildZhuyinOptions()
      const correctAnswer = options.find(opt => opt.isCorrect)

      expect(correctAnswer).toBeDefined()
      expect(correctAnswer?.zhuyin).toEqual(mockReading.zhuyin)
    })

    it('should have exactly one correct answer', () => {
      const options = buildZhuyinOptions()
      const correctCount = options.filter(opt => opt.isCorrect).length

      expect(correctCount).toBe(1)
    })

    it('should generate different options on multiple calls (randomness)', () => {
      const options1 = buildZhuyinOptions()
      const options2 = buildZhuyinOptions()

      // Options should be in different order (or have different distractors)
      const order1 = options1.map(opt => JSON.stringify(opt.zhuyin))
      const order2 = options2.map(opt => JSON.stringify(opt.zhuyin))

      // At least one should be different (very high probability with shuffling)
      const isDifferent = order1.some((opt, i) => opt !== order2[i])
      expect(isDifferent).toBe(true)
    })

    it('should omit first-tone marker in display text', () => {
      const firstToneReading = {
        ...mockReading,
        zhuyin: [['ㄇ', 'ㄚ', 'ˉ']]
      }

      const options = buildZhuyinOptions(firstToneReading)
      const correct = options.find(opt => opt.isCorrect)

      expect(correct?.display).toContain('ㄇㄚ')
      expect(correct?.display).not.toContain('ˉ')
    })

    it('should handle multi-syllable zhuyin', () => {
      const multiReading = { ...mockReadingMulti }
      const options = buildZhuyinOptions(multiReading)

      expect(options).toHaveLength(4)
      const correctAnswer = options.find(opt => opt.isCorrect)
      expect(correctAnswer?.zhuyin).toEqual(multiReading.zhuyin)
    })

    it('should create plausible distractors (not random garbage)', () => {
      const options = buildZhuyinOptions()
      const distractors = options.filter(opt => !opt.isCorrect)

      // Each distractor should have same number of syllables as correct answer
      distractors.forEach(distractor => {
        expect(distractor.zhuyin.length).toBe(mockReading.zhuyin.length)
      })

      // Each distractor should have valid syllable structure [initial, final, tone]
      distractors.forEach(distractor => {
        distractor.zhuyin.forEach(syllable => {
          expect(syllable).toHaveLength(3)
          expect(typeof syllable[0]).toBe('string') // initial
          expect(typeof syllable[1]).toBe('string') // final
          expect(typeof syllable[2]).toBe('string') // tone
        })
      })
    })
  })

  describe('buildTraditionalOptions', () => {
    it('should generate exactly 4 unique options', () => {
      const options = buildTraditionalOptions(mockEntry)
      expect(options).toHaveLength(4)

      // Check uniqueness
      const uniqueOptions = new Set(options.map(opt => opt.traditional))
      expect(uniqueOptions.size).toBe(4)
    })

    it('should include the correct answer', () => {
      const options = buildTraditionalOptions(mockEntry)
      const correctAnswer = options.find(opt => opt.isCorrect)

      expect(correctAnswer).toBeDefined()
      expect(correctAnswer?.traditional).toBe(mockEntry.trad)
    })

    it('should have exactly one correct answer', () => {
      const options = buildTraditionalOptions(mockEntry)
      const correctCount = options.filter(opt => opt.isCorrect).length

      expect(correctCount).toBe(1)
    })

    it('should generate different options on multiple calls (randomness)', () => {
      const options1 = buildTraditionalOptions(mockEntry)
      const options2 = buildTraditionalOptions(mockEntry)

      // Options should be in different order (or have different distractors)
      const order1 = options1.map(opt => opt.traditional)
      const order2 = options2.map(opt => opt.traditional)

      // At least one should be different (very high probability with shuffling)
      const isDifferent = order1.some((opt, i) => opt !== order2[i])
      expect(isDifferent).toBe(true)
    })

    it('should create distractors with same length as correct answer', () => {
      const options = buildTraditionalOptions(mockEntry)
      const distractors = options.filter(opt => !opt.isCorrect)

      distractors.forEach(distractor => {
        expect(distractor.traditional.length).toBe(mockEntry.trad.length)
      })
    })

    it('should not include simplified form as distractor', () => {
      const options = buildTraditionalOptions(mockEntry)
      const hasSimplifiedDistractor = options.some(
        opt => !opt.isCorrect && opt.traditional === mockEntry.simp
      )

      // If simp and trad are different, simplified should not appear as distractor
      if (mockEntry.simp !== mockEntry.trad) {
        expect(hasSimplifiedDistractor).toBe(false)
      }
    })
  })

  describe('Option Validation', () => {
    it('should not have duplicate options (Zhuyin)', () => {
      const options = buildZhuyinOptions()
      const serialized = options.map(opt => JSON.stringify(opt.zhuyin))
      const unique = new Set(serialized)

      expect(unique.size).toBe(options.length)
    })

    it('should not have duplicate options (Traditional)', () => {
      const options = buildTraditionalOptions(mockEntry)
      const traditionals = options.map(opt => opt.traditional)
      const unique = new Set(traditionals)

      expect(unique.size).toBe(options.length)
    })

    it('should always have correct answer present (Zhuyin)', () => {
      // Run 10 times to ensure consistency
      for (let i = 0; i < 10; i++) {
        const options = buildZhuyinOptions()
        const hasCorrect = options.some(opt => opt.isCorrect)
        expect(hasCorrect).toBe(true)
      }
    })

    it('should always have correct answer present (Traditional)', () => {
      // Run 10 times to ensure consistency
      for (let i = 0; i < 10; i++) {
        const options = buildTraditionalOptions(mockEntry)
        const hasCorrect = options.some(opt => opt.isCorrect)
        expect(hasCorrect).toBe(true)
      }
    })
  })

  describe('Edge Cases', () => {
    it('should handle single-character entries (Zhuyin)', () => {
      const singleChar = { ...mockEntry, simp: '太', trad: '太' }
      const singleReading = { ...mockReading, zhuyin: [['ㄊ', 'ㄞ', 'ˋ']] }

      const options = buildZhuyinOptions(singleReading)
      expect(options).toHaveLength(4)
      expect(options.filter(opt => opt.isCorrect)).toHaveLength(1)
    })

    it('should handle single-character entries (Traditional)', () => {
      const singleChar = { ...mockEntry, simp: '阳', trad: '陽' }
      const options = buildTraditionalOptions(singleChar)

      expect(options).toHaveLength(4)
      expect(options.filter(opt => opt.isCorrect)).toHaveLength(1)
    })

    it('should handle multi-character entries (Traditional)', () => {
      const multiChar = { ...mockEntry, simp: '学校', trad: '學校' }
      const options = buildTraditionalOptions(multiChar)

      expect(options).toHaveLength(4)
      const correctAnswer = options.find(opt => opt.isCorrect)
      expect(correctAnswer?.traditional).toBe('學校')
    })

    it('should handle entries with complex zhuyin (multiple syllables)', () => {
      const complexReading = {
        ...mockReading,
        zhuyin: [
          ['ㄒ', 'ㄩㄝ', 'ˊ'],
          ['ㄒ', 'ㄧㄠ', 'ˋ'],
        ],
      }
      const options = buildZhuyinOptions(complexReading)

      expect(options).toHaveLength(4)
      const correctAnswer = options.find(opt => opt.isCorrect)
      expect(correctAnswer?.zhuyin).toEqual(complexReading.zhuyin)
    })
  })

  describe('Distractor Quality', () => {
    it('should not use correct answer as distractor (Zhuyin)', () => {
      const options = buildZhuyinOptions()
      const distractors = options.filter(opt => !opt.isCorrect)

      distractors.forEach(distractor => {
        const isSameAsCorrect = JSON.stringify(distractor.zhuyin) === JSON.stringify(mockReading.zhuyin)
        expect(isSameAsCorrect).toBe(false)
      })
    })

    it('should exclude alternate valid pronunciations from distractors', () => {
      const alternatePronunciation = [['ㄎ', 'ㄜ', 'ˋ']]
      const baseReading = { ...mockReading, zhuyin: [['ㄎ', 'ㄜ', 'ˇ']] }
      const options = buildZhuyinOptions(baseReading, [alternatePronunciation])

      const containsAlternate = options.some(opt =>
        !opt.isCorrect && JSON.stringify(opt.zhuyin) === JSON.stringify(alternatePronunciation)
      )

      expect(containsAlternate).toBe(false)
    })

    it('should not use correct answer as distractor (Traditional)', () => {
      const options = buildTraditionalOptions(mockEntry)
      const distractors = options.filter(opt => !opt.isCorrect)

      distractors.forEach(distractor => {
        expect(distractor.traditional).not.toBe(mockEntry.trad)
      })
    })

    it('should generate tone variants as distractors (Zhuyin)', () => {
      const options = buildZhuyinOptions()
      const correctTone = mockReading.zhuyin[0][2]

      // At least one distractor should have different tone on same syllable
      const hasToneVariant = options.some(opt => {
        if (opt.isCorrect) return false
        return opt.zhuyin[0][0] === mockReading.zhuyin[0][0] && // same initial
               opt.zhuyin[0][1] === mockReading.zhuyin[0][1] && // same final
               opt.zhuyin[0][2] !== correctTone // different tone
      })

      expect(hasToneVariant).toBe(true)
    })
  })

  describe('Edge Cases - Fallback Pronunciations', () => {
    it('should use fallback pronunciations when valid pronunciations consume confusion space', () => {
      // Edge case: Character with many valid pronunciations that exhaust confusion maps
      // Base: ㄉㄜˊ with all tone variants + initial confusion + final confusion blocked
      const baseReading = [['ㄉ', 'ㄜ', 'ˊ']]
      const manyVariants = [
        [['ㄉ', 'ㄜ', 'ˉ']],  // Valid alternate 1 (tone variant - 1st tone)
        [['ㄉ', 'ㄜ', 'ˇ']],  // Valid alternate 2 (tone variant - 3rd tone)
        [['ㄉ', 'ㄜ', 'ˋ']],  // Valid alternate 3 (tone variant - 4th tone)
        [['ㄉ', 'ㄜ', '˙']],  // Valid alternate 4 (tone variant - neutral)
        [['ㄊ', 'ㄜ', 'ˊ']],  // Valid alternate 5 (initial confusion: ㄉ→ㄊ)
        [['ㄉ', 'ㄚ', 'ˊ']],  // Valid alternate 6 (final confusion: ㄜ→ㄚ)
        [['ㄉ', 'ㄛ', 'ˊ']],  // Valid alternate 7 (final confusion: ㄜ→ㄛ)
      ]

      const options = buildZhuyinOptions({ zhuyin: baseReading }, manyVariants)

      // Should still generate 4 options
      expect(options).toHaveLength(4)

      // Should not contain any valid variants as distractors
      const variantKeys = new Set([
        JSON.stringify(baseReading),
        ...manyVariants.map(v => JSON.stringify(v))
      ])

      const distractors = options.filter(opt => !opt.isCorrect)
      distractors.forEach(distractor => {
        expect(variantKeys.has(JSON.stringify(distractor.zhuyin))).toBe(false)
      })

      // At least one distractor should be from FALLBACK_PRONUNCIATIONS
      // (verifies fallback logic was triggered when confusion maps exhausted)
      const hasUnrelatedDistractor = distractors.some(opt =>
        opt.zhuyin[0][0] !== 'ㄉ' && opt.zhuyin[0][0] !== 'ㄊ'
      )
      expect(hasUnrelatedDistractor).toBe(true)
    })

    it('should handle character with all confusion map variants as valid alternates', () => {
      // Extreme edge case: All confusion map entries are valid pronunciations
      const baseReading = [['ㄓ', 'ㄠ', 'ˊ']]
      const exhaustiveVariants = [
        [['ㄓ', 'ㄠ', 'ˉ']],  // Tone variant 1
        [['ㄓ', 'ㄠ', 'ˇ']],  // Tone variant 2
        [['ㄓ', 'ㄠ', 'ˋ']],  // Tone variant 3
        [['ㄓ', 'ㄠ', '˙']],  // Tone variant 4
        [['ㄗ', 'ㄠ', 'ˊ']],  // Initial confusion variant 1
        [['ㄐ', 'ㄠ', 'ˊ']],  // Initial confusion variant 2
      ]

      const options = buildZhuyinOptions({ zhuyin: baseReading }, exhaustiveVariants)

      expect(options).toHaveLength(4)
      expect(options.filter(opt => opt.isCorrect)).toHaveLength(1)

      // All distractors must be from FALLBACK_PRONUNCIATIONS
      const distractors = options.filter(opt => !opt.isCorrect)
      expect(distractors.length).toBe(3)
    })

    it('should not duplicate fallback pronunciations as distractors', () => {
      // Verify FALLBACK_PRONUNCIATIONS are unique and don't appear multiple times
      const baseReading = [['ㄅ', 'ㄚ', 'ˊ']]
      const variants = [
        [['ㄅ', 'ㄚ', 'ˉ']],
        [['ㄅ', 'ㄚ', 'ˇ']],
        [['ㄅ', 'ㄚ', 'ˋ']],
      ]

      const options = buildZhuyinOptions({ zhuyin: baseReading }, variants)

      // All options should be unique
      const serialized = options.map(opt => JSON.stringify(opt.zhuyin))
      const unique = new Set(serialized)
      expect(unique.size).toBe(4)
    })
  })

  describe('Regression: Issue #20 - Merged Zhuyin Bug', () => {
    it('should display single readings per button, not merged pronunciations', () => {
      // Bug: Characters like 只 were showing "ㄓ ㄓˇ" merged options
      // Root cause: Parameter ordering passed allValidPronunciations to wrong position
      const baseReading = [['ㄓ', '', 'ˇ']] // zhǐ - 只 (only)
      const alternateReading = [['ㄓ', '', 'ˉ']] // zhī - 只 (classifier)

      const options = buildZhuyinOptions({ zhuyin: baseReading }, [alternateReading])

      // Each option should have exactly one pronunciation (not merged)
      options.forEach(opt => {
        // Display should not contain multiple space-separated readings
        expect(opt.display).not.toMatch(/\s+/)
        // Zhuyin array should have consistent structure
        expect(opt.zhuyin).toHaveLength(1)
        expect(opt.zhuyin[0]).toHaveLength(3)
      })
    })

    it('should not show alternate valid pronunciations as wrong distractors', () => {
      // For 只 (zhǐ/zhī), if user is practicing zhǐ, zhī should NOT appear as wrong answer
      const baseReading = [['ㄓ', '', 'ˇ']] // zhǐ
      const alternateReading = [['ㄓ', '', 'ˉ']] // zhī (valid alternate)

      const options = buildZhuyinOptions({ zhuyin: baseReading }, [alternateReading])

      // The alternate pronunciation should not appear as a distractor
      const distractors = options.filter(opt => !opt.isCorrect)
      const hasAlternateAsDistractor = distractors.some(opt =>
        JSON.stringify(opt.zhuyin) === JSON.stringify(alternateReading)
      )

      expect(hasAlternateAsDistractor).toBe(false)
    })

    it('should correctly handle 可 with multiple valid pronunciations', () => {
      // 可 has pronunciations kě (ㄎㄜˇ) and kè (ㄎㄜˋ)
      const baseReading = [['ㄎ', 'ㄜ', 'ˇ']] // kě
      const alternateReading = [['ㄎ', 'ㄜ', 'ˋ']] // kè

      const options = buildZhuyinOptions({ zhuyin: baseReading }, [alternateReading])

      expect(options).toHaveLength(4)
      expect(options.filter(opt => opt.isCorrect)).toHaveLength(1)

      // Neither the correct nor alternate should appear as distractors
      const distractors = options.filter(opt => !opt.isCorrect)
      distractors.forEach(d => {
        expect(JSON.stringify(d.zhuyin)).not.toBe(JSON.stringify(baseReading))
        expect(JSON.stringify(d.zhuyin)).not.toBe(JSON.stringify(alternateReading))
      })
    })

    it('should handle 几 with tone variants correctly', () => {
      // 几 has pronunciations jǐ (ㄐㄧˇ) and jī (ㄐㄧˉ)
      const baseReading = [['ㄐ', 'ㄧ', 'ˇ']] // jǐ (how many)
      const alternateReading = [['ㄐ', 'ㄧ', 'ˉ']] // jī (small table)

      const options = buildZhuyinOptions({ zhuyin: baseReading }, [alternateReading])

      // Should generate 4 unique options
      expect(options).toHaveLength(4)
      const uniqueDisplays = new Set(options.map(opt => opt.display))
      expect(uniqueDisplays.size).toBe(4)

      // Alternate reading should not be a distractor
      const alternateKey = JSON.stringify(alternateReading)
      const hasAlternate = options.some(opt =>
        !opt.isCorrect && JSON.stringify(opt.zhuyin) === alternateKey
      )
      expect(hasAlternate).toBe(false)
    })
  })
})
