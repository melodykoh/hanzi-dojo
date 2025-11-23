// Supabase Retry Utility - Exponential backoff for transient errors

/**
 * Retry Configuration
 */
export interface RetryConfig {
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
}

/**
 * Default retry configuration
 * - 3 retries maximum
 * - 1 second base delay with exponential backoff (1s, 2s, 4s)
 * - 10 second maximum delay cap
 */
const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000 // 10 seconds
}

/**
 * Check if an error is transient and should be retried
 *
 * Transient errors include:
 * - Network failures ("Load failed", "network", "timeout")
 * - HTTP 408 (Request Timeout)
 * - HTTP 429 (Too Many Requests)
 * - HTTP 5xx (Server errors)
 *
 * Non-transient errors (don't retry):
 * - HTTP 400 (Bad Request)
 * - HTTP 401 (Unauthorized)
 * - HTTP 403 (Forbidden)
 * - HTTP 404 (Not Found)
 * - HTTP 422 (Unprocessable Entity)
 */
export function isTransientError(error: any): boolean {
  // Check error message for network-related keywords
  const message = error?.message?.toLowerCase() || ''
  const isNetworkError =
    message.includes('load failed') ||
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('fetch failed') ||
    message.includes('connection')

  if (isNetworkError) return true

  // Check HTTP status codes
  const status = error?.status || error?.code
  if (typeof status === 'number') {
    // Retry on timeout, rate limiting, and server errors
    return status === 408 || status === 429 || (status >= 500 && status < 600)
  }

  // Check Postgres error codes (Supabase uses PostgrestError)
  const code = error?.code
  if (typeof code === 'string') {
    // Connection errors, timeout errors
    if (code.startsWith('08') || code === '57P03') return true
  }

  return false
}

/**
 * Retry a Supabase operation with exponential backoff
 *
 * @param operation - Async function that returns { data, error } (Supabase pattern)
 * @param context - Description of operation for error messages
 * @param config - Retry configuration (optional)
 *
 * @returns Data from successful operation
 * @throws Error with context if all retries fail or error is not transient
 *
 * @example
 * ```typescript
 * const event = await retryableInsert(
 *   () => supabase.from('practice_events').insert({...}).select().single(),
 *   'Log practice event',
 *   { maxRetries: 3 }
 * )
 * ```
 */
export async function retryableInsert<T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  context: string,
  config: RetryConfig = {}
): Promise<T> {
  const { maxRetries, baseDelay, maxDelay } = { ...DEFAULT_RETRY_CONFIG, ...config }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const { data, error } = await operation()

    // Success case
    if (!error && data !== null) {
      return data
    }

    // Error case - check if we should retry
    const shouldRetry = isTransientError(error) && attempt < maxRetries

    if (!shouldRetry) {
      // Non-transient error or final attempt - throw with context
      const errorMessage = error?.message || String(error)
      throw new Error(`${context}: ${errorMessage}`)
    }

    // Transient error - wait before retry
    const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay)
    console.warn(
      `${context}: Transient error (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`,
      { error: error?.message || error }
    )

    await new Promise(resolve => setTimeout(resolve, delay))
  }

  // Should never reach here, but TypeScript needs it
  throw new Error(`${context}: Max retries exceeded`)
}

/**
 * Retry a Supabase update operation with exponential backoff
 *
 * Similar to retryableInsert but optimized for update operations
 *
 * @example
 * ```typescript
 * const state = await retryableUpdate(
 *   () => supabase.from('practice_state').update({...}).eq('id', id).select().single(),
 *   'Update practice state'
 * )
 * ```
 */
export async function retryableUpdate<T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  context: string,
  config: RetryConfig = {}
): Promise<T> {
  // Same implementation as retryableInsert
  return retryableInsert(operation, context, config)
}

/**
 * Retry a Supabase query operation with exponential backoff
 *
 * Similar to retryableInsert but optimized for select queries
 *
 * @example
 * ```typescript
 * const states = await retryableQuery(
 *   () => supabase.from('practice_state').select('*').eq('kid_id', kidId),
 *   'Fetch practice states'
 * )
 * ```
 */
export async function retryableQuery<T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  context: string,
  config: RetryConfig = {}
): Promise<T> {
  // Same implementation as retryableInsert
  return retryableInsert(operation, context, config)
}
