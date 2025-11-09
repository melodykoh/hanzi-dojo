import { supabase } from './supabase'
import { ZhuyinSyllable } from '../types'

/**
 * Dictionary Logger
 * 
 * Logs missing dictionary entries and lookup failures to help expand the dictionary seed.
 */

interface MissingEntryLog {
  simp: string
  trad?: string
  zhuyin?: ZhuyinSyllable[]
  pinyin?: string
}

class DictionaryLogger {
  private loggedEntries: Set<string>

  constructor() {
    this.loggedEntries = new Set()
  }

  /**
   * Log a missing dictionary entry
   * Only logs each unique simplified character once per session
   */
  async logMissingEntry(entry: MissingEntryLog): Promise<void> {
    // Don't log duplicates in same session
    if (this.loggedEntries.has(entry.simp)) {
      console.log(`[Dictionary Logger] Already logged "${entry.simp}" this session, skipping...`)
      return
    }

    console.log(`[Dictionary Logger] Logging missing entry: "${entry.simp}"`)

    try {
      const { error } = await supabase
        .from('dictionary_missing')
        .insert({
          simp: entry.simp,
          trad: entry.trad || null,
          zhuyin: entry.zhuyin || null,
          pinyin: entry.pinyin || null,
          reported_by: (await supabase.auth.getUser()).data.user?.id || null
        })

      if (error) {
        console.error('[Dictionary Logger] Failed to log missing entry:', error)
      } else {
        this.loggedEntries.add(entry.simp)
        console.log(`[Dictionary Logger] Successfully logged "${entry.simp}"`)
      }
    } catch (err) {
      console.error('[Dictionary Logger] Error logging missing entry:', err)
    }
  }

  /**
   * Get count of logged entries this session
   */
  getSessionLogCount(): number {
    return this.loggedEntries.size
  }

  /**
   * Clear session log (useful for testing)
   */
  clearSessionLog(): void {
    this.loggedEntries.clear()
  }

  /**
   * Get all missing entries from database (admin view)
   * Returns entries sorted by most recent first
   */
  async getMissingEntries(limit: number = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('dictionary_missing')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('[Dictionary Logger] Failed to fetch missing entries:', error)
        return []
      }

      return data || []
    } catch (err) {
      console.error('[Dictionary Logger] Error fetching missing entries:', err)
      return []
    }
  }

  /**
   * Get count of unique missing entries in database
   */
  async getMissingEntriesCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('dictionary_missing')
        .select('simp', { count: 'exact', head: true })

      if (error) {
        console.error('[Dictionary Logger] Failed to count missing entries:', error)
        return 0
      }

      return count || 0
    } catch (err) {
      console.error('[Dictionary Logger] Error counting missing entries:', err)
      return 0
    }
  }
}

// Export singleton instance
export const dictionaryLogger = new DictionaryLogger()
