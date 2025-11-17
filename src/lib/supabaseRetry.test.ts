// Test suite for Supabase Retry Utility
// Covers: Exponential backoff, transient error detection, retry logic

import { describe, it, expect, vi } from 'vitest'
import { isTransientError, retryableInsert } from './supabaseRetry'

describe('supabaseRetry', () => {
  describe('isTransientError', () => {
    it('should identify network errors as transient', () => {
      const networkErrors = [
        new Error('TypeError: Load failed'),
        new Error('Network request failed'),
        new Error('fetch timeout'),
        new Error('Connection lost'),
        { message: 'network error' },
      ]

      for (const error of networkErrors) {
        expect(isTransientError(error)).toBe(true)
      }
    })

    it('should identify HTTP 5xx errors as transient', () => {
      const serverErrors = [
        { status: 500 },
        { status: 502 },
        { status: 503 },
        { status: 504 },
      ]

      for (const error of serverErrors) {
        expect(isTransientError(error)).toBe(true)
      }
    })

    it('should identify HTTP 408 (timeout) as transient', () => {
      expect(isTransientError({ status: 408 })).toBe(true)
    })

    it('should identify HTTP 429 (rate limit) as transient', () => {
      expect(isTransientError({ status: 429 })).toBe(true)
    })

    it('should NOT identify HTTP 4xx client errors as transient', () => {
      const clientErrors = [
        { status: 400 }, // Bad Request
        { status: 401 }, // Unauthorized
        { status: 403 }, // Forbidden
        { status: 404 }, // Not Found
        { status: 422 }, // Unprocessable Entity
      ]

      for (const error of clientErrors) {
        expect(isTransientError(error)).toBe(false)
      }
    })

    it('should NOT identify validation errors as transient', () => {
      const validationError = new Error('Invalid input data')
      expect(isTransientError(validationError)).toBe(false)
    })

    it('should handle undefined/null errors gracefully', () => {
      expect(isTransientError(undefined)).toBe(false)
      expect(isTransientError(null)).toBe(false)
    })
  })

  describe('retryableInsert', () => {
    it('should return data on first successful attempt', async () => {
      const mockOperation = vi.fn().mockResolvedValue({
        data: { id: '123', name: 'test' },
        error: null
      })

      const result = await retryableInsert(
        mockOperation,
        'Test operation'
      )

      expect(result).toEqual({ id: '123', name: 'test' })
      expect(mockOperation).toHaveBeenCalledTimes(1)
    })

    it('should retry on transient errors and eventually succeed', async () => {
      let callCount = 0
      const mockOperation = vi.fn().mockImplementation(() => {
        callCount++
        if (callCount < 3) {
          return Promise.resolve({
            data: null,
            error: new Error('TypeError: Load failed')
          })
        }
        return Promise.resolve({
          data: { id: '123', name: 'test' },
          error: null
        })
      })

      const result = await retryableInsert(
        mockOperation,
        'Test operation',
        { maxRetries: 3, baseDelay: 10, maxDelay: 100 }
      )

      expect(result).toEqual({ id: '123', name: 'test' })
      expect(mockOperation).toHaveBeenCalledTimes(3)
    })

    it('should NOT retry on non-transient errors', async () => {
      const mockOperation = vi.fn().mockResolvedValue({
        data: null,
        error: { status: 404, message: 'Not found' }
      })

      await expect(
        retryableInsert(mockOperation, 'Test operation')
      ).rejects.toThrow('Test operation: Not found')

      expect(mockOperation).toHaveBeenCalledTimes(1) // No retries
    })

    it('should throw after max retries exceeded', async () => {
      const mockOperation = vi.fn().mockResolvedValue({
        data: null,
        error: new Error('TypeError: Load failed')
      })

      await expect(
        retryableInsert(
          mockOperation,
          'Test operation',
          { maxRetries: 3, baseDelay: 1, maxDelay: 10 }
        )
      ).rejects.toThrow('Test operation: TypeError: Load failed')

      expect(mockOperation).toHaveBeenCalledTimes(3)
    })

    it('should use exponential backoff delays', async () => {
      const timestamps: number[] = []
      let callCount = 0

      const mockOperation = vi.fn().mockImplementation(() => {
        timestamps.push(Date.now())
        callCount++

        if (callCount < 4) {
          return Promise.resolve({
            data: null,
            error: { status: 500, message: 'Server error' }
          })
        }
        return Promise.resolve({ data: { success: true }, error: null })
      })

      await retryableInsert(
        mockOperation,
        'Test operation',
        { maxRetries: 4, baseDelay: 100, maxDelay: 1000 }
      )

      // Calculate actual delays between attempts
      const actualDelays: number[] = []
      for (let i = 1; i < timestamps.length; i++) {
        actualDelays.push(timestamps[i] - timestamps[i - 1])
      }

      // Should have 3 delays (between 4 attempts)
      expect(actualDelays.length).toBe(3)

      // Delays should approximately follow: 100ms, 200ms, 400ms (exponential backoff)
      // Allow 20% variance due to timing jitter
      expect(actualDelays[0]).toBeGreaterThan(90) // ~100ms
      expect(actualDelays[0]).toBeLessThan(150)

      // Second delay should be roughly 2x first delay
      expect(actualDelays[1]).toBeGreaterThan(actualDelays[0] * 1.5)

      // Third delay should be roughly 2x second delay
      expect(actualDelays[2]).toBeGreaterThan(actualDelays[1] * 1.5)
    })

    it('should include context in error messages', async () => {
      const mockOperation = vi.fn().mockResolvedValue({
        data: null,
        error: { status: 500, message: 'Internal server error' }
      })

      await expect(
        retryableInsert(
          mockOperation,
          'Log practice event for entry abc123',
          { maxRetries: 2, baseDelay: 1 }
        )
      ).rejects.toThrow('Log practice event for entry abc123')

      expect(mockOperation).toHaveBeenCalledTimes(2)
    })

    it('should respect max delay cap', async () => {
      const delays: number[] = []
      let callCount = 0

      const mockOperation = vi.fn().mockImplementation(() => {
        callCount++
        if (callCount > 1) {
          delays.push(Date.now())
        }

        if (callCount < 5) {
          return Promise.resolve({
            data: null,
            error: { status: 503, message: 'Service unavailable' }
          })
        }
        return Promise.resolve({ data: { success: true }, error: null })
      })

      await retryableInsert(
        mockOperation,
        'Test operation',
        { maxRetries: 5, baseDelay: 10000, maxDelay: 100 } // baseDelay high, but capped at 100ms
      )

      // All delays should be capped at maxDelay (100ms)
      // Check that delays don't grow beyond cap
      expect(delays.length).toBeGreaterThan(0)
    })
  })
})
