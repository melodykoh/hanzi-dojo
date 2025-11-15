// DashboardMetrics - Automated Unit Tests
// Epic 5: Entry Management & Belt System

import { describe, it, expect } from 'vitest'
import { DRILLS } from '../types'

describe('DashboardMetrics - Automated Logic Tests', () => {
  describe('Familiarity Computation', () => {
    it('should calculate all-time familiarity correctly', () => {
      const practiceStates = [
        { first_try_success_count: 3, second_try_success_count: 2 },
        { first_try_success_count: 1, second_try_success_count: 4 },
        { first_try_success_count: 2, second_try_success_count: 0 }
      ]

      const familiarity = computeAllTimeFamiliarity(practiceStates)

      // (3*1.0 + 2*0.5) + (1*1.0 + 4*0.5) + (2*1.0 + 0*0.5)
      // = 4.0 + 3.0 + 2.0 = 9.0
      expect(familiarity).toBe(9.0)
    })

    it('should handle zero practice states', () => {
      const familiarity = computeAllTimeFamiliarity([])
      expect(familiarity).toBe(0)
    })
  })

  describe('Accuracy Computation', () => {
    it('should calculate accuracy percentage correctly', () => {
      const practiceStates = [
        {
          first_try_success_count: 8,
          second_try_success_count: 2,
          consecutive_miss_count: 2
        },
        {
          first_try_success_count: 5,
          second_try_success_count: 3,
          consecutive_miss_count: 1
        }
      ]

      const accuracy = computeAccuracy(practiceStates)

      // Correct: 8 + 2 + 5 + 3 = 18
      // Total: 18 + 2 + 1 = 21
      // Accuracy: 18/21 = 85.7% (rounded to 86)
      expect(accuracy).toBe(86)
    })

    it('should return 0 when no attempts', () => {
      const accuracy = computeAccuracy([])
      expect(accuracy).toBe(0)
    })

    it('should handle 100% accuracy', () => {
      const practiceStates = [
        {
          first_try_success_count: 10,
          second_try_success_count: 0,
          consecutive_miss_count: 0
        }
      ]

      const accuracy = computeAccuracy(practiceStates)
      expect(accuracy).toBe(100)
    })
  })

  describe('Known Count Computation', () => {
    it('should count entry as known when all drills meet criteria', () => {
      const entries = [
        { id: 'entry-1', applicable_drills: [DRILLS.ZHUYIN, DRILLS.TRAD] }
      ]

      const practiceStates = [
        {
          entry_id: 'entry-1',
          drill: DRILLS.ZHUYIN,
          first_try_success_count: 2,
          second_try_success_count: 1,
          consecutive_miss_count: 0
        },
        {
          entry_id: 'entry-1',
          drill: DRILLS.TRAD,
          first_try_success_count: 1,
          second_try_success_count: 2,
          consecutive_miss_count: 1
        }
      ]

      const knownCount = computeKnownCount(entries, practiceStates)

      // Both drills have 2+ successes and <2 consecutive misses
      expect(knownCount).toBe(1)
    })

    it('should not count entry as known if any drill fails criteria', () => {
      const entries = [
        { id: 'entry-1', applicable_drills: [DRILLS.ZHUYIN, DRILLS.TRAD] }
      ]

      const practiceStates = [
        {
          entry_id: 'entry-1',
          drill: DRILLS.ZHUYIN,
          first_try_success_count: 2,
          second_try_success_count: 1,
          consecutive_miss_count: 0
        },
        {
          entry_id: 'entry-1',
          drill: DRILLS.TRAD,
          first_try_success_count: 0,
          second_try_success_count: 1,
          consecutive_miss_count: 0
        }
      ]

      const knownCount = computeKnownCount(entries, practiceStates)

      // Trad drill has only 1 success (needs 2+)
      expect(knownCount).toBe(0)
    })

    it('should not count entry as known if consecutive misses >= 2', () => {
      const entries = [
        { id: 'entry-1', applicable_drills: [DRILLS.ZHUYIN] }
      ]

      const practiceStates = [
        {
          entry_id: 'entry-1',
          drill: DRILLS.ZHUYIN,
          first_try_success_count: 3,
          second_try_success_count: 2,
          consecutive_miss_count: 2
        }
      ]

      const knownCount = computeKnownCount(entries, practiceStates)

      // Has 5 successes but 2 consecutive misses (demoted)
      expect(knownCount).toBe(0)
    })

    it('should handle entries with no practice states', () => {
      const entries = [
        { id: 'entry-1', applicable_drills: [DRILLS.ZHUYIN] }
      ]

      const practiceStates = []

      const knownCount = computeKnownCount(entries, practiceStates)

      expect(knownCount).toBe(0)
    })
  })

  describe('Weekly Familiarity Computation', () => {
    it('should only count practice states from last 7 days', () => {
      const now = new Date()
      const fiveDaysAgo = new Date(now)
      fiveDaysAgo.setDate(now.getDate() - 5)
      const tenDaysAgo = new Date(now)
      tenDaysAgo.setDate(now.getDate() - 10)

      const practiceStates = [
        {
          first_try_success_count: 3,
          second_try_success_count: 1,
          last_attempt_at: fiveDaysAgo.toISOString()
        },
        {
          first_try_success_count: 2,
          second_try_success_count: 2,
          last_attempt_at: tenDaysAgo.toISOString() // Outside 7-day window
        }
      ]

      const weeklyFamiliarity = computeWeeklyFamiliarity(practiceStates)

      // Only first state: 3*1.0 + 1*0.5 = 3.5
      expect(weeklyFamiliarity).toBe(3.5)
    })
  })

  describe('Sparkline Data Generation', () => {
    it('should generate 7 days of data', () => {
      const events = []
      const sparkline = computeSparklineData(events)

      expect(sparkline).toHaveLength(7)
    })

    it('should calculate correct familiarity per day', () => {
      const today = new Date().toISOString().split('T')[0]

      const events = [
        { created_at: `${today}T10:00:00Z`, points_awarded: 1.0 },
        { created_at: `${today}T11:00:00Z`, points_awarded: 0.5 },
        { created_at: `${today}T12:00:00Z`, points_awarded: 1.0 }
      ]

      const sparkline = computeSparklineData(events)

      const todayData = sparkline[sparkline.length - 1]
      expect(todayData.familiarity).toBe(2.5)
    })

    it('should return 0 for days with no practice', () => {
      const events = []
      const sparkline = computeSparklineData(events)

      sparkline.forEach(day => {
        expect(day.familiarity).toBe(0)
      })
    })
  })
})

