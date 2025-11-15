// Drill Balance Service - Proficiency-based drill recommendations
// Epic 5.5: UX Refinement - Task 5.5.3

import { supabase } from './supabase'
import type { PracticeDrill } from '../types'
import { DRILLS } from '../types'

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
 */
export async function calculateDrillProficiency(
  kidId: string,
  drill: PracticeDrill
): Promise<DrillProficiency> {
  // Get queue depth (all entries that support this drill)
  const { count: queueDepth } = await supabase
    .from('entries')
    .select('*', { count: 'exact', head: true })
    .eq('kid_id', kidId)
    .contains('applicable_drills', [drill])

  if (!queueDepth || queueDepth === 0) {
    return {
      drill,
      queueDepth: 0,
      avgAccuracy: null,
      strugglingCount: 0,
      needsAttention: false
    }
  }

  // Calculate average first-try accuracy from recent practice events
  const { data: recentEvents, error: eventsError } = await supabase
    .from('practice_events')
    .select('is_correct')
    .eq('kid_id', kidId)
    .eq('drill', drill)
    .eq('attempt_index', 1)  // First try only
    .order('created_at', { ascending: false })
    .limit(10)  // Last 10 first attempts

  if (eventsError) {
    console.error(`[drillBalanceService] Failed to fetch events for ${drill}:`, eventsError)
  }

  const avgAccuracy = recentEvents && recentEvents.length > 0
    ? Math.round((recentEvents.filter(e => e.is_correct).length / recentEvents.length) * 100)
    : null

  // Count struggling items (consecutive_miss_count >= 2)
  const { count: strugglingCount } = await supabase
    .from('practice_state')
    .select('*', { count: 'exact', head: true })
    .eq('kid_id', kidId)
    .eq('drill', drill)
    .gte('consecutive_miss_count', 2)

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

  if (accuracyGap >= 15) {
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
