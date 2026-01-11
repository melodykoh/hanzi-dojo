// Word Pair Service - Drill C (Word Match) data fetching and round generation

import { supabase } from './supabase'
import type {
  WordPairWithZhuyin,
  WordMatchRoundData,
  WordMatchCard,
  ZhuyinSyllable
} from '../types'

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
 * Requires at least 5 eligible word pairs
 */
export async function canPlayWordMatch(kidId: string): Promise<boolean> {
  try {
    const pairs = await fetchEligibleWordPairs(kidId)
    return pairs.length >= 5
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
// ROUND GENERATION
// =============================================================================

/**
 * Generate a round of 5 word pairs with unique starting characters
 * @throws InsufficientPairsError if not enough unique pairs available
 */
export function generateRound(eligiblePairs: WordPairWithZhuyin[]): WordPairWithZhuyin[] {
  const shuffled = shuffle([...eligiblePairs])

  // Find 5 pairs with unique char1 (no duplicate starting chars)
  const selected: WordPairWithZhuyin[] = []
  const usedChar1 = new Set<string>()

  for (const pair of shuffled) {
    if (!usedChar1.has(pair.char1)) {
      usedChar1.add(pair.char1)
      selected.push(pair)
      if (selected.length === 5) break
    }
  }

  // Error handling: not enough unique pairs
  if (selected.length < 5) {
    throw new InsufficientPairsError(
      `Only found ${selected.length} pairs with unique starting characters. ` +
      `Need at least 5. Kid may need to add more characters.`
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
 * Fetch eligible pairs and generate a round in one call
 * @throws InsufficientPairsError if not enough pairs
 */
export async function fetchAndGenerateRound(kidId: string): Promise<WordMatchRoundData> {
  const eligiblePairs = await fetchEligibleWordPairs(kidId)

  if (eligiblePairs.length < 5) {
    throw new InsufficientPairsError(
      `Only ${eligiblePairs.length} eligible word pairs found. ` +
      `Need at least 5 to play Word Match.`
    )
  }

  const roundPairs = generateRound(eligiblePairs)
  return buildRoundDisplayData(roundPairs)
}