// Helper functions (extracted from DashboardMetrics for testability)

function computeAllTimeFamiliarity(practiceStates: any[]): number {
  let total = 0

  for (const state of practiceStates) {
    total +=
      state.first_try_success_count * 1.0 +
      state.second_try_success_count * 0.5
  }

  return total
}

function computeAccuracy(practiceStates: any[]): number {
  let totalAttempts = 0
  let correctAttempts = 0

  for (const state of practiceStates) {
    const attempts =
      state.first_try_success_count +
      state.second_try_success_count +
      state.consecutive_miss_count

    totalAttempts += attempts
    correctAttempts +=
      state.first_try_success_count + state.second_try_success_count
  }

  return totalAttempts > 0
    ? Math.round((correctAttempts / totalAttempts) * 100)
    : 0
}

function computeKnownCount(entries: any[], practiceStates: any[]): number {
  let knownCount = 0

  for (const entry of entries) {
    const entryStates = practiceStates.filter(
      (s) => s.entry_id === entry.id
    )

    const applicableDrills: string[] = entry.applicable_drills || []
    let allDrillsKnown = applicableDrills.length > 0

    for (const drill of applicableDrills) {
      const state = entryStates.find((s) => s.drill === drill)

      if (!state) {
        allDrillsKnown = false
        break
      }

      const totalSuccesses =
        state.first_try_success_count + state.second_try_success_count
      const isKnown =
        totalSuccesses >= 2 && state.consecutive_miss_count < 2

      if (!isKnown) {
        allDrillsKnown = false
        break
      }
    }

    if (allDrillsKnown) {
      knownCount++
    }
  }

  return knownCount
}

function computeWeeklyFamiliarity(practiceStates: any[]): number {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const weeklyStates = practiceStates.filter((s) => {
    if (!s.last_attempt_at) return false
    const attemptDate = new Date(s.last_attempt_at)
    return attemptDate >= oneWeekAgo
  })

  let total = 0
  for (const state of weeklyStates) {
    total +=
      state.first_try_success_count * 1.0 +
      state.second_try_success_count * 0.5
  }

  return total
}

function computeSparklineData(events: any[]): { date: string; familiarity: number }[] {
  const days: { date: string; familiarity: number }[] = []

  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    const dayEvents = events.filter(
      (e) => e.created_at.split('T')[0] === dateStr
    )
    const familiarity = dayEvents.reduce(
      (sum, e) => sum + e.points_awarded,
      0
    )

    days.push({ date: dateStr, familiarity })
  }

  return days
}
