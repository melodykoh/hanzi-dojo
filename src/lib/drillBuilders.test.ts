// Test suite for Drill Builders
// Covers: Option generation, validation, confusion logic

import { describe, it, expect } from 'vitest'
import { buildZhuyinOptions, buildTraditionalOptions } from './drillBuilders'
import { mockEntry, mockReading, mockReadingMulti } from '../test/mockData'

describe('drillBuilders', () => {
  describe('buildZhuyinOptions', () => {
    it('should generate exactly 4 unique options', () => {
      const options = buildZhuyinOptions(mockEntry, mockReading)
      expect(options).toHaveLength(4)

      // Check uniqueness
      const uniqueOptions = new Set(options.map(opt => JSON.stringify(opt.zhuyin)))
      expect(uniqueOptions.size).toBe(4)
    })

    it('should include the correct answer', () => {
      const options = buildZhuyinOptions(mockEntry, mockReading)
      const correctAnswer = options.find(opt => opt.isCorrect)

      expect(correctAnswer).toBeDefined()
      expect(correctAnswer?.zhuyin).toEqual(mockReading.zhuyin)
    })

    it('should have exactly one correct answer', () => {
      const options = buildZhuyinOptions(mockEntry, mockReading)
      const correctCount = options.filter(opt => opt.isCorrect).length

      expect(correctCount).toBe(1)
    })

    it('should generate different options on multiple calls (randomness)', () => {
      const options1 = buildZhuyinOptions(mockEntry, mockReading)
      const options2 = buildZhuyinOptions(mockEntry, mockReading)

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

      const options = buildZhuyinOptions(mockEntry, firstToneReading)
      const correct = options.find(opt => opt.isCorrect)

      expect(correct?.display).toContain('ㄇㄚ')
      expect(correct?.display).not.toContain('ˉ')
    })

    it('should handle multi-syllable zhuyin', () => {
      const multiReading = { ...mockReadingMulti }
      const options = buildZhuyinOptions(mockEntry, multiReading)

      expect(options).toHaveLength(4)
      const correctAnswer = options.find(opt => opt.isCorrect)
      expect(correctAnswer?.zhuyin).toEqual(multiReading.zhuyin)
    })

    it('should create plausible distractors (not random garbage)', () => {
      const options = buildZhuyinOptions(mockEntry, mockReading)
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
      const options = buildZhuyinOptions(mockEntry, mockReading)
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
        const options = buildZhuyinOptions(mockEntry, mockReading)
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

      const options = buildZhuyinOptions(singleChar, singleReading)
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
      const options = buildZhuyinOptions(mockEntry, complexReading)

      expect(options).toHaveLength(4)
      const correctAnswer = options.find(opt => opt.isCorrect)
      expect(correctAnswer?.zhuyin).toEqual(complexReading.zhuyin)
    })
  })

  describe('Distractor Quality', () => {
    it('should not use correct answer as distractor (Zhuyin)', () => {
      const options = buildZhuyinOptions(mockEntry, mockReading)
      const distractors = options.filter(opt => !opt.isCorrect)

      distractors.forEach(distractor => {
        const isSameAsCorrect = JSON.stringify(distractor.zhuyin) === JSON.stringify(mockReading.zhuyin)
        expect(isSameAsCorrect).toBe(false)
      })
    })

    it('should not use correct answer as distractor (Traditional)', () => {
      const options = buildTraditionalOptions(mockEntry)
      const distractors = options.filter(opt => !opt.isCorrect)

      distractors.forEach(distractor => {
        expect(distractor.traditional).not.toBe(mockEntry.trad)
      })
    })

    it('should generate tone variants as distractors (Zhuyin)', () => {
      const options = buildZhuyinOptions(mockEntry, mockReading)
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
})
