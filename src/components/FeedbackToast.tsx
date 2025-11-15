// Feedback Toast - Scoring feedback UI with Sensei messages

import { useEffect, useState } from 'react'

// =============================================================================
// TYPES
// =============================================================================

export interface FeedbackToastProps {
  show: boolean
  points: 0 | 0.5 | 1.0
  duration?: number
  onHide?: () => void
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * FeedbackToast - Animated success/failure feedback using Ninjago Spinjitzu theme
 *
 * IMPORTANT IMPLEMENTATION DETAILS:
 * - Uses increment counter key to force fresh CSS animation on each show
 * - Session 12 bug fix: Do NOT apply multiple CSS animations to same element
 * - Previously had `element-energy` glow + `spinjitzu-spin` on same element causing conflicts
 * - Solution: Removed `element-energy` animation, kept only `spinjitzu-spin` on container
 *
 * ANIMATION STRATEGY:
 * - `animationKey` increments on each show, forcing React to remount the DOM element
 * - Fresh DOM element ensures CSS animation plays from start every time
 * - Without key increment, subsequent shows would reuse same element with completed animation
 *
 * SCORING DESIGN:
 * - 1.0 points (first try): Golden Power theme with star, shimmer effect
 * - 0.5 points (second try): Energy theme with sparkles, green gradient
 * - 0 points (miss): Learning theme with book icon, orange-red gradient
 *
 * @param show - Whether to display toast (triggers animation when true)
 * @param points - Score: 1.0 (perfect/first try), 0.5 (second try), 0 (miss/try again)
 * @param duration - Display duration in milliseconds (default 2500ms)
 * @param onHide - Callback when toast auto-hides after duration
 *
 * @example
 * ```tsx
 * <FeedbackToast
 *   show={showToast}
 *   points={1.0}
 *   duration={2500}
 *   onHide={() => setShowToast(false)}
 * />
 * ```
 */
export function FeedbackToast({
  show,
  points,
  duration = 2500,
  onHide
}: FeedbackToastProps) {
  const [visible, setVisible] = useState(false)
  const [animationKey, setAnimationKey] = useState(0)

  useEffect(() => {
    if (show) {
      setVisible(true)
      setAnimationKey(prev => prev + 1)

      const timer = setTimeout(() => {
        setVisible(false)
        if (onHide) onHide()
      }, duration)

      return () => clearTimeout(timer)
    } else {
      setVisible(false)
    }
  }, [show, duration, onHide])

  if (!visible) return null

  // Elemental styling based on points
  const getElementalStyle = () => {
    if (points === 1.0) {
      // Ultimate Golden Power
      // ANIMATION SAFETY: Using animate-spinjitzu + golden-shimmer (pseudo-element)
      // This is SAFE because golden-shimmer uses ::before, not the animation property
      return {
        bg: 'bg-gradient-to-br from-ninja-gold to-ninja-gold-dark',
        border: 'border-4 border-yellow-600',
        badgeBg: 'bg-ninja-green',
        badgeBorder: 'border-4 border-green-700',
        shimmer: true,
        animation: 'animate-spinjitzu' // Single animation class only
      }
    } else if (points === 0.5) {
      // Energy (partial success)
      return {
        bg: 'bg-gradient-to-br from-ninja-green to-ninja-green-dark',
        border: 'border-4 border-green-700',
        badgeBg: 'bg-ninja-yellow',
        badgeBorder: 'border-4 border-yellow-600',
        shimmer: false,
        animation: 'animate-spinjitzu' // Single animation class only
      }
    } else {
      // Learning (no points)
      return {
        bg: 'bg-gradient-to-br from-ninja-orange to-ninja-red',
        border: 'border-4 border-red-700',
        badgeBg: 'bg-ninja-gray',
        badgeBorder: 'border-4 border-ninja-black',
        shimmer: false,
        animation: 'animate-spinjitzu' // Single animation class only
      }
    }
  }

  const style = getElementalStyle()

  return (
    <div key={animationKey} className="fixed top-4 left-0 right-0 z-50 flex justify-center">
      <div
        className={`
        ${style.bg} ${style.border}
        text-white px-8 py-6 shadow-2xl
        flex items-center gap-6 min-w-[380px]
        relative overflow-hidden
        ${style.animation}
        rounded-xl
      `}
      >
        {/* Golden shimmer effect for perfect scores
            ANIMATION SAFETY: golden-shimmer uses ::before pseudo-element,
            safe to combine with any .animate-* class! */}
        {style.shimmer && (
          <div className="golden-shimmer" />
        )}

        {/* Points Badge - Circular with elemental glow */}
        <div className={`
          ${style.badgeBg} ${style.badgeBorder}
          w-20 h-20 rounded-full
          flex items-center justify-center
          text-3xl font-black text-white
          shadow-inner
          relative z-10
        `}>
          {points === 1.0 && '⭐'}
          {points === 0.5 && '✨'}
          {points === 0 && '📖'}
        </div>

        {/* Message */}
        <div className="flex-1 relative z-10">
          <div className="text-2xl font-heading font-black drop-shadow-lg uppercase tracking-wide">
            {points === 1.0 && 'PERFECT!'}
            {points === 0.5 && 'GOOD!'}
            {points === 0 && 'KEEP GOING!'}
          </div>
          <div className="text-lg font-bold mt-1 drop-shadow-md">
            {points === 1.0 && '+1.0 Points'}
            {points === 0.5 && '+0.5 Points'}
            {points === 0 && 'Try Again'}
          </div>
        </div>

        {/* Ninja icon */}
        <div className="text-5xl relative z-10 drop-shadow-lg">
          {points === 1.0 && '👑'}
          {points === 0.5 && '🥋'}
          {points === 0 && '📚'}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// USAGE EXAMPLE
// =============================================================================

export function FeedbackToastDemo() {
  const [show, setShow] = useState(false)
  const [points, setPoints] = useState<0 | 0.5 | 1.0>(1.0)
  
  const triggerToast = (p: 0 | 0.5 | 1.0) => {
    setPoints(p)
    setShow(true)
  }
  
  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Feedback Toast Demo</h2>
      
      <div className="flex gap-4">
        <button
          onClick={() => triggerToast(1.0)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          First Try Success (+1.0)
        </button>
        <button
          onClick={() => triggerToast(0.5)}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Second Try Success (+0.5)
        </button>
        <button
          onClick={() => triggerToast(0)}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Miss (0)
        </button>
      </div>
      
      <FeedbackToast
        show={show}
        points={points}
        onHide={() => setShow(false)}
      />
    </div>
  )
}
