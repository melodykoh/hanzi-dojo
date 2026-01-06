// Struggling Characters Modal - Ninjago Fire Theme
// Displays characters that need attention (consecutive_miss_count >= 2)

import { useEffect, useRef, useCallback } from 'react'

export interface StrugglingCharacter {
  entry_id: string
  simplified: string
  traditional: string
  zhuyin: string
  consecutive_miss_count: number
  last_practiced_at: string | null
}

interface Props {
  isOpen: boolean
  onClose: () => void
  drill: 'drill_a' | 'drill_b'
  characters: StrugglingCharacter[]
  isLoading?: boolean
}

export function StrugglingCharactersModal({
  isOpen,
  onClose,
  drill,
  characters,
  isLoading = false
}: Props) {
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Focus trap and escape key handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
    // Simple focus trap - cycle between close button and modal
    if (e.key === 'Tab' && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return

    // Focus close button when modal opens
    closeButtonRef.current?.focus()

    // Prevent body scroll
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  const drillLabel = drill === 'drill_a'
    ? 'Drill A: Zhuyin Recognition'
    : 'Drill B: Simplified → Traditional'

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      {/* Backdrop with fire gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-ninja-black/90 via-ninja-red-dark/30 to-ninja-black/90"
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="struggling-modal-title"
        aria-describedby="struggling-modal-desc"
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-md max-h-[85vh] flex flex-col bg-ninja-white rounded-lg overflow-hidden shadow-2xl border-2 border-ninja-red"
        style={{
          boxShadow: '0 0 40px rgba(249, 0, 0, 0.3), 0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header - Fire themed */}
        <div className="relative bg-gradient-to-r from-ninja-red to-ninja-red-dark p-4 sm:p-5">
          {/* Angular pattern overlay */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(0,0,0,0.15) 8px, rgba(0,0,0,0.15) 16px)'
            }}
            aria-hidden="true"
          />

          <div className="relative flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2
                id="struggling-modal-title"
                className="font-heading text-lg sm:text-xl text-white tracking-wide flex items-center gap-2"
              >
                <span className="text-xl sm:text-2xl" aria-hidden="true">⚔️</span>
                <span>Needs Training</span>
              </h2>
              <p
                id="struggling-modal-desc"
                className="text-ninja-white/80 text-xs sm:text-sm mt-1 truncate"
              >
                {drillLabel}
              </p>
            </div>

            {/* Close button - 44px touch target */}
            <button
              ref={closeButtonRef}
              onClick={onClose}
              aria-label="Close modal"
              className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-lg bg-ninja-black/30 hover:bg-ninja-black/50 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-ninja-red"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gradient-to-b from-ninja-white to-gray-50">
          {isLoading ? (
            <LoadingState />
          ) : characters.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="space-y-2 sm:space-y-3" role="list">
              {characters.map((char, index) => (
                <li
                  key={char.entry_id}
                  className="group relative bg-white rounded-lg border-2 border-ninja-red/20 hover:border-ninja-red/40 transition-all duration-200 overflow-hidden"
                  style={{
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  {/* Severity indicator bar */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-ninja-red to-ninja-orange"
                    style={{
                      opacity: Math.min(0.4 + (char.consecutive_miss_count * 0.15), 1)
                    }}
                    aria-hidden="true"
                  />

                  <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 pl-4 sm:pl-5">
                    {/* Character display - drill-specific layout */}
                    {drill === 'drill_a' ? (
                      /* Drill A: Simplified (test) + Zhuyin (answer) prominent */
                      <>
                        <div className="flex-shrink-0 flex flex-col items-center min-w-[60px]">
                          <span
                            className="text-4xl sm:text-5xl font-bold text-ninja-black leading-none"
                            lang="zh"
                          >
                            {char.simplified}
                          </span>
                          {char.traditional !== char.simplified && (
                            <span
                              className="text-sm text-ninja-gray/50 mt-1"
                              lang="zh"
                            >
                              {char.traditional}
                            </span>
                          )}
                        </div>

                        {/* Zhuyin (answer) - prominent for Drill A */}
                        <div className="flex-1 min-w-0">
                          <div className="text-2xl sm:text-3xl text-ninja-blue font-bold tracking-wide">
                            {char.zhuyin || '—'}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                            <span className="text-ninja-red font-semibold">
                              {char.consecutive_miss_count} miss{char.consecutive_miss_count !== 1 ? 'es' : ''}
                            </span>
                            <span className="hidden xs:inline">•</span>
                            <span className="text-gray-400">
                              {formatDate(char.last_practiced_at)}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      /* Drill B: Simplified (test) + Traditional (answer) prominent */
                      <>
                        <div className="flex-shrink-0 flex flex-col items-center min-w-[60px]">
                          <span
                            className="text-4xl sm:text-5xl font-bold text-ninja-black leading-none"
                            lang="zh"
                          >
                            {char.simplified}
                          </span>
                        </div>

                        {/* Traditional (answer) - prominent for Drill B */}
                        <div className="flex-shrink-0 flex flex-col items-center min-w-[60px]">
                          <span
                            className="text-4xl sm:text-5xl font-bold text-ninja-red leading-none"
                            lang="zh"
                          >
                            {char.traditional}
                          </span>
                        </div>

                        {/* Zhuyin - secondary for Drill B */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm sm:text-base text-ninja-gray/70 font-medium">
                            {char.zhuyin || '—'}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                            <span className="text-ninja-red font-semibold">
                              {char.consecutive_miss_count} miss{char.consecutive_miss_count !== 1 ? 'es' : ''}
                            </span>
                            <span className="hidden xs:inline">•</span>
                            <span className="text-gray-400">
                              {formatDate(char.last_practiced_at)}
                            </span>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Severity badge */}
                    <div
                      className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-ninja-red/10 flex items-center justify-center"
                      aria-label={`Severity: ${char.consecutive_miss_count} consecutive misses`}
                    >
                      <span className="text-ninja-red font-bold text-sm sm:text-base">
                        {char.consecutive_miss_count}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-3 sm:p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-gray-500">
              {characters.length > 0 && (
                <>
                  <span className="font-medium text-ninja-red">{characters.length}</span>
                  {' character'}{characters.length !== 1 ? 's' : ''}{' need review'}
                </>
              )}
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-ninja-gray text-white font-semibold rounded-lg hover:bg-ninja-black transition-colors focus:outline-none focus:ring-2 focus:ring-ninja-gray focus:ring-offset-2 min-h-[44px]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-ninja-red/20 border-t-ninja-red animate-spin" />
      </div>
      <p className="mt-4 text-ninja-gray font-medium">Loading characters...</p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
      <div
        className="w-16 h-16 rounded-full bg-ninja-green/10 flex items-center justify-center mb-4"
        aria-hidden="true"
      >
        <span className="text-3xl">🎯</span>
      </div>
      <h3 className="font-heading text-lg text-ninja-green tracking-wide">
        All Clear!
      </h3>
      <p className="mt-2 text-sm text-gray-600 max-w-xs">
        No struggling characters. Your training is going well!
      </p>
    </div>
  )
}
