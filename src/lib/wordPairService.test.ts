// Test suite for Word Pair Service (Drill C - Word Match)
// Covers: Round generation, display data building, error handling

import { describe, it, expect } from 'vitest'
import {
  generateRound,
  buildRoundDisplayData,
  InsufficientPairsError,
  MIN_PAIRS_FOR_ROUND
} from './wordPairService'
import type { WordPairWithZhuyin } from '../types'

// =============================================================================
// MOCK DATA
// =============================================================================

const createMockPair = (
  id: string,
  word: string,
  char1: string,
  char2: string
): WordPairWithZhuyin => ({
  id,
  word,
  char1,
  char2,
  char1_zhuyin: [['ㄇ', 'ㄚ', 'ˉ']],
  char2_zhuyin: [['ㄇ', 'ㄚ', 'ˇ']],
  category: 'test'
})

// 7 pairs with unique char1 (more than MIN_PAIRS_FOR_ROUND)
const mockPairs: WordPairWithZhuyin[] = [
  createMockPair('pair-1', '妈妈', '妈', '妈'),
  createMockPair('pair-2', '爸爸', '爸', '爸'),
  createMockPair('pair-3', '哥哥', '哥', '哥'),
  createMockPair('pair-4', '姐姐', '姐', '姐'),
  createMockPair('pair-5', '弟弟', '弟', '弟'),
  createMockPair('pair-6', '妹妹', '妹', '妹'),
  createMockPair('pair-7', '奶奶', '奶', '奶'),
]

// Pairs with duplicate char1 (for testing unique selection)
const mockPairsWithDuplicateChar1: WordPairWithZhuyin[] = [
  createMockPair('pair-1', '妈妈', '妈', '妈'),
  createMockPair('pair-2', '妈咪', '妈', '咪'), // Same char1 as pair-1
  createMockPair('pair-3', '爸爸', '爸', '爸'),
  createMockPair('pair-4', '爸比', '爸', '比'), // Same char1 as pair-3
  createMockPair('pair-5', '哥哥', '哥', '哥'),
  createMockPair('pair-6', '姐姐', '姐', '姐'),
  createMockPair('pair-7', '弟弟', '弟', '弟'),
]

// Only 3 unique char1 values (insufficient for MIN_PAIRS_FOR_ROUND)
const mockPairsInsufficientUnique: WordPairWithZhuyin[] = [
  createMockPair('pair-1', '妈妈', '妈', '妈'),
  createMockPair('pair-2', '妈咪', '妈', '咪'),
  createMockPair('pair-3', '爸爸', '爸', '爸'),
  createMockPair('pair-4', '爸比', '爸', '比'),
  createMockPair('pair-5', '哥哥', '哥', '哥'),
  createMockPair('pair-6', '哥们', '哥', '们'),
]

// =============================================================================
// TESTS
// =============================================================================

