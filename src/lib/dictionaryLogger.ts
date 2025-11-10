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
   * Check if a string contains only valid Chinese characters
   * Filters out Zhuyin, tone marks, and other test inputs
   */
  private isValidChineseCharacter(text: string): boolean {
    if (!text || text.trim().length === 0) {
      return false
    }

    // Check each character
    for (const char of text) {
      const code = char.charCodeAt(0)
      
      // Allow CJK Unified Ideographs (common Chinese characters)
      // U+4E00 to U+9FFF: Main CJK block
      // U+3400 to U+4DBF: Extension A
      // U+F900 to U+FAFF: Compatibility Ideographs
      const isChineseChar = 
        (code >= 0x4E00 && code <= 0x9FFF) ||
        (code >= 0x3400 && code <= 0x4DBF) ||
        (code >= 0xF900 && code <= 0xFAFF)
      
      // Reject if character is:
      // - Zhuyin/Bopomofo (U+3100 to U+312F)
      // - Tone marks (U+02C9, U+02CA, U+02CB, U+02D9, U+02C7)
      // - Katakana (U+30A0 to U+30FF)
      // - Not a CJK character
      const isZhuyin = code >= 0x3100 && code <= 0x312F
      const isToneMark = [0x02C9, 0x02CA, 0x02CB, 0x02D9, 0x02C7, 0x02C8].includes(code)
      const isKatakana = code >= 0x30A0 && code <= 0x30FF
      
      if (!isChineseChar || isZhuyin || isToneMark || isKatakana) {
        console.log(`[Dictionary Logger] Rejected "${text}" - contains invalid character: "${char}" (U+${code.toString(16).toUpperCase()})`)
        return false
      }
    }

    return true
  }

  /**
   * Log a missing dictionary entry
   * Only logs each unique simplified character once per session
   * Validates that entry contains only Chinese characters (no Zhuyin, test inputs)
   */
  async logMissingEntry(entry: MissingEntryLog): Promise<void> {
    // Validate entry is actual Chinese characters
    if (!this.isValidChineseCharacter(entry.simp)) {
      console.log(`[Dictionary Logger] Skipping invalid entry: "${entry.simp}" (not a Chinese character)`)
      return
    }

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
