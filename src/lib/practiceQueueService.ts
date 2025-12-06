// Practice Queue Service - Fetches and orders entries for drill practice

import { supabase } from './supabase'
import type {
  Entry,
  PracticeState,
  PracticeDrill,
  Reading,
  ZhuyinSyllable,
  ZhuyinVariant
} from '../types'
import { DRILLS } from '../types'
import { isDrillKnown, computeFamiliarity } from './practiceStateService'
import { serializePronunciation } from './zhuyinUtils'

// =============================================================================
// TYPES
// =============================================================================

export interface QueueEntry {
  entry: Entry
  reading: Reading
  practiceState: PracticeState | null
  priority: number
  priorityReason: string
  familiarity: number
  isKnown: boolean
  allPronunciations: ZhuyinSyllable[][]
}

interface PronunciationRow {
  entry_id: string
  simp: string
  dictionary_zhuyin: ZhuyinSyllable[] | null
  dictionary_variants: ZhuyinVariant[] | null
  manual_readings: ZhuyinSyllable[][] | null
}

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validate Zhuyin syllable structure.
 * Each syllable must be [initial, final, tone] with valid tone marker.
 *
 * @param syllable - The syllable to validate
 * @returns true if syllable is valid ZhuyinSyllable structure
 */
function validateZhuyinSyllable(syllable: any): syllable is ZhuyinSyllable {
  return (
    Array.isArray(syllable) &&
    syllable.length === 3 &&
    typeof syllable[0] === 'string' &&  // initial (can be empty)
    typeof syllable[1] === 'string' &&  // final
    typeof syllable[2] === 'string' &&  // tone
    ['ˉ', 'ˊ', 'ˇ', 'ˋ', '˙', ''].includes(syllable[2]) // valid tones
  )
}

/**
 * Validate complete pronunciation (array of syllables).
 *
 * @param pronunciation - The pronunciation to validate
 * @returns true if pronunciation is valid array of ZhuyinSyllables
 */
function validatePronunciation(pronunciation: any): pronunciation is ZhuyinSyllable[] {
  return (
    Array.isArray(pronunciation) &&
    pronunciation.length > 0 &&
    pronunciation.every(validateZhuyinSyllable)
  )
}

// =============================================================================
// PRONUNCIATION DEDUPLICATION
// =============================================================================

function dedupePronunciations(pronunciations: ZhuyinSyllable[][]): ZhuyinSyllable[][] {
  const seen = new Set<string>()
  const result: ZhuyinSyllable[][] = []

  for (const zhuyin of pronunciations) {
    if (!zhuyin || zhuyin.length === 0) continue
    const key = serializePronunciation(zhuyin)
    if (seen.has(key)) continue
    seen.add(key)
    result.push(zhuyin)
  }

  return result
}

function buildPronunciationList(
  primary: ZhuyinSyllable[] | undefined,
  row?: PronunciationRow
): ZhuyinSyllable[][] {
  const collected: ZhuyinSyllable[][] = []

  // Validate primary reading
  if (primary && validatePronunciation(primary)) {
    collected.push(primary)
  } else if (primary) {
    console.error('[practiceQueueService] Invalid primary pronunciation:', {
      primary,
      entryId: row?.entry_id,
      reason: 'Failed validation - malformed syllable structure or invalid tone marker'
    })
  }

  // Validate manual readings
  if (row?.manual_readings) {
    for (const manual of row.manual_readings) {
      if (validatePronunciation(manual)) {
        collected.push(manual)
      } else {
        console.error('[practiceQueueService] Invalid manual reading:', {
          manual,
          entryId: row.entry_id,
          reason: 'Failed validation - malformed syllable structure or invalid tone marker'
        })
      }
    }
  }

  // Validate dictionary zhuyin
  // DEFENSIVE: Detect Migration 009 malformed data where multiple pronunciations
  // were merged as syllables instead of stored in zhuyin_variants
  if (row?.dictionary_zhuyin) {
    const charCount = row.simp ? [...row.simp].length : 1
    const syllableCount = row.dictionary_zhuyin.length

    // Malformed data: single character with multiple "syllables" = merged pronunciations
    if (charCount === 1 && syllableCount > 1) {
      console.warn('[practiceQueueService] Detected malformed Migration 009 data - splitting merged pronunciations:', {
        simp: row.simp,
        entryId: row.entry_id,
        syllableCount
      })
      // Treat each syllable as a separate single-syllable pronunciation
      for (const syllable of row.dictionary_zhuyin) {
        if (validateZhuyinSyllable(syllable)) {
          collected.push([syllable])
        }
      }
    } else if (validatePronunciation(row.dictionary_zhuyin)) {
      collected.push(row.dictionary_zhuyin)
    } else {
      console.error('[practiceQueueService] Invalid dictionary zhuyin:', {
        dictionary_zhuyin: row.dictionary_zhuyin,
        entryId: row.entry_id,
        reason: 'Failed validation - malformed syllable structure or invalid tone marker'
      })
    }
  }

  // Validate dictionary variants
  if (row?.dictionary_variants) {
    for (const variant of row.dictionary_variants) {
      if (variant.zhuyin && validatePronunciation(variant.zhuyin)) {
        collected.push(variant.zhuyin)
      } else if (variant.zhuyin) {
        console.error('[practiceQueueService] Invalid dictionary variant:', {
          variant,
          entryId: row.entry_id,
          reason: 'Failed validation - malformed syllable structure or invalid tone marker'
        })
      }
    }
  }

  return dedupePronunciations(collected)
}

