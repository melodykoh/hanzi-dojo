// Drill Balance Service - Proficiency-based drill recommendations
// Epic 5.5: UX Refinement - Task 5.5.3

import { supabase } from './supabase'
import { dictionaryClient } from './dictionaryClient'
import { formatZhuyinDisplay } from './zhuyin'
import type { PracticeDrill } from '../types'
import { DRILLS } from '../types'

// =============================================================================
// CONSTANTS
// =============================================================================

/** Number of consecutive misses to qualify as "struggling" */
const STRUGGLING_THRESHOLD = 2

/** Number of recent practice events to use for accuracy calculation */
const RECENT_EVENTS_LIMIT = 10

/** Maximum struggling characters to fetch for display */
const MAX_STRUGGLING_CHARACTERS = 50

/** Accuracy difference (percentage points) to trigger proficiency gap recommendation */
const PROFICIENCY_GAP_PERCENT = 15

// =============================================================================
// TYPES
// =============================================================================

export interface DrillProficiency {
  drill: PracticeDrill
  queueDepth: number
  avgAccuracy: number | null  // % correct on first try (last 10 attempts)
  strugglingCount: number      // Items with consecutive_miss_count >= 2
  needsAttention: boolean
}

export interface StrugglingCharacter {
  entry_id: string
  simplified: string
  traditional: string
  zhuyin: string
  consecutive_miss_count: number
  last_practiced_at: string | null
}

export interface DrillRecommendation {
  recommendedDrill: PracticeDrill | null
  reason: 'proficiency_gap' | 'struggling_items' | 'never_practiced' | 'balanced' | 'both_empty'
  drillA: DrillProficiency
  drillB: DrillProficiency
}

// =============================================================================
// PROFICIENCY CALCULATION
// =============================================================================

/**
 * Calculate proficiency metrics for a specific drill
 *
 * Performance optimization: All 3 queries run in parallel via Promise.all
 * reducing latency from ~600ms (sequential) to ~200ms (parallel)
 */
export async function calculateDrillProficiency(
  kidId: string,
  drill: PracticeDrill
): Promise<DrillProficiency> {
  // Run all 3 queries in parallel for ~3x performance improvement
  const [entriesResult, eventsResult, strugglingResult] = await Promise.all([
    // Query 1: Get queue depth (all entries that support this drill)
    supabase
      .from('entries')
      .select('*', { count: 'exact', head: true })
      .eq('kid_id', kidId)
      .contains('applicable_drills', [drill]),

    // Query 2: Get recent practice events for accuracy calculation
    supabase
      .from('practice_events')
      .select('is_correct')
      .eq('kid_id', kidId)
      .eq('drill', drill)
      .eq('attempt_index', 1)  // First try only
      .order('created_at', { ascending: false })
      .limit(RECENT_EVENTS_LIMIT),

    // Query 3: Count struggling items (consecutive_miss_count >= STRUGGLING_THRESHOLD)
    supabase
      .from('practice_state')
      .select('*', { count: 'exact', head: true })
      .eq('kid_id', kidId)
      .eq('drill', drill)
      .gte('consecutive_miss_count', STRUGGLING_THRESHOLD)
  ])

  // Extract results from parallel queries
  const queueDepth = entriesResult.count
  const { data: recentEvents, error: eventsError } = eventsResult
  const strugglingCount = strugglingResult.count

  // Early return if no entries for this drill
  if (!queueDepth || queueDepth === 0) {
    return {
      drill,
      queueDepth: 0,
      avgAccuracy: null,
      strugglingCount: 0,
      needsAttention: false
    }
  }

  if (eventsError) {
    console.error(`[drillBalanceService] Failed to fetch events for ${drill}:`, eventsError)
  }

  const avgAccuracy = recentEvents && recentEvents.length > 0
    ? Math.round((recentEvents.filter(e => e.is_correct).length / recentEvents.length) * 100)
    : null

  return {
    drill,
    queueDepth: queueDepth || 0,
    avgAccuracy,
    strugglingCount: strugglingCount || 0,
    needsAttention: false  // Set by recommendation logic
  }
}

// =============================================================================
// RECOMMENDATION LOGIC
// =============================================================================

