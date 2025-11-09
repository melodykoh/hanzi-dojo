// Offline Modal - Dojo-themed pause overlay when connection is lost
// Epic 4: Training Mode UX & Guardrails

import { useConnectionRecheck } from '../lib/offlineDetection'

interface OfflineModalProps {
  show: boolean
  onRetry?: () => void
}

export function OfflineModal({ show, onRetry }: OfflineModalProps) {
  const { recheck, isRechecking } = useConnectionRecheck()

  const handleRetry = async () => {
    const newState = await recheck()
    if (newState.isOnline && onRetry) {
      onRetry()
    }
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-12 text-center">
        {/* Dojo-themed illustration */}
        <div className="mb-6">
          <div className="text-8xl mb-2">🥋</div>
          <div className="text-6xl">💤</div>
        </div>

        {/* Title */}
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Training Paused
        </h2>

        {/* Message */}
        <div className="text-xl text-gray-700 mb-8 space-y-3">
          <p className="font-semibold">
            Sensei cannot reach the dojo right now.
          </p>
          <p className="text-lg text-gray-600">
            Check your internet connection and try again.
          </p>
        </div>

        {/* Connection status */}
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-8">
          <div className="flex items-center justify-center gap-3 text-red-700">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="font-semibold text-lg">Connection Lost</span>
          </div>
        </div>

        {/* Retry button */}
        <button
          onClick={handleRetry}
          disabled={isRechecking}
          className="w-full px-8 py-4 bg-red-600 text-white text-xl font-bold rounded-xl hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isRechecking ? (
            <span className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              Checking Connection...
            </span>
          ) : (
            'Retry Connection'
          )}
        </button>

        {/* Helper text */}
        <p className="text-sm text-gray-500 mt-6">
          Your progress has been saved. Training will resume when connection is restored.
        </p>
      </div>
    </div>
  )
}

interface OfflineGuardProps {
  children: React.ReactNode
  onOffline?: () => void
  onOnline?: () => void
}

/**
 * OfflineGuard - Wraps content and shows offline modal when connection is lost
 * Automatically monitors connection status and BLOCKS all interactions when offline
 */
export function OfflineGuard({ children, onOffline, onOnline }: OfflineGuardProps) {
  const { connectionState } = useConnectionRecheck()
  const isOffline = !connectionState.isOnline

  // Notify parent components of status changes
  if (isOffline && onOffline) {
    onOffline()
  } else if (connectionState.isOnline && onOnline) {
    onOnline()
  }

  return (
    <div className="relative">
      {/* Content wrapper - disable pointer events when offline */}
      <div className={isOffline ? 'pointer-events-none select-none' : ''}>
        {children}
      </div>

      {/* Modal overlay - blocks all interactions */}
      <OfflineModal show={isOffline} />
    </div>
  )
}