// =============================================================================
// PRIORITY COMPUTATION
// =============================================================================

/**
 * Calculate priority score for queue ordering
 * Lower score = higher priority (should be practiced sooner)
 * 
 * Priority tiers:
 * 1. Never practiced (null last_attempt_at)
 * 2. Struggling (consecutive_miss_count > 0)
 * 3. Not known yet (total successes < 2)
 * 4. Known (total successes >= 2 and consecutive_miss_count < 2)
 */
export function calculatePriority(state: PracticeState | null): {
  priority: number
  reason: string
} {
  if (!state) {
    return { priority: 1000, reason: 'Never practiced' }
  }
  
  const totalSuccesses = state.first_try_success_count + state.second_try_success_count
  const isKnown = isDrillKnown(state)
  
  // Struggling items (highest priority)
  if (state.consecutive_miss_count > 0) {
    const missScore = state.consecutive_miss_count * 100
    const recencyScore = state.last_attempt_at
      ? Date.now() - new Date(state.last_attempt_at).getTime()
      : 0
    return {
      priority: 2000 + missScore + recencyScore / 1000000, // Recent misses prioritized
      reason: `Struggling (${state.consecutive_miss_count} consecutive misses)`
    }
  }
  
  // Not known yet (medium priority)
  if (!isKnown) {
    const recencyScore = state.last_attempt_at
      ? new Date(state.last_attempt_at).getTime()
      : 0
    return {
      priority: 3000 + recencyScore / 1000000, // Older attempts prioritized
      reason: `Not known (${totalSuccesses} successes, need 2+)`
    }
  }
  
  // Known items (lowest priority)
  const recencyScore = state.last_success_at
    ? new Date(state.last_success_at).getTime()
    : 0
  return {
    priority: 4000 + recencyScore / 1000000, // Older known items reviewed occasionally
    reason: `Known (${totalSuccesses} successes)`
  }
}

// =============================================================================
// QUEUE FETCHING
// =============================================================================

/**
 * Fetch practice queue for a specific drill
 * Returns entries ordered by priority (highest priority first)
 */
