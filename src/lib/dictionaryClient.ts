import { supabase } from './supabase'
import { DictionaryLookupResult, DictionaryEntry, PracticeDrill, DRILLS } from '../types'

/**
 * Dictionary Client with In-Memory Caching
 * 
 * Provides fast dictionary lookups with automatic caching and fallback to manual entry.
 * Cache is kept in memory for the session - IndexedDB caching can be added later if needed.
 */

class DictionaryClient {
  private cache: Map<string, DictionaryLookupResult>
  private hitCount: number = 0
  private missCount: number = 0

  constructor() {
    this.cache = new Map()
  }

  /**
   * Look up a single character by simplified form
   * Uses cache first, then calls Supabase RPC
   */
  async lookup(simp: string): Promise<DictionaryLookupResult> {
    // Check cache first
    if (this.cache.has(simp)) {
      this.hitCount++
      console.log(`[Dictionary] Cache HIT for "${simp}" (${this.getHitRate()}% hit rate)`)
      return this.cache.get(simp)!
    }

    // Cache miss - call RPC
    this.missCount++
    console.log(`[Dictionary] Cache MISS for "${simp}" - fetching from Supabase...`)

    try {
      const { data, error } = await supabase.rpc('lookup_dictionary_entry', {
        search_char: simp
      })

      if (error) {
        console.error('[Dictionary] RPC error:', error)
        throw new Error(`Dictionary lookup failed: ${error.message}`)
      }

      const result = data as DictionaryLookupResult

      // Cache the result (even if not found, to avoid repeated lookups)
      this.cache.set(simp, result)

      console.log(`[Dictionary] Lookup complete for "${simp}":`, result.found ? 'FOUND' : 'NOT FOUND')
      
      return result
    } catch (err) {
      console.error('[Dictionary] Lookup error:', err)
      // Return not found on error
      return {
        found: false,
        entry: undefined,
        confusions: undefined
      }
    }
  }

  /**
   * Look up multiple characters at once
   * Uses cache for hits, then batch RPC for all misses in a single request
   */
  async batchLookup(simps: string[]): Promise<DictionaryLookupResult[]> {
    console.log(`[Dictionary] Batch lookup for ${simps.length} characters...`)

    // Separate cached vs uncached characters
    const results: Map<string, DictionaryLookupResult> = new Map()
    const uncachedChars: string[] = []

    for (const simp of simps) {
      if (this.cache.has(simp)) {
        this.hitCount++
        results.set(simp, this.cache.get(simp)!)
      } else {
        uncachedChars.push(simp)
      }
    }

    console.log(`[Dictionary] Cache: ${simps.length - uncachedChars.length} hits, ${uncachedChars.length} misses`)

    // Fetch all uncached characters in a single RPC call
    if (uncachedChars.length > 0) {
      this.missCount += uncachedChars.length

      try {
        const { data, error } = await supabase.rpc('batch_lookup_dictionary_entries', {
          search_chars: uncachedChars
        })

        if (error) {
          console.error('[Dictionary] Batch RPC error:', error)
          // Return not found for all uncached characters on error
          for (const char of uncachedChars) {
            const notFoundResult: DictionaryLookupResult = {
              found: false,
              entry: undefined,
              confusions: undefined
            }
            results.set(char, notFoundResult)
            this.cache.set(char, notFoundResult)
          }
        } else {
          // Map RPC results back to characters
          const rpcResults = (data?.results || []) as DictionaryLookupResult[]

          for (let i = 0; i < uncachedChars.length; i++) {
            const char = uncachedChars[i]
            const result = rpcResults[i] || {
              found: false,
              entry: undefined,
              confusions: undefined
            }
            results.set(char, result)
            this.cache.set(char, result)
          }
        }
      } catch (err) {
        console.error('[Dictionary] Batch lookup error:', err)
        // Return not found for all uncached characters on error
        for (const char of uncachedChars) {
          const notFoundResult: DictionaryLookupResult = {
            found: false,
            entry: undefined,
            confusions: undefined
          }
          results.set(char, notFoundResult)
        }
      }
    }

    // Return results in the original order
    const orderedResults = simps.map(simp => results.get(simp)!)

    const foundCount = orderedResults.filter(r => r.found).length
    console.log(`[Dictionary] Batch lookup complete: ${foundCount}/${simps.length} found (${this.getHitRate()}% hit rate)`)

    return orderedResults
  }

  /**
   * Check if a character exists in the dictionary (lightweight check)
   */
  async exists(simp: string): Promise<boolean> {
    const result = await this.lookup(simp)
    return result.found
  }

  /**
   * Get dictionary statistics (hit rate, cache size)
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: this.getHitRate(),
      totalLookups: this.hitCount + this.missCount
    }
  }

  /**
   * Calculate cache hit rate as percentage
   */
  private getHitRate(): number {
    const total = this.hitCount + this.missCount
    if (total === 0) return 0
    return Math.round((this.hitCount / total) * 100)
  }

  /**
   * Clear the cache (useful for testing or memory management)
   */
  clearCache() {
    console.log(`[Dictionary] Clearing cache (${this.cache.size} entries)`)
    this.cache.clear()
    this.hitCount = 0
    this.missCount = 0
  }

  /**
   * Pre-warm the cache with common characters
   * Call this on app initialization for better UX
   */
  async prewarmCache(characters: string[]) {
    console.log(`[Dictionary] Pre-warming cache with ${characters.length} characters...`)
    await this.batchLookup(characters)
    console.log(`[Dictionary] Cache pre-warmed: ${this.cache.size} entries cached`)
  }
}

// Export singleton instance
export const dictionaryClient = new DictionaryClient()

/**
 * Utility function: Determine applicable drills based on entry data
 */
export function determineApplicableDrills(entry: DictionaryEntry): PracticeDrill[] {
  const drills: PracticeDrill[] = []

  // Drill A (Zhuyin) - always applicable if zhuyin present
  if (entry.zhuyin && entry.zhuyin.length > 0) {
    drills.push(DRILLS.ZHUYIN)
  }

  // Drill B (Traditional) - only if Simplified ≠ Traditional
  if (entry.simp !== entry.trad) {
    drills.push(DRILLS.TRAD)
  }

  return drills
}

/**
 * Utility function: Check if character has multiple readings
 */
export function hasMultipleReadings(entry: DictionaryEntry): boolean {
  return !!(entry.zhuyin_variants && entry.zhuyin_variants.length > 0)
}
