// Test suite for Practice Queue Service
// Covers: Priority calculation, queue ordering, filtering

import { describe, it, expect } from 'vitest'
import { calculatePriority } from './practiceQueueService'
import type { PracticeState } from '../types'
import {
  mockPracticeStateNew,
  mockPracticeStateInProgress,
  mockPracticeStateKnown,
  mockPracticeStateStruggling,
} from '../test/mockData'

describe('practiceQueueService', () => {
  describe('calculatePriority', () => {
    it('should assign priority 1000 for never practiced (null state)', () => {
      const priority = calculatePriority(null, true)
      expect(priority).toBe(1000)
    })

    it('should assign priority 1000 for new state (never practiced)', () => {
      const priority = calculatePriority(mockPracticeStateNew, true)
      expect(priority).toBe(1000)
    })

    it('should assign priority 2000+ for struggling (consecutive misses)', () => {
      const priority = calculatePriority(mockPracticeStateStruggling, false)
      expect(priority).toBeGreaterThanOrEqual(2000)
      expect(priority).toBeLessThan(3000)
    })

    it('should assign higher priority for more consecutive misses', () => {
      const state1: PracticeState = {
        ...mockPracticeStateStruggling,
        consecutive_miss_count: 2,
        last_attempt_at: '2025-01-10T00:00:00Z',
      }
      const state2: PracticeState = {
        ...mockPracticeStateStruggling,
        consecutive_miss_count: 5,
        last_attempt_at: '2025-01-10T00:00:00Z',
      }

      const priority1 = calculatePriority(state1, false)
      const priority2 = calculatePriority(state2, false)

      // More misses = higher priority (lower number)
      expect(priority2).toBeLessThan(priority1)
    })

    it('should assign priority 3000+ for not known yet', () => {
      const priority = calculatePriority(mockPracticeStateInProgress, false)
      expect(priority).toBeGreaterThanOrEqual(3000)
      expect(priority).toBeLessThan(4000)
    })

    it('should assign priority 4000+ for known', () => {
      const priority = calculatePriority(mockPracticeStateKnown, true)
      expect(priority).toBeGreaterThanOrEqual(4000)
    })

    it('should prioritize older attempts within same tier (recency boost)', () => {
      const recentAttempt: PracticeState = {
        ...mockPracticeStateInProgress,
        last_attempt_at: '2025-01-10T00:00:00Z',
      }
      const oldAttempt: PracticeState = {
        ...mockPracticeStateInProgress,
        last_attempt_at: '2025-01-05T00:00:00Z',
      }

      const priorityRecent = calculatePriority(recentAttempt, false)
      const priorityOld = calculatePriority(oldAttempt, false)

      // Older attempt = higher priority (lower number)
      expect(priorityOld).toBeLessThan(priorityRecent)
    })

    it('should handle null last_attempt_at (never practiced)', () => {
      const state: PracticeState = {
        ...mockPracticeStateInProgress,
        last_attempt_at: null,
      }
      const priority = calculatePriority(state, false)
      // Should still calculate, treat as very old
      expect(priority).toBeGreaterThan(0)
      expect(priority).toBeLessThan(10000)
    })

    it('should maintain tier ordering despite recency', () => {
      // Old struggling item vs new known item
      const strugglingOld: PracticeState = {
        ...mockPracticeStateStruggling,
        last_attempt_at: '2025-01-01T00:00:00Z',
      }
      const knownRecent: PracticeState = {
        ...mockPracticeStateKnown,
        last_attempt_at: '2025-01-10T00:00:00Z',
      }

      const priorityStruggling = calculatePriority(strugglingOld, false)
      const priorityKnown = calculatePriority(knownRecent, true)

      // Struggling should always come before known, regardless of recency
      expect(priorityStruggling).toBeLessThan(priorityKnown)
    })

    it('should assign priority 1000 when last_attempt_at is null (truly never practiced)', () => {
      const state: PracticeState = {
        ...mockPracticeStateNew,
        last_attempt_at: null,
      }
      const priority = calculatePriority(state, false)
      expect(priority).toBe(1000)
    })
  })

  describe('Priority Tiers', () => {
    it('should maintain correct tier boundaries', () => {
      const neverPracticed = calculatePriority(null, true)
      const struggling = calculatePriority(mockPracticeStateStruggling, false)
      const notKnown = calculatePriority(mockPracticeStateInProgress, false)
      const known = calculatePriority(mockPracticeStateKnown, true)

      // Tier 1: Never practiced (1000-1999)
      expect(neverPracticed).toBeGreaterThanOrEqual(1000)
      expect(neverPracticed).toBeLessThan(2000)

      // Tier 2: Struggling (2000-2999)
      expect(struggling).toBeGreaterThanOrEqual(2000)
      expect(struggling).toBeLessThan(3000)

      // Tier 3: Not known (3000-3999)
      expect(notKnown).toBeGreaterThanOrEqual(3000)
      expect(notKnown).toBeLessThan(4000)

      // Tier 4: Known (4000+)
      expect(known).toBeGreaterThanOrEqual(4000)
    })
  })

  describe('Edge Cases', () => {
    it('should handle state with zero counts (edge case of new)', () => {
      const state: PracticeState = {
        ...mockPracticeStateNew,
        first_try_success_count: 0,
        second_try_success_count: 0,
        consecutive_miss_count: 0,
        last_attempt_at: null,
      }
      const priority = calculatePriority(state, false)
      expect(priority).toBe(1000)
    })

    it('should handle exactly 2 successes (boundary of known)', () => {
      const state: PracticeState = {
        ...mockPracticeStateNew,
        first_try_success_count: 2,
        second_try_success_count: 0,
        consecutive_miss_count: 0,
        last_attempt_at: '2025-01-05T00:00:00Z',
      }
      const priority = calculatePriority(state, true)
      expect(priority).toBeGreaterThanOrEqual(4000)
    })

    it('should handle exactly 2 consecutive misses (boundary of struggling)', () => {
      const state: PracticeState = {
        ...mockPracticeStateNew,
        first_try_success_count: 1,
        second_try_success_count: 1,
        consecutive_miss_count: 2,
        last_attempt_at: '2025-01-05T00:00:00Z',
      }
      const priority = calculatePriority(state, false)
      expect(priority).toBeGreaterThanOrEqual(2000)
      expect(priority).toBeLessThan(3000)
    })

    it('should handle very old timestamps (years ago)', () => {
      const state: PracticeState = {
        ...mockPracticeStateInProgress,
        last_attempt_at: '2020-01-01T00:00:00Z',
      }
      const priority = calculatePriority(state, false)
      // Should still be in not-known tier (3000-3999)
      expect(priority).toBeGreaterThanOrEqual(3000)
      expect(priority).toBeLessThan(4000)
      // Should have very low number within tier (older = higher priority)
      expect(priority).toBeLessThan(3100)
    })

    it('should handle future timestamps gracefully (clock skew)', () => {
      const state: PracticeState = {
        ...mockPracticeStateInProgress,
        last_attempt_at: '2030-01-01T00:00:00Z',
      }
      const priority = calculatePriority(state, false)
      // Should still be valid priority in correct tier
      expect(priority).toBeGreaterThanOrEqual(3000)
      expect(priority).toBeLessThan(4000)
    })
  })

  describe('Queue Ordering Logic', () => {
    it('should order items correctly when sorted by priority ascending', () => {
      const items = [
        { state: mockPracticeStateKnown, isKnown: true },
        { state: null, isKnown: false },
        { state: mockPracticeStateStruggling, isKnown: false },
        { state: mockPracticeStateInProgress, isKnown: false },
      ]

      const priorities = items.map(item =>
        calculatePriority(item.state, item.isKnown)
      )

      const sorted = [...priorities].sort((a, b) => a - b)

      // Expected order: never practiced, struggling, not known, known
      expect(sorted[0]).toBeLessThan(sorted[1])
      expect(sorted[1]).toBeLessThan(sorted[2])
      expect(sorted[2]).toBeLessThan(sorted[3])
    })
  })
})