export async function fetchPracticeQueue(
  kidId: string,
  drill: PracticeDrill,
  limit?: number
): Promise<QueueEntry[]> {
  // Fetch all entries that support this drill
  const { data: entries, error: entriesError } = await supabase
    .from('entries')
    .select('*')
    .eq('kid_id', kidId)
    .contains('applicable_drills', [drill])
    .order('created_at', { ascending: false })
  
  if (entriesError) throw entriesError
  if (!entries || entries.length === 0) return []
  
  // Fetch readings for all entries
  const entryIds = entries.map(e => e.id)
  const { data: readings, error: readingsError } = await supabase
    .from('readings')
    .select('*')
    .in('entry_id', entryIds)
  
  if (readingsError) throw readingsError
  
  // Group readings by entry (handle locked_reading_id)
  const readingsByEntry = new Map<string, Reading>()
  for (const entry of entries) {
    if (entry.locked_reading_id) {
      const locked = readings?.find(r => r.id === entry.locked_reading_id)
      if (locked) readingsByEntry.set(entry.id, locked)
    } else {
      const first = readings?.find(r => r.entry_id === entry.id)
      if (first) readingsByEntry.set(entry.id, first)
    }
  }
  
  // Fetch practice states for this drill
  const { data: states, error: statesError } = await supabase
    .from('practice_state')
    .select('*')
    .eq('kid_id', kidId)
    .eq('drill', drill)
    .in('entry_id', entryIds)
  
  if (statesError) throw statesError

  // Fetch canonical pronunciations (dictionary + manual variants)
  let pronunciationRows: PronunciationRow[] = []
  if (entryIds.length > 0) {
    try {
      const { data, error } = await supabase.rpc('rpc_get_entry_pronunciations', {
        entry_ids: entryIds
      })
      if (error) throw error
      pronunciationRows = (data || []) as PronunciationRow[]
    } catch (rpcError) {
      console.error('Failed to load pronunciation variants', rpcError)
      pronunciationRows = []
    }
  }

  const pronunciationsByEntry = new Map(
    pronunciationRows.map(row => [row.entry_id, row])
  )
  
  // Build queue entries
  const statesByEntry = new Map(states?.map(s => [s.entry_id, s]) || [])
  const queue: QueueEntry[] = []
  
  for (const entry of entries) {
    const reading = readingsByEntry.get(entry.id)
    if (!reading) continue // Skip entries without readings
    
    const state = statesByEntry.get(entry.id) || null
    const { priority, reason } = calculatePriority(state)
    const familiarity = state ? computeFamiliarity(state) : 0
    const isKnown = state ? isDrillKnown(state) : false
    
    queue.push({
      entry,
      reading,
      practiceState: state,
      priority,
      priorityReason: reason,
      familiarity,
      isKnown,
      allPronunciations: buildPronunciationList(
        reading.zhuyin,
        pronunciationsByEntry.get(entry.id)
      )
    })
  }
  
  // Sort by priority (lower number = higher priority)
  queue.sort((a, b) => a.priority - b.priority)
  
  // Apply limit if specified
  if (limit) {
    return queue.slice(0, limit)
  }
  
  return queue
}

/**
 * Fetch next practice item for a drill
 */
export async function fetchNextPracticeItem(
  kidId: string,
  drill: PracticeDrill
): Promise<QueueEntry | null> {
  const queue = await fetchPracticeQueue(kidId, drill, 1)
  return queue[0] || null
}

// =============================================================================
// QUEUE ANALYTICS
// =============================================================================

/**
 * Get queue statistics for a drill
 */
export async function getQueueStats(
  kidId: string,
  drill: PracticeDrill
): Promise<{
  total: number
  neverPracticed: number
  struggling: number
  notKnown: number
  known: number
}> {
  const queue = await fetchPracticeQueue(kidId, drill)
  
  const stats = {
    total: queue.length,
    neverPracticed: 0,
    struggling: 0,
    notKnown: 0,
    known: 0
  }
  
  for (const item of queue) {
    if (!item.practiceState) {
      stats.neverPracticed++
    } else if (item.practiceState.consecutive_miss_count > 0) {
      stats.struggling++
    } else if (!item.isKnown) {
      stats.notKnown++
    } else {
      stats.known++
    }
  }
  
  return stats
}

/**
 * Get combined queue across all drills
 * Useful for dashboard "next items to practice" view
 */
export async function fetchCombinedQueue(
  kidId: string,
  limit: number = 10
): Promise<Array<QueueEntry & { drill: PracticeDrill }>> {
  const drills: PracticeDrill[] = [DRILLS.ZHUYIN, DRILLS.TRAD]
  const allQueues: Array<QueueEntry & { drill: PracticeDrill }> = []
  
  for (const drill of drills) {
    const queue = await fetchPracticeQueue(kidId, drill)
    for (const item of queue) {
      allQueues.push({ ...item, drill })
    }
  }
  
  // Sort by priority across all drills
  allQueues.sort((a, b) => a.priority - b.priority)
  
  return allQueues.slice(0, limit)
}

// =============================================================================
// FILTER UTILITIES
// =============================================================================

/**
 * Filter queue to only show struggling items
 */
export function filterStruggling(queue: QueueEntry[]): QueueEntry[] {
  return queue.filter(
    item => item.practiceState && item.practiceState.consecutive_miss_count > 0
  )
}

/**
 * Filter queue to only show new/never practiced items
 */
export function filterNeverPracticed(queue: QueueEntry[]): QueueEntry[] {
  return queue.filter(item => !item.practiceState)
}

/**
 * Filter queue to only show not-yet-known items
 */
export function filterNotKnown(queue: QueueEntry[]): QueueEntry[] {
  return queue.filter(item => !item.isKnown)
}

/**
 * Filter queue by school week
 */
export function filterByWeek(queue: QueueEntry[], week: string): QueueEntry[] {
  return queue.filter(item => item.entry.school_week === week)
}

/**
 * Filter queue by grade level
 */
export function filterByGrade(queue: QueueEntry[], grade: string): QueueEntry[] {
  return queue.filter(item => item.entry.grade_label === grade)
}
