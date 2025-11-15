// Dashboard Metrics - Real-time metrics from practice_state
// Epic 5: Entry Management & Belt System

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { PracticeState } from '../types'

interface MetricsData {
  allTimeFamiliarity: number
  lastPracticedDays: number | null  // Days since last practice, null if never
  improvingStreak: number  // Consecutive sessions with improving accuracy
  perfectStreak: number    // Consecutive sessions with 100% accuracy
  knownCount: number
  totalEntries: number
}

interface DashboardMetricsProps {
  kidId: string
}

export function DashboardMetrics({ kidId }: DashboardMetricsProps) {
  const [metrics, setMetrics] = useState<MetricsData>({
    allTimeFamiliarity: 0,
    lastPracticedDays: null,
    improvingStreak: 0,
    perfectStreak: 0,
    knownCount: 0,
    totalEntries: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadMetrics()
  }, [kidId])

  const loadMetrics = async () => {
    setIsLoading(true)

    try {
      // Fetch all practice states for this kid
      const { data: practiceStates, error: statesError } = await supabase
        .from('practice_state')
        .select('*')
        .eq('kid_id', kidId)

      if (statesError) throw statesError

      // Fetch all entries for this kid
      const { data: entries, error: entriesError } = await supabase
        .from('entries')
        .select('id, applicable_drills')
        .eq('kid_id', kidId)

      if (entriesError) throw entriesError

      // Fetch all practice events for session tracking (grouped by date/time)
      const { data: allEvents, error: eventsError } = await supabase
        .from('practice_events')
        .select('created_at, is_correct, attempt_index')
        .eq('kid_id', kidId)
        .order('created_at', { ascending: true })

      if (eventsError) throw eventsError

      // Compute metrics
      const computed = computeMetrics(
        practiceStates || [],
        entries || [],
        allEvents || []
      )

      setMetrics(computed)
    } catch (error) {
      console.error('Failed to load metrics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const computeMetrics = (
    practiceStates: PracticeState[],
    entries: any[],
    allEvents: any[]
  ): MetricsData => {
    // 1. All-time familiarity (sum of weighted successes)
    let allTimeFamiliarity = 0
    for (const state of practiceStates) {
      allTimeFamiliarity +=
        state.first_try_success_count * 1.0 +
        state.second_try_success_count * 0.5
    }

    // 2. Last practiced (days since most recent practice)
    let lastPracticedDays: number | null = null
    const lastAttemptDates = practiceStates
      .map(s => s.last_attempt_at)
      .filter(d => d !== null)
      .sort()
      .reverse()

    if (lastAttemptDates.length > 0) {
      const lastDate = new Date(lastAttemptDates[0]!)
      const now = new Date()
      const diffMs = now.getTime() - lastDate.getTime()
      lastPracticedDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    }

    // 3. Session-based accuracy streaks
    const sessions = groupIntoSessions(allEvents)
    const { improvingStreak, perfectStreak } = calculateStreaks(sessions)

    // 4. Known count (entries with ALL applicable drills "known")
    let knownCount = 0
    for (const entry of entries) {
      const entryStates = practiceStates.filter(s => s.entry_id === entry.id)
      const applicableDrills: string[] = entry.applicable_drills || []
      let allDrillsKnown = applicableDrills.length > 0

      for (const drill of applicableDrills) {
        const state = entryStates.find(s => s.drill === drill)
        if (!state) {
          allDrillsKnown = false
          break
        }

        const totalSuccesses = state.first_try_success_count + state.second_try_success_count
        const isKnown = totalSuccesses >= 2 && state.consecutive_miss_count < 2

        if (!isKnown) {
          allDrillsKnown = false
          break
        }
      }

      if (allDrillsKnown) knownCount++
    }

    return {
      allTimeFamiliarity,
      lastPracticedDays,
      improvingStreak,
      perfectStreak,
      knownCount,
      totalEntries: entries.length
    }
  }

  // Group practice events into sessions (2-hour window)
  function groupIntoSessions(events: any[]) {
    if (events.length === 0) return []

    const sessions: any[][] = []
    let currentSession: any[] = []
    const SESSION_GAP_MS = 2 * 60 * 60 * 1000 // 2 hours

    for (const event of events) {
      if (currentSession.length === 0) {
        currentSession.push(event)
      } else {
        const lastEvent = currentSession[currentSession.length - 1]
        const gap = new Date(event.created_at).getTime() - new Date(lastEvent.created_at).getTime()

        if (gap <= SESSION_GAP_MS) {
          currentSession.push(event)
        } else {
          sessions.push(currentSession)
          currentSession = [event]
        }
      }
    }

    if (currentSession.length > 0) {
      sessions.push(currentSession)
    }

    return sessions
  }

  // Calculate accuracy streaks from sessions
  function calculateStreaks(sessions: any[][]) {
    if (sessions.length === 0) {
      return { improvingStreak: 0, perfectStreak: 0 }
    }

    // Calculate first-try accuracy for each session
    const sessionAccuracies = sessions.map(session => {
      const firstTryEvents = session.filter(e => e.attempt_index === 1)
      if (firstTryEvents.length === 0) return 0
      const correct = firstTryEvents.filter(e => e.is_correct).length
      return (correct / firstTryEvents.length) * 100
    })

    // Calculate improving streak (working backwards from most recent)
    let improvingStreak = 0
    for (let i = sessionAccuracies.length - 1; i > 0; i--) {
      if (sessionAccuracies[i] > sessionAccuracies[i - 1]) {
        improvingStreak++
      } else {
        break
      }
    }

    // Calculate perfect streak (100% accuracy)
    let perfectStreak = 0
    for (let i = sessionAccuracies.length - 1; i >= 0; i--) {
      if (sessionAccuracies[i] === 100) {
        perfectStreak++
      } else {
        break
      }
    }

    return { improvingStreak, perfectStreak }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    )
  }

  function formatLastPracticed(days: number | null): string {
    if (days === null) return 'Never'
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    return `${Math.floor(days / 30)} months ago`
  }

  return (
    <div className="space-y-6">
      {/* Metric Tiles - Cohesive Palette */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* All-Time Points - Gold */}
        <div className="bg-gradient-to-br from-ninja-gold to-ninja-gold-dark text-ninja-black shadow-xl p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold opacity-80 uppercase tracking-wide">
              Total Points
            </h3>
            <span className="text-2xl">⭐</span>
          </div>
          <div className="text-4xl font-black">
            {metrics.allTimeFamiliarity.toFixed(1)}
          </div>
          <div className="text-xs font-bold opacity-70 mt-1">
            Familiarity earned
          </div>
        </div>

        {/* Last Practiced - White/Gray */}
        <div className="bg-white border-2 border-gray-200 shadow-md p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide">
              Last Practice
            </h3>
            <span className="text-2xl">📅</span>
          </div>
          <div className="text-3xl font-black text-gray-900">
            {formatLastPracticed(metrics.lastPracticedDays)}
          </div>
          <div className="text-xs font-bold text-gray-500 mt-1">
            {metrics.lastPracticedDays !== null && metrics.lastPracticedDays > 3
              ? 'Time to practice!'
              : 'Keep it up!'}
          </div>
        </div>

        {/* Accuracy Streak - Red */}
        <div className="bg-gradient-to-br from-ninja-red to-ninja-red-dark text-white shadow-xl p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold opacity-80 uppercase tracking-wide">Streak</h3>
            <span className="text-2xl">🔥</span>
          </div>
          <div className="text-2xl font-black">
            {metrics.improvingStreak > 0 && (
              <div>{metrics.improvingStreak} improving</div>
            )}
            {metrics.perfectStreak > 0 && (
              <div>{metrics.perfectStreak} perfect</div>
            )}
            {metrics.improvingStreak === 0 && metrics.perfectStreak === 0 && (
              <div>Start practicing!</div>
            )}
          </div>
          <div className="text-xs font-bold opacity-70 mt-1">
            Consecutive sessions
          </div>
        </div>

        {/* Characters Mastered - White/Gray */}
        <div className="bg-white border-2 border-gray-200 shadow-md p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Progress</h3>
            <span className="text-2xl">📚</span>
          </div>
          <div className="text-3xl font-black text-gray-900">
            {metrics.knownCount}/{metrics.totalEntries}
          </div>
          <div className="text-xs font-bold text-gray-500 mt-1">
            {metrics.knownCount === metrics.totalEntries && metrics.totalEntries > 0
              ? 'All mastered!'
              : 'Characters known'}
          </div>
        </div>
      </div>
    </div>
  )
}
