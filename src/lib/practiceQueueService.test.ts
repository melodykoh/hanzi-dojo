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
      const result = calculatePriority(null)
      expect(result.priority).toBe(1000)
      expect(result.reason).toBe('Never practiced')
    })

    it('should assign "not known" tier for new state with zero successes', () => {
      // mockPracticeStateNew has last_attempt_at: null but is a valid state object
      // So it goes through the algorithm and lands in "not known" tier
      const result = calculatePriority(mockPracticeStateNew)
      expect(result.priority).toBeGreaterThanOrEqual(3000)
      expect(result.reason).toContain('Not known')
    })

    it('should assign struggling tier for consecutive misses', () => {
      const result = calculatePriority(mockPracticeStateStruggling)
      // Struggling tier starts at 2000, but recency adds to it
      expect(result.priority).toBeGreaterThanOrEqual(2000)
      expect(result.reason).toContain('Struggling')
      expect(result.reason).toContain('consecutive misses')
    })

    it('should assign higher priority number for more consecutive misses', () => {
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

      const priority1 = calculatePriority(state1).priority
      const priority2 = calculatePriority(state2).priority

      // More misses = higher missScore added to priority
      // priority = 2000 + (miss_count * 100) + recencyScore
      expect(priority2).toBeGreaterThan(priority1)
      // Difference should be roughly (5-2) * 100 = 300
      expect(priority2 - priority1).toBeCloseTo(300, 0)
    })

    it('should assign not-known tier for in-progress state', () => {
      const result = calculatePriority(mockPracticeStateInProgress)
      // Not-known tier starts at 3000, recency adds to it
      expect(result.priority).toBeGreaterThanOrEqual(3000)
      expect(result.reason).toContain('Not known')
    })

    it('should assign known tier for known state', () => {
      const result = calculatePriority(mockPracticeStateKnown)
      // Known tier starts at 4000, recency adds to it
      expect(result.priority).toBeGreaterThanOrEqual(4000)
      expect(result.reason).toContain('Known')
    })

    it('should prioritize older attempts within not-known tier', () => {
      const recentAttempt: PracticeState = {
        ...mockPracticeStateInProgress,
        last_attempt_at: '2025-01-10T00:00:00Z',
      }
      const oldAttempt: PracticeState = {
        ...mockPracticeStateInProgress,
        last_attempt_at: '2025-01-05T00:00:00Z',
      }

      const priorityRecent = calculatePriority(recentAttempt).priority
      const priorityOld = calculatePriority(oldAttempt).priority

      // In not-known tier, older timestamp = smaller recency addition = lower priority number
      expect(priorityOld).toBeLessThan(priorityRecent)
    })

    it('should handle null last_attempt_at gracefully', () => {
      const state: PracticeState = {
        ...mockPracticeStateInProgress,
        last_attempt_at: null,
      }
      const result = calculatePriority(state)
      // Should still calculate without crashing
      expect(result.priority).toBeGreaterThan(0)
      expect(result).toHaveProperty('reason')
    })

    it('should maintain tier ordering despite recency scores', () => {
      // Struggling should come before known in queue ordering
      const strugglingOld: PracticeState = {
        ...mockPracticeStateStruggling,
        last_attempt_at: '2025-01-01T00:00:00Z',
      }
      const knownRecent: PracticeState = {
        ...mockPracticeStateKnown,
        last_attempt_at: '2025-01-10T00:00:00Z',
      }

      const priorityStruggling = calculatePriority(strugglingOld).priority
      const priorityKnown = calculatePriority(knownRecent).priority

      // Struggling (tier 2xxx) should always come before known (tier 4xxx+)
      expect(priorityStruggling).toBeLessThan(priorityKnown)
    })

    it('should return exactly 1000 only for null state', () => {
      // Only null state returns exactly 1000
      const nullResult = calculatePriority(null)
      expect(nullResult.priority).toBe(1000)

      // Any actual state object goes through the algorithm
      const stateResult = calculatePriority(mockPracticeStateNew)
      expect(stateResult.priority).not.toBe(1000)
    })
  })

  describe('Priority Tier Ordering', () => {
    it('should order tiers correctly: null < struggling < not-known < known', () => {
      const neverPracticed = calculatePriority(null).priority
      const struggling = calculatePriority(mockPracticeStateStruggling).priority
      const notKnown = calculatePriority(mockPracticeStateInProgress).priority
      const known = calculatePriority(mockPracticeStateKnown).priority

      // Verify ordering (lower priority number = higher practice priority)
      expect(neverPracticed).toBeLessThan(struggling)
      expect(struggling).toBeLessThan(notKnown)
      expect(notKnown).toBeLessThan(known)
    })

    it('should have tier base values at expected levels', () => {
      // Check that tiers start at expected base values
      // (recency adds on top of these bases)
      const neverPracticed = calculatePriority(null).priority
      expect(neverPracticed).toBe(1000) // Exact

      const struggling = calculatePriority(mockPracticeStateStruggling).priority
      expect(struggling).toBeGreaterThanOrEqual(2000) // Base + missScore + recency

      const notKnown = calculatePriority(mockPracticeStateInProgress).priority
      expect(notKnown).toBeGreaterThanOrEqual(3000) // Base + recency

      const known = calculatePriority(mockPracticeStateKnown).priority
      expect(known).toBeGreaterThanOrEqual(4000) // Base + recency
    })
  })

  describe('Edge Cases', () => {
    it('should handle state with zero counts', () => {
      const state: PracticeState = {
        ...mockPracticeStateNew,
        first_try_success_count: 0,
        second_try_success_count: 0,
        consecutive_miss_count: 0,
        last_attempt_at: null,
      }
      const result = calculatePriority(state)
      // Zero successes, not struggling = not known tier
      expect(result.priority).toBeGreaterThanOrEqual(3000)
      expect(result.reason).toContain('Not known')
    })

    it('should handle exactly 2 successes (boundary of known)', () => {
      const state: PracticeState = {
        ...mockPracticeStateNew,
        first_try_success_count: 2,
        second_try_success_count: 0,
        consecutive_miss_count: 0,
        last_attempt_at: '2025-01-05T00:00:00Z',
      }
      const result = calculatePriority(state)
      // 2 successes = known
      expect(result.priority).toBeGreaterThanOrEqual(4000)
      expect(result.reason).toContain('Known')
    })

    it('should handle consecutive misses with successes (struggling overrides known)', () => {
      const state: PracticeState = {
        ...mockPracticeStateNew,
        first_try_success_count: 2,
        second_try_success_count: 1,
        consecutive_miss_count: 2,
        last_attempt_at: '2025-01-05T00:00:00Z',
      }
      const result = calculatePriority(state)
      // Consecutive misses = struggling (takes priority over known status)
      expect(result.priority).toBeGreaterThanOrEqual(2000)
      expect(result.reason).toContain('Struggling')
    })

    it('should handle very old timestamps', () => {
      const state: PracticeState = {
        ...mockPracticeStateInProgress,
        last_attempt_at: '2020-01-01T00:00:00Z',
      }
      const result = calculatePriority(state)
      // Should still be in not-known tier
      expect(result.priority).toBeGreaterThanOrEqual(3000)
      expect(result.reason).toContain('Not known')
    })

    it('should handle future timestamps gracefully', () => {
      const state: PracticeState = {
        ...mockPracticeStateInProgress,
        last_attempt_at: '2030-01-01T00:00:00Z',
      }
      const result = calculatePriority(state)
      // Should still calculate without error
      expect(result.priority).toBeGreaterThanOrEqual(3000)
      expect(result).toHaveProperty('reason')
    })
  })

  describe('Queue Ordering Logic', () => {
    it('should order items correctly when sorted by priority ascending', () => {
      const items = [
        { state: mockPracticeStateKnown },
        { state: null },
        { state: mockPracticeStateStruggling },
        { state: mockPracticeStateInProgress },
      ]

      const priorities = items.map(item =>
        calculatePriority(item.state).priority
      )

      const sorted = [...priorities].sort((a, b) => a - b)

      // Verify strict ordering
      expect(sorted[0]).toBeLessThan(sorted[1])
      expect(sorted[1]).toBeLessThan(sorted[2])
      expect(sorted[2]).toBeLessThan(sorted[3])
    })

    it('should produce correct order: null, struggling, not-known, known', () => {
      const items = [
        { state: mockPracticeStateKnown, label: 'known' },
        { state: null, label: 'null' },
        { state: mockPracticeStateStruggling, label: 'struggling' },
        { state: mockPracticeStateInProgress, label: 'not-known' },
      ]

      const withPriorities = items.map(item => ({
        ...item,
        priority: calculatePriority(item.state).priority
      }))

      const sorted = [...withPriorities].sort((a, b) => a.priority - b.priority)
      const labels = sorted.map(item => item.label)

      expect(labels).toEqual(['null', 'struggling', 'not-known', 'known'])
    })
  })

  describe('Reason Messages', () => {
    it('should return descriptive reason for null state', () => {
      const result = calculatePriority(null)
      expect(result.reason).toBe('Never practiced')
    })

    it('should include miss count in struggling reason', () => {
      const state: PracticeState = {
        ...mockPracticeStateStruggling,
        consecutive_miss_count: 3,
      }
      const result = calculatePriority(state)
      expect(result.reason).toContain('3 consecutive misses')
    })

    it('should include success count in not-known reason', () => {
      const state: PracticeState = {
        ...mockPracticeStateInProgress,
        first_try_success_count: 1,
        second_try_success_count: 0,
      }
      const result = calculatePriority(state)
      expect(result.reason).toContain('1 successes')
      expect(result.reason).toContain('need 2+')
    })

    it('should include success count in known reason', () => {
      const result = calculatePriority(mockPracticeStateKnown)
      expect(result.reason).toContain('successes')
    })
  })
})
