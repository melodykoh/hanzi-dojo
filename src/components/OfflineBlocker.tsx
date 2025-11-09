// Offline Blocker - Disables actions when offline
// Epic 4: Training Mode UX & Guardrails

import { useConnectionStatus } from '../lib/offlineDetection'

interface OfflineBlockerProps {
  children: (props: { isOffline: boolean; disabled: boolean }) => React.ReactNode
  showMessage?: boolean
}

/**
 * OfflineBlocker - Provides offline state to child render function
 * Allows components to conditionally disable or show messaging when offline
 *
 * @example
 * <OfflineBlocker>
 *   {({ disabled }) => (
 *     <button disabled={disabled}>Add Item</button>
 *   )}
 * </OfflineBlocker>
 */
export function OfflineBlocker({ children, showMessage = true }: OfflineBlockerProps) {
  const { isOnline } = useConnectionStatus()
  const isOffline = !isOnline

  return (
    <div className="relative">
      {children({ isOffline, disabled: isOffline })}

      {showMessage && isOffline && (
        <div className="absolute -bottom-2 left-0 right-0 translate-y-full z-10">
          <div className="bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm mt-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="font-semibold">Offline:</span>
            <span>This action requires an internet connection</span>
          </div>
        </div>
      )}
    </div>
  )
}

interface OfflineAwareButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  offlineMessage?: string
  showOfflineMessage?: boolean
}

/**
 * OfflineAwareButton - Button that automatically disables when offline
 *
 * @example
 * <OfflineAwareButton
 *   onClick={handleAddItem}
 *   className="bg-blue-500 text-white px-4 py-2 rounded"
 * >
 *   Add Item
 * </OfflineAwareButton>
 */
export function OfflineAwareButton({
  children,
  offlineMessage = 'This action requires an internet connection',
  showOfflineMessage = true,
  disabled,
  className = '',
  ...props
}: OfflineAwareButtonProps) {
  const { isOnline } = useConnectionStatus()
  const isOffline = !isOnline
  const isDisabled = disabled || isOffline

  return (
    <div className="relative inline-block">
      <button
        {...props}
        disabled={isDisabled}
        className={`${className} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {children}
      </button>

      {showOfflineMessage && isOffline && (
        <div className="absolute -bottom-2 left-0 right-0 translate-y-full z-10 whitespace-nowrap">
          <div className="bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm mt-2 flex items-center gap-2 shadow-lg">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0"></div>
            <span className="font-semibold">Offline:</span>
            <span>{offlineMessage}</span>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Connection Status Badge - Shows current connection status
 * Useful for dashboards and admin pages
 */
export function ConnectionStatusBadge() {
  const { status, isOnline, lastChecked } = useConnectionStatus()

  if (status === 'checking') {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 border border-gray-300 text-gray-700 rounded-full text-sm">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        <span className="font-semibold">Checking...</span>
      </div>
    )
  }

  if (!isOnline) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 border border-red-300 text-red-700 rounded-full text-sm">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        <span className="font-semibold">Offline</span>
        {lastChecked && (
          <span className="text-xs opacity-75">
            (checked {new Date(lastChecked).toLocaleTimeString()})
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 border border-green-300 text-green-700 rounded-full text-sm">
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      <span className="font-semibold">Online</span>
    </div>
  )
}
