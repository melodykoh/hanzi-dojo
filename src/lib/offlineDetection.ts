// Offline Detection Service
// Epic 4: Training Mode UX & Guardrails
//
// Monitors network connectivity and Supabase connection status
// Provides hooks for components to react to offline/online state

import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

// =============================================================================
// TYPES
// =============================================================================

export type ConnectionStatus = 'online' | 'offline' | 'checking'

export interface ConnectionState {
  status: ConnectionStatus
  isOnline: boolean
  lastChecked: Date | null
  error: Error | null
}

// =============================================================================
// STATE MANAGEMENT
// =============================================================================

// Global connection state
let globalConnectionState: ConnectionState = {
  status: 'checking',
  isOnline: navigator.onLine,
  lastChecked: null,
  error: null
}

// Subscribers to connection state changes
type ConnectionStateListener = (state: ConnectionState) => void
const listeners = new Set<ConnectionStateListener>()

function notifyListeners() {
  listeners.forEach(listener => listener(globalConnectionState))
}

function subscribe(listener: ConnectionStateListener) {
  listeners.add(listener)
  // Immediately notify with current state
  listener(globalConnectionState)

  return () => {
    listeners.delete(listener)
  }
}

// =============================================================================
// CONNECTION CHECKING
// =============================================================================

/**
 * Check Supabase connection by making a simple query
 * Returns true if connected, false otherwise
 */
async function checkSupabaseConnection(): Promise<boolean> {
  try {
    // Try to fetch a single row from dictionary_entries (public read)
    const { error } = await supabase
      .from('dictionary_entries')
      .select('id')
      .limit(1)
      .single()

    // If no error or error is just "no rows", we're connected
    return !error || error.code === 'PGRST116'
  } catch (error) {
    console.error('Supabase connection check failed:', error)
    return false
  }
}

/**
 * Update global connection state
 */
async function updateConnectionState() {
  const browserOnline = navigator.onLine

  if (!browserOnline) {
    // Browser reports offline
    globalConnectionState = {
      status: 'offline',
      isOnline: false,
      lastChecked: new Date(),
      error: new Error('Browser is offline')
    }
    notifyListeners()
    return
  }

  // Browser reports online, but check Supabase
  globalConnectionState = {
    ...globalConnectionState,
    status: 'checking'
  }
  notifyListeners()

  const supabaseOnline = await checkSupabaseConnection()

  globalConnectionState = {
    status: supabaseOnline ? 'online' : 'offline',
    isOnline: supabaseOnline,
    lastChecked: new Date(),
    error: supabaseOnline ? null : new Error('Cannot reach Supabase')
  }
  notifyListeners()
}

// =============================================================================
// BROWSER EVENTS
// =============================================================================

// Listen to browser online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Browser online event')
    updateConnectionState()
  })

  window.addEventListener('offline', () => {
    console.log('Browser offline event')
    updateConnectionState()
  })

  // Initial check
  updateConnectionState()
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * React hook to monitor connection status
 *
 * @param recheckInterval - Optional interval in ms to recheck connection (default: 30000 = 30s)
 * @returns Connection state object
 *
 * @example
 * function MyComponent() {
 *   const { isOnline, status } = useConnectionStatus()
 *
 *   if (!isOnline) {
 *     return <div>You are offline</div>
 *   }
 *
 *   return <div>Connected!</div>
 * }
 */
export function useConnectionStatus(recheckInterval = 30000): ConnectionState {
  const [state, setState] = useState<ConnectionState>(globalConnectionState)

  useEffect(() => {
    // Subscribe to changes
    const unsubscribe = subscribe(setState)

    // Set up periodic recheck
    const intervalId = setInterval(() => {
      updateConnectionState()
    }, recheckInterval)

    return () => {
      unsubscribe()
      clearInterval(intervalId)
    }
  }, [recheckInterval])

  return state
}

/**
 * Get current connection status synchronously
 * Note: This returns cached state. Use updateConnectionState() to refresh.
 */
export function getConnectionStatus(): ConnectionState {
  return globalConnectionState
}

/**
 * Manually trigger a connection check
 * Useful when you want to verify connection before a critical operation
 */
export async function recheckConnection(): Promise<ConnectionState> {
  await updateConnectionState()
  return globalConnectionState
}

/**
 * React hook that provides a recheck function
 * Useful for manual retry scenarios
 */
export function useConnectionRecheck(): {
  connectionState: ConnectionState
  recheck: () => Promise<ConnectionState>
  isRechecking: boolean
} {
  const connectionState = useConnectionStatus(60000) // Check less frequently since we have manual recheck
  const [isRechecking, setIsRechecking] = useState(false)

  const recheck = useCallback(async () => {
    setIsRechecking(true)
    try {
      const newState = await recheckConnection()
      return newState
    } finally {
      setIsRechecking(false)
    }
  }, [])

  return { connectionState, recheck, isRechecking }
}
