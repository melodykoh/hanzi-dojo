// Practice State Service - Manages scoring, familiarity, and known status computation

import { supabase } from './supabase'
import type { PracticeState, PracticeDrill, Entry } from '../types'

// =============================================================================
// CONSTANTS
// =============================================================================

const FIRST_TRY_POINTS = 1.0
const SECOND_TRY_POINTS = 0.5
const ZERO_POINTS = 0.0

const KNOWN_THRESHOLD = 2 // Need 2+ successes per drill
const DEMOTION_THRESHOLD = 2 // 2+ consecutive misses removes known status

// =============================================================================
// TYPES
// =============================================================================

export interface AttemptResult {
  isFirstAttempt: boolean
  isCorrect: boolean
  pointsAwarded: 0 | 0.5 | 1.0
}

export interface PracticeStateWithEntry extends PracticeState {
  entry?: Entry
}

export interface KnownStatus {
  isKnown: boolean
  reasonCode: 'known' | 'not_enough_successes' | 'too_many_consecutive_misses' | 'not_practiced'
  drillsStatus: {
    [drill in PracticeDrill]?: {
      isKnown: boolean
      totalSuccesses: number
      consecutiveMisses: number
    }
  }
}

// =============================================================================
// FAMILIARITY COMPUTATION
// =============================================================================

/**
 * Compute familiarity score from practice state counters
 * Formula: first_try_success_count * 1.0 + second_try_success_count * 0.5
 */
export function computeFamiliarity(state: PracticeState): number {
  return (
    state.first_try_success_count * FIRST_TRY_POINTS +
    state.second_try_success_count * SECOND_TRY_POINTS
  )
}

/**
 * Compute total familiarity across all drills for an entry
 */
export function computeTotalFamiliarity(states: PracticeState[]): number {
  return states.reduce((sum, state) => sum + computeFamiliarity(state), 0)
}

// =============================================================================
// KNOWN STATUS COMPUTATION
// =============================================================================

/**
 * Determine if a single drill is "known" for an entry
 * Rules:
 * - Total successes (first + second try) >= 2
 * - Consecutive miss count < 2
 */
export function isDrillKnown(state: PracticeState): boolean {
  const totalSuccesses = state.first_try_success_count + state.second_try_success_count
  return (
    totalSuccesses >= KNOWN_THRESHOLD &&
    state.consecutive_miss_count < DEMOTION_THRESHOLD
  )
}

/**
 * Determine if an entry is "known" overall
 * Rules:
 * - Every applicable drill must be "known"
 * - At least one drill must have been practiced
 */
export function computeKnownStatus(
  entry: Entry,
  practiceStates: PracticeState[]
): KnownStatus {
  const drillsStatus: KnownStatus['drillsStatus'] = {}
  
  // Build status for each applicable drill
  for (const drill of entry.applicable_drills) {
    const state = practiceStates.find(s => s.drill === drill)
    
    if (!state) {
      drillsStatus[drill] = {
        isKnown: false,
        totalSuccesses: 0,
        consecutiveMisses: 0
      }
    } else {
      const totalSuccesses = state.first_try_success_count + state.second_try_success_count
      drillsStatus[drill] = {
        isKnown: isDrillKnown(state),
        totalSuccesses,
        consecutiveMisses: state.consecutive_miss_count
      }
    }
  }
  
  // Check if any drill has been practiced
  const hasPracticedAny = practiceStates.length > 0
  
  if (!hasPracticedAny) {
    return {
      isKnown: false,
      reasonCode: 'not_practiced',
      drillsStatus
    }
  }
  
  // Check if all applicable drills are known
  const allDrillsKnown = entry.applicable_drills.every(drill => {
    const status = drillsStatus[drill]
    return status && status.isKnown
  })
  
  if (allDrillsKnown) {
    return {
      isKnown: true,
      reasonCode: 'known',
      drillsStatus
    }
  }
  
  // Determine reason for not known
  const hasConsecutiveMisses = Object.values(drillsStatus).some(
    status => status && status.consecutiveMisses >= DEMOTION_THRESHOLD
  )
  
  if (hasConsecutiveMisses) {
    return {
      isKnown: false,
      reasonCode: 'too_many_consecutive_misses',
      drillsStatus
    }
  }
  
  return {
    isKnown: false,
    reasonCode: 'not_enough_successes',
    drillsStatus
  }
}

// =============================================================================
// PRACTICE STATE CRUD
// =============================================================================

/**
 * Fetch practice state for a specific entry and drill
 */
export async function fetchPracticeState(
  kidId: string,
  entryId: string,
  drill: PracticeDrill
): Promise<PracticeState | null> {
  const { data, error } = await supabase
    .from('practice_state')
    .select('*')
    .eq('kid_id', kidId)
    .eq('entry_id', entryId)
    .eq('drill', drill)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  
  return data
}

/**
 * Fetch all practice states for an entry (across all drills)
 */
export async function fetchPracticeStatesForEntry(
  kidId: string,
  entryId: string
): Promise<PracticeState[]> {
  const { data, error } = await supabase
    .from('practice_state')
    .select('*')
    .eq('kid_id', kidId)
    .eq('entry_id', entryId)
  
  if (error) throw error
  return data || []
}

/**
 * Initialize or get existing practice state for an entry + drill
 */
