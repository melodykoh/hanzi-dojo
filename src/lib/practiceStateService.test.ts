// Test suite for Practice State Service
// Covers: Scoring logic, familiarity calculations, known status computation

import { describe, it, expect } from 'vitest'
import { DRILLS } from '../types'
import {
  computeFamiliarity,
  isDrillKnown,
  computeKnownStatus,
  computeTotalFamiliarity,
  computeAccuracyRate,
} from './practiceStateService'
import {
  mockPracticeStateNew,
  mockPracticeStateInProgress,
  mockPracticeStateKnown,
  mockPracticeStateStruggling,
  mockEntry,
  mockEntryIdenticalForms,
} from '../test/mockData'
import type { PracticeState } from '../types'

describe('practiceStateService', () => {
  describe('computeFamiliarity', () => {
    it('should return 0 for new state (never practiced)', () => {
      const result = computeFamiliarity(mockPracticeStateNew)
      expect(result).toBe(0)
    })

    it('should calculate 1.0 for first-try success', () => {
      const state: PracticeState = {
        ...mockPracticeStateNew,
        first_try_success_count: 1,
        second_try_success_count: 0,
      }
      const result = computeFamiliarity(state)
      expect(result).toBe(1.0)
    })

    it('should calculate 0.5 for second-try success', () => {
      const state: PracticeState = {
        ...mockPracticeStateNew,
        first_try_success_count: 0,
        second_try_success_count: 1,
      }
      const result = computeFamiliarity(state)
      expect(result).toBe(0.5)
    })

    it('should calculate correct total for mixed successes', () => {
      const state: PracticeState = {
        ...mockPracticeStateNew,
        first_try_success_count: 3,
        second_try_success_count: 2,
      }
      const result = computeFamiliarity(state)
      // 3 * 1.0 + 2 * 0.5 = 4.0
      expect(result).toBe(4.0)
    })

    it('should handle null state', () => {
      const result = computeFamiliarity(null)
      expect(result).toBe(0)
    })
  })

  describe('isDrillKnown', () => {
    it('should return false for new state (never practiced)', () => {
      const result = isDrillKnown(mockPracticeStateNew)
      expect(result).toBe(false)
    })

    it('should return false for in-progress state (1 success)', () => {
      const result = isDrillKnown(mockPracticeStateInProgress)
      expect(result).toBe(false)
    })

    it('should return true for known state (2+ successes, <2 misses)', () => {
      const result = isDrillKnown(mockPracticeStateKnown)
      expect(result).toBe(true)
    })

    it('should return false for struggling state (2+ consecutive misses)', () => {
      const result = isDrillKnown(mockPracticeStateStruggling)
      expect(result).toBe(false)
    })

    it('should return true for 2 first-try successes exactly', () => {
      const state: PracticeState = {
        ...mockPracticeStateNew,
        first_try_success_count: 2,
        second_try_success_count: 0,
        consecutive_miss_count: 0,
      }
      const result = isDrillKnown(state)
      expect(result).toBe(true)
    })

    it('should return true for 1 first-try + 1 second-try success', () => {
      const state: PracticeState = {
        ...mockPracticeStateNew,
        first_try_success_count: 1,
        second_try_success_count: 1,
        consecutive_miss_count: 0,
      }
      const result = isDrillKnown(state)
      expect(result).toBe(true)
    })

    it('should return true for 4 second-try successes (2+ total)', () => {
      const state: PracticeState = {
        ...mockPracticeStateNew,
        first_try_success_count: 0,
        second_try_success_count: 4,
        consecutive_miss_count: 0,
      }
      const result = isDrillKnown(state)
      expect(result).toBe(true)
    })

    it('should return false for 5 successes but 2 consecutive misses (demotion)', () => {
      const state: PracticeState = {
        ...mockPracticeStateNew,
        first_try_success_count: 5,
        second_try_success_count: 0,
        consecutive_miss_count: 2,
      }
      const result = isDrillKnown(state)
      expect(result).toBe(false)
    })

    it('should return true for 1 consecutive miss (not demoted yet)', () => {
      const state: PracticeState = {
        ...mockPracticeStateNew,
        first_try_success_count: 2,
        second_try_success_count: 0,
        consecutive_miss_count: 1,
      }
      const result = isDrillKnown(state)
      expect(result).toBe(true)
    })

    it('should handle null state as not known', () => {
      const result = isDrillKnown(null)
      expect(result).toBe(false)
    })
  })

  describe('computeKnownStatus', () => {
    it('should return isKnown: false for entry with no practice states', () => {
      const result = computeKnownStatus(mockEntry, [])
      expect(result.isKnown).toBe(false)
      expect(result.drillStatuses).toHaveLength(2) // zhuyin, trad
    })

    it('should require all applicable drills to be known', () => {
      const zhuyinKnown: PracticeState = {
        ...mockPracticeStateKnown,
        drill: DRILLS.ZHUYIN,
      }
      const tradNotKnown: PracticeState = {
        ...mockPracticeStateInProgress,
        drill: DRILLS.TRAD,
      }
      const result = computeKnownStatus(mockEntry, [zhuyinKnown, tradNotKnown])
      expect(result.isKnown).toBe(false)
    })

    it('should return isKnown: true when all applicable drills are known', () => {
      const zhuyinKnown: PracticeState = {
        ...mockPracticeStateKnown,
        drill: DRILLS.ZHUYIN,
      }
      const tradKnown: PracticeState = {
        ...mockPracticeStateKnown,
        drill: DRILLS.TRAD,
      }
      const result = computeKnownStatus(mockEntry, [zhuyinKnown, tradKnown])
      expect(result.isKnown).toBe(true)
    })

    it('should handle entry with single applicable drill (identical forms)', () => {
      const zhuyinKnown: PracticeState = {
        ...mockPracticeStateKnown,
        drill: DRILLS.ZHUYIN,
      }
      const result = computeKnownStatus(mockEntryIdenticalForms, [zhuyinKnown])
      expect(result.isKnown).toBe(true)
      expect(result.drillStatuses).toHaveLength(1) // only zhuyin
    })

    it('should provide detailed drill statuses', () => {
      const zhuyinKnown: PracticeState = {
        ...mockPracticeStateKnown,
        drill: DRILLS.ZHUYIN,
        first_try_success_count: 3,
        second_try_success_count: 1,
        consecutive_miss_count: 0,
      }
      const result = computeKnownStatus(mockEntry, [zhuyinKnown])
      const zhuyinStatus = result.drillStatuses.find(d => d.drill === DRILLS.ZHUYIN)

      expect(zhuyinStatus).toBeDefined()
      expect(zhuyinStatus?.isKnown).toBe(true)
      expect(zhuyinStatus?.totalSuccesses).toBe(4)
      expect(zhuyinStatus?.consecutiveMisses).toBe(0)
    })
  })

  describe('computeTotalFamiliarity', () => {
    it('should return 0 for empty practice states', () => {
      const result = computeTotalFamiliarity([])
      expect(result).toBe(0)
    })

    it('should sum familiarity across all states', () => {
      const states: PracticeState[] = [
        { ...mockPracticeStateNew, first_try_success_count: 2, second_try_success_count: 1 }, // 2.5
        { ...mockPracticeStateNew, first_try_success_count: 1, second_try_success_count: 2 }, // 2.0
        { ...mockPracticeStateNew, first_try_success_count: 3, second_try_success_count: 0 }, // 3.0
      ]
      const result = computeTotalFamiliarity(states)
      // 2.5 + 2.0 + 3.0 = 7.5
      expect(result).toBe(7.5)
    })

    it('should round to 1 decimal place', () => {
      const states: PracticeState[] = [
        { ...mockPracticeStateNew, first_try_success_count: 1, second_try_success_count: 1 }, // 1.5
        { ...mockPracticeStateNew, first_try_success_count: 0, second_try_success_count: 1 }, // 0.5
      ]
      const result = computeTotalFamiliarity(states)
      expect(result).toBe(2.0)
    })
  })

  describe('computeAccuracyRate', () => {
    it('should return 0 for empty practice states', () => {
      const result = computeAccuracyRate([])
      expect(result).toBe(0)
    })

    it('should calculate 100% for all first-try successes', () => {
      const states: PracticeState[] = [
        { ...mockPracticeStateNew, first_try_success_count: 3, second_try_success_count: 0 },
      ]
      const result = computeAccuracyRate(states)
      expect(result).toBe(100)
    })

    it('should calculate accuracy correctly for mixed results', () => {
      const states: PracticeState[] = [
        {
          ...mockPracticeStateNew,
          first_try_success_count: 3, // 3 correct
          second_try_success_count: 2, // 2 correct (after 2 wrong first attempts)
          consecutive_miss_count: 0,
        },
      ]
      // Total attempts: 3 + 2*2 = 7 (first tries + second tries count as 2 attempts each)
      // Correct: 3 + 2 = 5
      // Actually, let me reconsider: if first_try_success = 3, that's 3 attempts total
      // if second_try_success = 2, that's 2 items that failed first try (2 attempts) + 2 successful second tries = 4 attempts
      // Total: 3 + 4 = 7 attempts
      // Correct: 3 + 2 = 5
      // Accuracy: 5/7 = 71.43%
      const result = computeAccuracyRate(states)
      expect(result).toBeCloseTo(71.43, 1)
    })

    it('should handle zero attempts (return 0)', () => {
      const states: PracticeState[] = [mockPracticeStateNew]
      const result = computeAccuracyRate(states)
      expect(result).toBe(0)
    })

    it('should round to 1 decimal place', () => {
      const states: PracticeState[] = [
        {
          ...mockPracticeStateNew,
          first_try_success_count: 2,
          second_try_success_count: 1,
        },
      ]
      const result = computeAccuracyRate(states)
      // Total attempts: 2 + 2 = 4
      // Correct: 2 + 1 = 3
      // 3/4 = 75%
      expect(result).toBe(75)
    })
  })

  describe('Edge Cases', () => {
    it('should handle very large success counts', () => {
      const state: PracticeState = {
        ...mockPracticeStateNew,
        first_try_success_count: 1000,
        second_try_success_count: 500,
      }
      const familiarity = computeFamiliarity(state)
      expect(familiarity).toBe(1250) // 1000 * 1.0 + 500 * 0.5

      const known = isDrillKnown(state)
      expect(known).toBe(true)
    })

    it('should handle entry with empty applicable_drills array', () => {
      const entry = { ...mockEntry, applicable_drills: [] }
      const result = computeKnownStatus(entry, [])
      expect(result.isKnown).toBe(false)
      expect(result.drillStatuses).toHaveLength(0)
    })

    it('should handle mismatched practice states (states for non-applicable drills)', () => {
      const zhuyinKnown: PracticeState = {
        ...mockPracticeStateKnown,
        drill: 'zhuyin',
      }
      // Entry only has zhuyin applicable, but we pass a trad state too
      const tradState: PracticeState = {
        ...mockPracticeStateKnown,
        drill: 'trad',
      }
      const result = computeKnownStatus(mockEntryIdenticalForms, [zhuyinKnown, tradState])
      expect(result.drillStatuses).toHaveLength(1) // only zhuyin counted
      expect(result.isKnown).toBe(true)
    })
  })
})