/**
 * Recommend which drill to practice based on proficiency metrics
 * 
 * Priority order:
 * 1. Drill with struggling items (consecutive misses >= 2)
 * 2. Drill never practiced (no accuracy data)
 * 3. Drill with lower proficiency (accuracy gap >= 15%)
 * 4. Balanced (no strong recommendation)
 */
export async function recommendDrill(kidId: string): Promise<DrillRecommendation> {
  // Calculate proficiency for both drills
  const drillA = await calculateDrillProficiency(kidId, DRILLS.ZHUYIN)
  const drillB = await calculateDrillProficiency(kidId, DRILLS.TRAD)

  // Edge case: Both drills have no items
  if (drillA.queueDepth === 0 && drillB.queueDepth === 0) {
    return {
      recommendedDrill: null,
      reason: 'both_empty',
      drillA,
      drillB
    }
  }

  // Edge case: Only one drill has items
  if (drillA.queueDepth === 0) {
    return {
      recommendedDrill: DRILLS.TRAD,
      reason: 'balanced',
      drillA,
      drillB
    }
  }

  if (drillB.queueDepth === 0) {
    return {
      recommendedDrill: DRILLS.ZHUYIN,
      reason: 'balanced',
      drillA,
      drillB
    }
  }

  // Priority 1: Drill with more struggling items (diff >= 3)
  if (drillA.strugglingCount > drillB.strugglingCount + 2) {
    return {
      recommendedDrill: DRILLS.ZHUYIN,
      reason: 'struggling_items',
      drillA: { ...drillA, needsAttention: true },
      drillB
    }
  }

  if (drillB.strugglingCount > drillA.strugglingCount + 2) {
    return {
      recommendedDrill: DRILLS.TRAD,
      reason: 'struggling_items',
      drillA,
      drillB: { ...drillB, needsAttention: true }
    }
  }

  // Priority 2: Drill never practiced
  if (drillA.avgAccuracy === null && drillB.avgAccuracy !== null) {
    return {
      recommendedDrill: DRILLS.ZHUYIN,
      reason: 'never_practiced',
      drillA: { ...drillA, needsAttention: true },
      drillB
    }
  }

  if (drillB.avgAccuracy === null && drillA.avgAccuracy !== null) {
    return {
      recommendedDrill: DRILLS.TRAD,
      reason: 'never_practiced',
      drillA,
      drillB: { ...drillB, needsAttention: true }
    }
  }

  // Both never practiced - no strong recommendation
  if (drillA.avgAccuracy === null && drillB.avgAccuracy === null) {
    return {
      recommendedDrill: null,
      reason: 'balanced',
      drillA,
      drillB
    }
  }

  // Priority 3: Proficiency gap (>= 15% accuracy difference)
  const accuracyGap = Math.abs((drillA.avgAccuracy || 0) - (drillB.avgAccuracy || 0))

  if (accuracyGap >= PROFICIENCY_GAP_PERCENT) {
    const weakerDrill = (drillA.avgAccuracy || 0) < (drillB.avgAccuracy || 0) ? DRILLS.ZHUYIN : DRILLS.TRAD

    return {
      recommendedDrill: weakerDrill,
      reason: 'proficiency_gap',
      drillA: { ...drillA, needsAttention: weakerDrill === DRILLS.ZHUYIN },
      drillB: { ...drillB, needsAttention: weakerDrill === DRILLS.TRAD }
    }
  }

  // Balanced - no strong recommendation
  return {
    recommendedDrill: null,
    reason: 'balanced',
    drillA,
    drillB
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get human-readable reason message
 */
export function getRecommendationMessage(recommendation: DrillRecommendation): string {
  const { reason, drillA, drillB, recommendedDrill } = recommendation

  switch (reason) {
    case 'both_empty':
      return 'No items available for practice'
    
    case 'struggling_items': {
      const weakerDrill = recommendedDrill === DRILLS.ZHUYIN ? drillA : drillB
      return `${weakerDrill.strugglingCount} struggling items need attention`
    }

    case 'never_practiced':
      return 'Not practiced yet - good time to start'

    case 'proficiency_gap': {
      const weakerDrill = recommendedDrill === DRILLS.ZHUYIN ? drillA : drillB
      const strongerDrill = recommendedDrill === DRILLS.ZHUYIN ? drillB : drillA
      return `Lower proficiency (${weakerDrill.avgAccuracy}% vs ${strongerDrill.avgAccuracy}%)`
    }
    
    case 'balanced':
      return 'Both drills are balanced - choose either'
    
    default:
      return 'Ready to practice'
  }
}

/**
 * Get display name for drill
 */
export function getDrillDisplayName(drill: PracticeDrill): string {
  return drill === DRILLS.ZHUYIN ? 'Drill A' : 'Drill B'
}

/**
 * Get drill description
 */
export function getDrillDescription(drill: PracticeDrill): string {
  return drill === DRILLS.ZHUYIN ? 'Zhuyin Recognition' : 'Traditional Form'
}

// =============================================================================
// STRUGGLING CHARACTERS
// =============================================================================

/**
 * Get detailed list of struggling characters for a drill
 * Struggling = consecutive_miss_count >= 2
 */
export async function getStrugglingCharacters(
  kidId: string,
  drill: PracticeDrill
): Promise<StrugglingCharacter[]> {
  const { data, error } = await supabase
    .from('practice_state')
    .select(`
      entry_id,
      consecutive_miss_count,
      last_attempt_at,
      entries!inner (
        simp,
        trad
      )
    `)
    .eq('kid_id', kidId)
    .eq('drill', drill)
    .gte('consecutive_miss_count', STRUGGLING_THRESHOLD)
    .order('consecutive_miss_count', { ascending: false })
    .limit(MAX_STRUGGLING_CHARACTERS)

  if (error) {
    console.error('[drillBalanceService] Failed to fetch struggling characters:', error)
    return []
  }

  if (!data || data.length === 0) {
    return []
  }

  // Type for the joined entry data from Supabase
  type EntryData = { simp: string; trad: string }

  // Defensive filter: entries may be null if entry was deleted between query and processing (race condition)
  const validData = data.filter(d => {
    if (d.entries == null) {
      console.warn('[drillBalanceService] Null entries encountered in getStrugglingCharacters - possible race condition or data integrity issue', {
        entry_id: d.entry_id,
        kid_id: kidId,
        drill
      })
      return false
    }
    return true
  })

  // Fetch zhuyin from dictionary for each character using dictionaryClient
  const simplifiedChars = validData.map(d => {
    const entry = d.entries as unknown as EntryData
    return entry.simp
  })

  // Use dictionaryClient for consistent lookup with caching
  const dictResults = await dictionaryClient.batchLookup(simplifiedChars)
  const zhuyinMap = new Map<string, string>()
  simplifiedChars.forEach((char, index) => {
    const result = dictResults[index]
    if (result.found && result.entry?.zhuyin) {
      zhuyinMap.set(char, formatZhuyinDisplay(result.entry.zhuyin))
    }
  })

  return validData.map(item => {
    const entry = item.entries as unknown as EntryData
    return {
      entry_id: item.entry_id,
      simplified: entry.simp,
      traditional: entry.trad,
      zhuyin: zhuyinMap.get(entry.simp) || '',
      consecutive_miss_count: item.consecutive_miss_count,
      last_practiced_at: item.last_attempt_at
    }
  })
}

// =============================================================================
// TIME-BASED ACCURACY
// =============================================================================

/**
 * Calculate accuracy for a specific time window
 * @param days - Number of days to look back (7 for "Last Week", 60 for "Last 60 Days")
 * @returns Accuracy percentage or null if no events in timeframe
 */
export async function getAccuracyForTimeframe(
  kidId: string,
  drill: PracticeDrill,
  days: number
): Promise<number | null> {
  // Use UTC-based calculation to avoid timezone off-by-one errors
  // "Last 7 days" means exactly 7 × 24 hours ago, not calendar days
  const now = Date.now()
  const cutoffMs = now - (days * 24 * 60 * 60 * 1000)
  const cutoffDate = new Date(cutoffMs).toISOString()

  const { data, error } = await supabase
    .from('practice_events')
    .select('is_correct')
    .eq('kid_id', kidId)
    .eq('drill', drill)
    .eq('attempt_index', 1) // First tries only
    .gte('created_at', cutoffDate)

  if (error) {
    console.error(`[drillBalanceService] Failed to fetch accuracy for ${drill}:`, error)
    return null
  }

  // Return null for "N/A" display when no events in timeframe
  if (!data || data.length === 0) {
    return null
  }

  const correct = data.filter(e => e.is_correct).length
  return Math.round((correct / data.length) * 100)
}