export async function getOrCreatePracticeState(
  kidId: string,
  entryId: string,
  drill: PracticeDrill
): Promise<PracticeState> {
  const existing = await fetchPracticeState(kidId, entryId, drill)
  if (existing) return existing
  
  // Create new state
  const { data, error } = await supabase
    .from('practice_state')
    .insert({
      kid_id: kidId,
      entry_id: entryId,
      drill,
      first_try_success_count: 0,
      second_try_success_count: 0,
      consecutive_miss_count: 0
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

// =============================================================================
// SCORING & STATE UPDATES
// =============================================================================

/**
 * Record a practice attempt and update state counters
 * Returns updated practice state and points awarded
 */
export async function recordAttempt(
  kidId: string,
  entryId: string,
  drill: PracticeDrill,
  attemptIndex: 1 | 2,
  isCorrect: boolean,
  chosenOption?: unknown
): Promise<{ state: PracticeState; pointsAwarded: 0 | 0.5 | 1.0 }> {
  // Get or create practice state
  const currentState = await getOrCreatePracticeState(kidId, entryId, drill)
  
  // Determine points awarded
  let pointsAwarded: 0 | 0.5 | 1.0 = ZERO_POINTS
  if (isCorrect) {
    pointsAwarded = attemptIndex === 1 ? FIRST_TRY_POINTS : SECOND_TRY_POINTS
  }
  
  // Log to practice_events (immutable record)
  const { error: eventError } = await supabase
    .from('practice_events')
    .insert({
      kid_id: kidId,
      entry_id: entryId,
      drill,
      attempt_index: attemptIndex,
      is_correct: isCorrect,
      points_awarded: pointsAwarded,
      chosen_option: chosenOption
    })
  
  if (eventError) throw eventError
  
  // Update practice_state counters
  const updates: Partial<PracticeState> = {
    last_attempt_at: new Date().toISOString()
  }
  
  if (isCorrect) {
    // Increment success counter
    if (attemptIndex === 1) {
      updates.first_try_success_count = currentState.first_try_success_count + 1
    } else {
      updates.second_try_success_count = currentState.second_try_success_count + 1
    }
    
    // Reset consecutive miss counter on success
    updates.consecutive_miss_count = 0
    updates.last_success_at = new Date().toISOString()
  } else {
    // Increment consecutive miss counter on failure
    updates.consecutive_miss_count = currentState.consecutive_miss_count + 1
  }
  
  // Apply updates
  const { data: updatedState, error: updateError } = await supabase
    .from('practice_state')
    .update(updates)
    .eq('id', currentState.id)
    .select()
    .single()
  
  if (updateError) throw updateError
  
  return { state: updatedState, pointsAwarded }
}

/**
 * Convenience function to record first attempt
 */
export async function recordFirstAttempt(
  kidId: string,
  entryId: string,
  drill: PracticeDrill,
  isCorrect: boolean,
  chosenOption?: unknown
) {
  return recordAttempt(kidId, entryId, drill, 1, isCorrect, chosenOption)
}

/**
 * Convenience function to record second attempt
 */
export async function recordSecondAttempt(
  kidId: string,
  entryId: string,
  drill: PracticeDrill,
  isCorrect: boolean,
  chosenOption?: unknown
) {
  return recordAttempt(kidId, entryId, drill, 2, isCorrect, chosenOption)
}

// =============================================================================
// ANALYTICS & QUERIES
// =============================================================================

/**
 * Fetch recent practice events for analytics
 */
export async function fetchRecentEvents(
  kidId: string,
  limit: number = 20
): Promise<any[]> {
  const { data, error } = await supabase
    .from('practice_events')
    .select('*')
    .eq('kid_id', kidId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data || []
}

/**
 * Compute accuracy rate for a kid (correct attempts / total attempts)
 */
export async function computeAccuracyRate(
  kidId: string,
  days?: number
): Promise<number> {
  let query = supabase
    .from('practice_events')
    .select('is_correct')
    .eq('kid_id', kidId)
  
  if (days) {
    const since = new Date()
    since.setDate(since.getDate() - days)
    query = query.gte('created_at', since.toISOString())
  }
  
  const { data, error } = await query
  
  if (error) throw error
  if (!data || data.length === 0) return 0
  
  const correctCount = data.filter(e => e.is_correct).length
  return correctCount / data.length
}

/**
 * Compute total familiarity points earned in a time period
 */
export async function computeFamiliarityGained(
  kidId: string,
  days: number
): Promise<number> {
  const since = new Date()
  since.setDate(since.getDate() - days)
  
  const { data, error } = await supabase
    .from('practice_events')
    .select('points_awarded')
    .eq('kid_id', kidId)
    .gte('created_at', since.toISOString())
  
  if (error) throw error
  if (!data) return 0
  
  return data.reduce((sum, e) => sum + (e.points_awarded || 0), 0)
}

/**
 * Count total known entries for a kid
 */
export async function countKnownEntries(kidId: string): Promise<number> {
  // Fetch all entries and their practice states
  const { data: entries, error: entriesError } = await supabase
    .from('entries')
    .select('id, applicable_drills')
    .eq('kid_id', kidId)
  
  if (entriesError) throw entriesError
  if (!entries) return 0
  
  const { data: states, error: statesError } = await supabase
    .from('practice_state')
    .select('*')
    .eq('kid_id', kidId)
  
  if (statesError) throw statesError
  
  // Group states by entry
  const statesByEntry = new Map<string, PracticeState[]>()
  for (const state of states || []) {
    const list = statesByEntry.get(state.entry_id) || []
    list.push(state)
    statesByEntry.set(state.entry_id, list)
  }
  
  // Count known entries
  let knownCount = 0
  for (const entry of entries) {
    const entryStates = statesByEntry.get(entry.id) || []
    const status = computeKnownStatus(entry as any, entryStates)
    if (status.isKnown) knownCount++
  }
  
  return knownCount
}
