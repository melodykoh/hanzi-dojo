// Word Pair Service - Drill C (Word Match) data fetching and round generation

import { supabase } from './supabase'
import type {
  WordPairWithZhuyin,
  WordMatchRoundData,
  WordMatchCard,
  ZhuyinSyllable
} from '../types'

// =============================================================================
// CONSTANTS
// =============================================================================

export const MIN_PAIRS_FOR_ROUND = 5

// =============================================================================
// ERROR TYPES
// =============================================================================

export class InsufficientPairsError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InsufficientPairsError'
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// =============================================================================
// ELIGIBILITY CHECK
// =============================================================================

/**
 * Check if a kid can play Drill C (Word Match)
 * Requires at least MIN_PAIRS_FOR_ROUND eligible word pairs
 */
export async function canPlayWordMatch(kidId: string): Promise<boolean> {
  try {
    const pairs = await fetchEligibleWordPairs(kidId)
    return pairs.length >= MIN_PAIRS_FOR_ROUND
  } catch (error) {
    console.error('[wordPairService] canPlayWordMatch error:', error)
    return false
  }
}

/**
 * Get count of eligible word pairs for display
 */
export async function getEligiblePairCount(kidId: string): Promise<number> {
  try {
    const pairs = await fetchEligibleWordPairs(kidId)
    return pairs.length
  } catch (error) {
    console.error('[wordPairService] getEligiblePairCount error:', error)
    return 0
  }
}

// =============================================================================
// DATA FETCHING
// =============================================================================

/**
 * Fetch eligible word pairs from Supabase RPC
 * Returns pairs where at least one character is in kid's learned set
 */
export async function fetchEligibleWordPairs(kidId: string): Promise<WordPairWithZhuyin[]> {
  const { data, error } = await supabase
    .rpc('get_eligible_word_pairs', { p_kid_id: kidId })

  if (error) {
    console.error('[wordPairService] RPC error:', error)
    throw new Error(`Failed to fetch word pairs: ${error.message}`)
  }

  if (!data) {
    return []
  }

  // Parse Zhuyin from JSONB to proper array format
  return data.map((row: {
    id: string
    word: string
    char1: string
    char1_zhuyin: ZhuyinSyllable[] | null
    char2: string
    char2_zhuyin: ZhuyinSyllable[] | null
    category: string | null
  }) => ({
    id: row.id,
    word: row.word,
    char1: row.char1,
    char1_zhuyin: row.char1_zhuyin || [],
    char2: row.char2,
    char2_zhuyin: row.char2_zhuyin || [],
    category: row.category
  }))
}

// =============================================================================
// COMPREHENSIVE CONFLICT SET
// =============================================================================

/**
 * Fetch the full word pair conflict set from the database.
 * Returns a Set of "char1|char2" keys covering ALL known 2-character words
 * (MOE dictionary + CCCC pairs). Used for comprehensive cross-column
 * ambiguity detection in generateRound().
 *
 * Intended to be called once per drill session and cached.
 */
export async function fetchWordPairConflictSet(): Promise<Set<string>> {
  const { data, error } = await supabase
    .rpc('get_word_pair_conflict_set')

  if (error) {
    console.error('[wordPairService] fetchWordPairConflictSet error:', error)
    // Return empty set — generateRound will fall back to eligible-only lookup
    return new Set<string>()
  }

  const lookup = new Set<string>()
  if (data) {
    for (const row of data as { char1: string; char2: string }[]) {
      lookup.add(`${row.char1}|${row.char2}`)
    }
  }
  return lookup
}

// =============================================================================
// ROUND GENERATION
// =============================================================================

/**
 * Build lookup Set for O(1) word pair existence checks
 */
function buildWordPairLookup(pairs: WordPairWithZhuyin[]): Set<string> {
  const lookup = new Set<string>()
  for (const pair of pairs) {
    lookup.add(`${pair.char1}|${pair.char2}`)
  }
  return lookup
}

/**
 * Check if adding a pair would create cross-column ambiguity
 * Returns true if candidate.char1 can form a valid word with any existing.char2
 * or if any existing.char1 can form a valid word with candidate.char2
 */
function hasConflict(
  candidate: WordPairWithZhuyin,
  existingPairs: WordPairWithZhuyin[],
  wordPairLookup: Set<string>
): boolean {
  for (const existing of existingPairs) {
    // Can candidate.char1 form valid word with existing.char2?
    if (wordPairLookup.has(`${candidate.char1}|${existing.char2}`)) {
      return true
    }
    // Can existing.char1 form valid word with candidate.char2?
    if (wordPairLookup.has(`${existing.char1}|${candidate.char2}`)) {
      return true
    }
  }
  return false
}

