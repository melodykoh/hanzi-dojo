// Structured Error Types for Hanzi Dojo

/**
 * Base error class for pronunciation validation errors
 */
export class PronunciationValidationError extends Error {
  constructor(
    public readonly entryId: string | undefined,
    public readonly field: 'primary' | 'manual' | 'dictionary' | 'variant',
    public readonly data: unknown,
    public readonly reason: string
  ) {
    super(`[PronunciationValidation] ${field}: ${reason}`)
    this.name = 'PronunciationValidationError'
  }
}

/**
 * Development-only logger that wraps validation errors
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
