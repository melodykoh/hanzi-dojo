// Structured Error Utilities for Hanzi Dojo

/**
 * Development-only logger for validation errors
 * Logs to console in development, silent in production
 */
export function logValidationError(
  field: 'primary' | 'manual' | 'dictionary' | 'variant',
  data: unknown,
  entryId: string | undefined,
  reason: string
): void {
  if (import.meta.env.DEV) {
    console.error(`[practiceQueueService] Invalid ${field} pronunciation:`, {
      data,
      entryId,
      reason
    })
  }
}

/**
 * Log malformed Migration 009 data detection
 */
export function logMalformedDataDetection(
  simp: string,
  entryId: string,
  syllableCount: number
): void {
  if (import.meta.env.DEV) {
    console.warn('[practiceQueueService] Detected malformed Migration 009 data:', {
      simp,
      entryId,
      syllableCount,
      action: 'Splitting merged pronunciations into separate entries'
    })
  }
}