/**
 * Generate a round of MIN_PAIRS_FOR_ROUND word pairs with unique characters and no ambiguity.
 *
 * @param eligiblePairs - The kid's eligible word pairs
 * @param comprehensiveLookup - Optional Set of "char1|char2" keys covering ALL known words.
 *   When provided, conflict detection uses this comprehensive vocabulary instead of only
 *   the eligible pairs. This catches ambiguity from real Chinese words not in the kid's set
 *   (e.g., 日記 and 日光 both exist even if only one is in the kid's eligible pairs).
 *   When absent, falls back to eligible-only lookup (backward-compatible).
 * @throws InsufficientPairsError if not enough non-conflicting pairs available
 */
export function generateRound(
  eligiblePairs: WordPairWithZhuyin[],
  comprehensiveLookup?: Set<string>
): WordPairWithZhuyin[] {
  const shuffled = shuffle([...eligiblePairs])
  const selected: WordPairWithZhuyin[] = []
  const usedChar1 = new Set<string>()
  const usedChar2 = new Set<string>()
  // Use comprehensive lookup if provided, otherwise fall back to eligible-only
  const wordPairLookup = comprehensiveLookup && comprehensiveLookup.size > 0
    ? comprehensiveLookup
    : buildWordPairLookup(eligiblePairs)

  for (const pair of shuffled) {
    // Uniqueness checks: both char1 and char2 must be unique in the round
    if (usedChar1.has(pair.char1) || usedChar2.has(pair.char2)) continue

    // Cross-column conflict check: no ambiguous matches allowed
    if (hasConflict(pair, selected, wordPairLookup)) continue

    usedChar1.add(pair.char1)
    usedChar2.add(pair.char2)
    selected.push(pair)
    if (selected.length === MIN_PAIRS_FOR_ROUND) break
  }

  if (selected.length < MIN_PAIRS_FOR_ROUND) {
    throw new InsufficientPairsError(
      `Only found ${selected.length} non-conflicting pairs. Need ${MIN_PAIRS_FOR_ROUND}.`
    )
  }

  return selected
}

/**
 * Build display data for a round (shuffled columns)
 */
export function buildRoundDisplayData(pairs: WordPairWithZhuyin[]): WordMatchRoundData {
  const leftColumn: WordMatchCard[] = shuffle(pairs.map(p => ({
    pairId: p.id,
    char: p.char1,
    zhuyin: p.char1_zhuyin
  })))

  const rightColumn: WordMatchCard[] = shuffle(pairs.map(p => ({
    pairId: p.id,
    char: p.char2,
    zhuyin: p.char2_zhuyin
  })))

  return {
    leftColumn,
    rightColumn,
    pairs
  }
}

// =============================================================================
// PRACTICE EVENT RECORDING
// =============================================================================

/**
 * Record a word match attempt to practice_events
 */
export async function recordWordMatchAttempt(
  kidId: string,
  wordPairId: string,
  word: string,
  selectedChar2: string,
  attemptIndex: 1 | 2,
  isCorrect: boolean,
  points: 0 | 0.5 | 1.0
): Promise<void> {
  const { error } = await supabase.from('practice_events').insert({
    kid_id: kidId,
    entry_id: null, // Word match doesn't use entry_id
    drill: 'word_match',
    attempt_index: attemptIndex,
    is_correct: isCorrect,
    points_awarded: points,
    chosen_option: {
      word_pair_id: wordPairId,
      word: word,
      selected_char2: selectedChar2
    }
  })

  if (error) {
    console.error('[wordPairService] Failed to record attempt:', error)
    throw new Error(`Failed to record practice event: ${error.message}`)
  }
}

// =============================================================================
// COMPLETE ROUND FLOW
// =============================================================================

/**
 * Fetch eligible pairs and generate a round in one call.
 *
 * @param kidId - The kid's ID
 * @param conflictLookup - Optional pre-fetched comprehensive conflict set.
 *   When provided, avoids re-fetching the full word pair table.
 *   When absent, fetches it internally via fetchWordPairConflictSet().
 * @throws InsufficientPairsError if not enough pairs
 */
export async function fetchAndGenerateRound(
  kidId: string,
  conflictLookup?: Set<string>
): Promise<WordMatchRoundData> {
  // Fetch eligible pairs and (if needed) the comprehensive conflict set in parallel
  const [eligiblePairs, comprehensiveLookup] = await Promise.all([
    fetchEligibleWordPairs(kidId),
    conflictLookup ? Promise.resolve(conflictLookup) : fetchWordPairConflictSet()
  ])

  if (eligiblePairs.length < MIN_PAIRS_FOR_ROUND) {
    throw new InsufficientPairsError(
      `Only ${eligiblePairs.length} eligible word pairs found. ` +
      `Need at least ${MIN_PAIRS_FOR_ROUND} to play Word Match.`
    )
  }

  const roundPairs = generateRound(eligiblePairs, comprehensiveLookup)
  return buildRoundDisplayData(roundPairs)
}
