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
      return {
        bg: 'bg-gradient-to-br from-ninja-gold to-ninja-gold-dark',
        border: 'border-4 border-yellow-600',
        badgeBg: 'bg-ninja-green',
        badgeBorder: 'border-4 border-green-700',
        shimmer: true,
        glow: '' // Removed element-energy to fix animation conflict with spinjitzu-spin
      }
    } else if (points === 0.5) {
      // Energy (partial success)
      return {
        bg: 'bg-gradient-to-br from-ninja-green to-ninja-green-dark',
        border: 'border-4 border-green-700',
        badgeBg: 'bg-ninja-yellow',
        badgeBorder: 'border-4 border-yellow-600',
        shimmer: false,
        glow: ''
      }
    } else {
      // Learning (no points)
      return {
        bg: 'bg-gradient-to-br from-ninja-orange to-ninja-red',
        border: 'border-4 border-red-700',
        badgeBg: 'bg-ninja-gray',
        badgeBorder: 'border-4 border-ninja-black',
        shimmer: false,
        glow: ''
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
        ${style.glow}
        animate-spinjitzu
        rounded-xl
      `}
      >
        {/* Golden shimmer effect for perfect scores */}
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