describe('wordPairService', () => {
  describe('generateRound', () => {
    it('should return exactly MIN_PAIRS_FOR_ROUND pairs when enough available', () => {
      const result = generateRound(mockPairs)
      expect(result).toHaveLength(MIN_PAIRS_FOR_ROUND)
    })

    it('should return pairs with all unique char1 values', () => {
      const result = generateRound(mockPairs)
      const char1Values = result.map(p => p.char1)
      const uniqueChar1 = new Set(char1Values)

      expect(uniqueChar1.size).toBe(MIN_PAIRS_FOR_ROUND)
    })

    it('should select unique char1 even when duplicates exist in input', () => {
      const result = generateRound(mockPairsWithDuplicateChar1)
      const char1Values = result.map(p => p.char1)
      const uniqueChar1 = new Set(char1Values)

      expect(uniqueChar1.size).toBe(MIN_PAIRS_FOR_ROUND)
    })

    it('should throw InsufficientPairsError when fewer than MIN_PAIRS_FOR_ROUND unique char1s', () => {
      expect(() => generateRound(mockPairsInsufficientUnique))
        .toThrow(InsufficientPairsError)
    })

    it('should throw InsufficientPairsError with descriptive message', () => {
      try {
        generateRound(mockPairsInsufficientUnique)
        expect.fail('Expected InsufficientPairsError to be thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(InsufficientPairsError)
        expect((error as InsufficientPairsError).message).toContain('unique starting characters')
      }
    })

    it('should throw InsufficientPairsError for empty array', () => {
      expect(() => generateRound([])).toThrow(InsufficientPairsError)
    })

    it('should throw InsufficientPairsError for single element array', () => {
      expect(() => generateRound([mockPairs[0]])).toThrow(InsufficientPairsError)
    })

    it('should return different selections on multiple calls (shuffle behavior)', () => {
      // Run multiple times and check that at least one ordering differs
      const results: string[][] = []
      for (let i = 0; i < 10; i++) {
        const result = generateRound(mockPairs)
        results.push(result.map(p => p.id))
      }

      // Check if at least two results have different orderings
      const hasDifferentOrdering = results.some((result, index) => {
        if (index === 0) return false
        return result.some((id, i) => id !== results[0][i])
      })

      expect(hasDifferentOrdering).toBe(true)
    })

    it('should include all selected pairs from the input array', () => {
      const result = generateRound(mockPairs)
      const inputIds = new Set(mockPairs.map(p => p.id))

      result.forEach(pair => {
        expect(inputIds.has(pair.id)).toBe(true)
      })
    })
  })

  describe('buildRoundDisplayData', () => {
    const testPairs = mockPairs.slice(0, MIN_PAIRS_FOR_ROUND)

    it('should return correct structure with leftColumn and rightColumn', () => {
      const result = buildRoundDisplayData(testPairs)

      expect(result).toHaveProperty('leftColumn')
      expect(result).toHaveProperty('rightColumn')
      expect(result).toHaveProperty('pairs')
    })

    it('should have leftColumn with all char1 values', () => {
      const result = buildRoundDisplayData(testPairs)
      const leftChars = result.leftColumn.map(c => c.char)
      const expectedChars = testPairs.map(p => p.char1)

      expect(leftChars).toHaveLength(MIN_PAIRS_FOR_ROUND)
      expect(new Set(leftChars)).toEqual(new Set(expectedChars))
    })

    it('should have rightColumn with all char2 values', () => {
      const result = buildRoundDisplayData(testPairs)
      const rightChars = result.rightColumn.map(c => c.char)
      const expectedChars = testPairs.map(p => p.char2)

      expect(rightChars).toHaveLength(MIN_PAIRS_FOR_ROUND)
      expect(new Set(rightChars)).toEqual(new Set(expectedChars))
    })

    it('should preserve pairs in the result', () => {
      const result = buildRoundDisplayData(testPairs)
      expect(result.pairs).toEqual(testPairs)
    })

    it('should include pairId in each card for matching', () => {
      const result = buildRoundDisplayData(testPairs)

      result.leftColumn.forEach(card => {
        expect(card).toHaveProperty('pairId')
        expect(typeof card.pairId).toBe('string')
      })

      result.rightColumn.forEach(card => {
        expect(card).toHaveProperty('pairId')
        expect(typeof card.pairId).toBe('string')
      })
    })

    it('should include zhuyin in each card', () => {
      const result = buildRoundDisplayData(testPairs)

      result.leftColumn.forEach(card => {
        expect(card).toHaveProperty('zhuyin')
        expect(Array.isArray(card.zhuyin)).toBe(true)
      })

      result.rightColumn.forEach(card => {
        expect(card).toHaveProperty('zhuyin')
        expect(Array.isArray(card.zhuyin)).toBe(true)
      })
    })

    it('should shuffle columns independently (different orderings)', () => {
      // Run multiple times to verify shuffling
      const leftOrderings: string[][] = []
      const rightOrderings: string[][] = []

      for (let i = 0; i < 10; i++) {
        const result = buildRoundDisplayData(testPairs)
        leftOrderings.push(result.leftColumn.map(c => c.pairId))
        rightOrderings.push(result.rightColumn.map(c => c.pairId))
      }

      // Check left column has different orderings
      const hasDifferentLeft = leftOrderings.some((ordering, index) => {
        if (index === 0) return false
        return ordering.some((id, i) => id !== leftOrderings[0][i])
      })

      // Check right column has different orderings
      const hasDifferentRight = rightOrderings.some((ordering, index) => {
        if (index === 0) return false
        return ordering.some((id, i) => id !== rightOrderings[0][i])
      })

      expect(hasDifferentLeft).toBe(true)
      expect(hasDifferentRight).toBe(true)
    })

    it('should work with empty array input', () => {
      const result = buildRoundDisplayData([])

      expect(result.leftColumn).toHaveLength(0)
      expect(result.rightColumn).toHaveLength(0)
      expect(result.pairs).toHaveLength(0)
    })

    it('should work with single pair input', () => {
      const singlePair = [mockPairs[0]]
      const result = buildRoundDisplayData(singlePair)

      expect(result.leftColumn).toHaveLength(1)
      expect(result.rightColumn).toHaveLength(1)
      expect(result.pairs).toHaveLength(1)
      expect(result.leftColumn[0].char).toBe(mockPairs[0].char1)
      expect(result.rightColumn[0].char).toBe(mockPairs[0].char2)
    })

    it('should correctly map char1_zhuyin to left column cards', () => {
      const customPairs: WordPairWithZhuyin[] = [{
        id: 'custom-1',
        word: '学习',
        char1: '学',
        char2: '习',
        char1_zhuyin: [['ㄒ', 'ㄩㄝ', 'ˊ']],
        char2_zhuyin: [['ㄒ', 'ㄧ', 'ˊ']],
        category: 'education'
      }]

      const result = buildRoundDisplayData(customPairs)

      expect(result.leftColumn[0].zhuyin).toEqual([['ㄒ', 'ㄩㄝ', 'ˊ']])
      expect(result.rightColumn[0].zhuyin).toEqual([['ㄒ', 'ㄧ', 'ˊ']])
    })
  })

  describe('Shuffle behavior (tested indirectly)', () => {
    it('should preserve all elements after shuffle in generateRound', () => {
      // Run multiple times to verify all elements can appear
      const selectedIds = new Set<string>()

      for (let i = 0; i < 50; i++) {
        const result = generateRound(mockPairs)
        result.forEach(p => selectedIds.add(p.id))
      }

      // With 7 pairs and selecting 5, after many iterations we should see most pairs
      expect(selectedIds.size).toBeGreaterThanOrEqual(5)
    })

    it('should not modify the original input array', () => {
      const originalPairs = [...mockPairs]
      const originalIds = mockPairs.map(p => p.id)

      generateRound(mockPairs)

      // Original array should be unchanged
      expect(mockPairs.map(p => p.id)).toEqual(originalIds)
      expect(mockPairs).toHaveLength(originalPairs.length)
    })

    it('should not modify original pairs in buildRoundDisplayData', () => {
      const testPairs = mockPairs.slice(0, MIN_PAIRS_FOR_ROUND)
      const originalIds = testPairs.map(p => p.id)

      buildRoundDisplayData(testPairs)

      expect(testPairs.map(p => p.id)).toEqual(originalIds)
    })
  })

  describe('InsufficientPairsError', () => {
    it('should be an instance of Error', () => {
      const error = new InsufficientPairsError('test message')
      expect(error).toBeInstanceOf(Error)
    })

    it('should have correct name property', () => {
      const error = new InsufficientPairsError('test message')
      expect(error.name).toBe('InsufficientPairsError')
    })

    it('should preserve message', () => {
      const message = 'Not enough pairs available'
      const error = new InsufficientPairsError(message)
      expect(error.message).toBe(message)
    })
  })

  describe('Edge Cases', () => {
    it('should handle pairs with identical char1 and char2', () => {
      const identicalPairs: WordPairWithZhuyin[] = [
        createMockPair('pair-1', '妈妈', '妈', '妈'),
        createMockPair('pair-2', '爸爸', '爸', '爸'),
        createMockPair('pair-3', '哥哥', '哥', '哥'),
        createMockPair('pair-4', '姐姐', '姐', '姐'),
        createMockPair('pair-5', '弟弟', '弟', '弟'),
      ]

      const result = generateRound(identicalPairs)
      expect(result).toHaveLength(MIN_PAIRS_FOR_ROUND)
    })

    it('should handle exactly MIN_PAIRS_FOR_ROUND pairs', () => {
      const exactPairs = mockPairs.slice(0, MIN_PAIRS_FOR_ROUND)
      const result = generateRound(exactPairs)

      expect(result).toHaveLength(MIN_PAIRS_FOR_ROUND)
    })

    it('should handle pairs with empty zhuyin arrays', () => {
      const pairsWithEmptyZhuyin: WordPairWithZhuyin[] = Array(MIN_PAIRS_FOR_ROUND).fill(null).map((_, i) => ({
        id: `pair-${i}`,
        word: `word-${i}`,
        char1: String.fromCharCode(0x4E00 + i), // Unique Chinese characters
        char2: String.fromCharCode(0x4E10 + i),
        char1_zhuyin: [],
        char2_zhuyin: [],
        category: 'test'
      }))

      const result = generateRound(pairsWithEmptyZhuyin)
      expect(result).toHaveLength(MIN_PAIRS_FOR_ROUND)

      const displayData = buildRoundDisplayData(result)
      expect(displayData.leftColumn).toHaveLength(MIN_PAIRS_FOR_ROUND)
      expect(displayData.rightColumn).toHaveLength(MIN_PAIRS_FOR_ROUND)
    })

    it('should handle pairs with null category', () => {
      const pairsWithNullCategory: WordPairWithZhuyin[] = mockPairs.slice(0, MIN_PAIRS_FOR_ROUND).map(p => ({
        ...p,
        category: null
      }))

      const result = generateRound(pairsWithNullCategory)
      expect(result).toHaveLength(MIN_PAIRS_FOR_ROUND)
    })
  })
})
