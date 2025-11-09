// Feedback Toast - Scoring feedback UI with Sensei messages

import { useEffect, useState } from 'react'

// =============================================================================
// TYPES
// =============================================================================

export interface FeedbackToastProps {
  show: boolean
  points: 0 | 0.5 | 1.0
  message: string
  duration?: number
  onHide?: () => void
}

// =============================================================================
// SENSEI MESSAGES
// =============================================================================

const SENSEI_MESSAGES = {
  firstTry: [
    'Perfect form!',
    'Excellent focus!',
    'The Sensei nods in approval.',
    'Your strokes are strong!',
    'Well done, student!'
  ],
  secondTry: [
    'Good recovery.',
    'Better with practice.',
    'You found the way.',
    'Persistence pays off.',
    'Every stroke improves.'
  ],
  miss: [
    'The Sensei shows you the way.',
    'We learn through practice.',
    'Study this form carefully.',
    'Every master was once a beginner.',
    'Return to this character.'
  ]
}

function getRandomMessage(points: 0 | 0.5 | 1.0): string {
  if (points === 1.0) {
    const messages = SENSEI_MESSAGES.firstTry
    return messages[Math.floor(Math.random() * messages.length)]
  } else if (points === 0.5) {
    const messages = SENSEI_MESSAGES.secondTry
    return messages[Math.floor(Math.random() * messages.length)]
  } else {
    const messages = SENSEI_MESSAGES.miss
    return messages[Math.floor(Math.random() * messages.length)]
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

export function FeedbackToast({
  show,
  points,
  message,
  duration = 2000,
  onHide
}: FeedbackToastProps) {
  const [visible, setVisible] = useState(false)
  
  useEffect(() => {
    if (show) {
      setVisible(true)
      
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
  
  const bgColor = points === 1.0 ? 'bg-green-500' : points === 0.5 ? 'bg-yellow-500' : 'bg-orange-500'
  const senseiMessage = message || getRandomMessage(points)
  
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce-in">
      <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-4 min-w-[320px]`}>
        {/* Points Badge */}
        <div className="text-4xl font-bold">
          {points === 1.0 && '+1.0'}
          {points === 0.5 && '+0.5'}
          {points === 0 && '0'}
        </div>
        
        {/* Message */}
        <div className="flex-1">
          <div className="text-lg font-semibold">{senseiMessage}</div>
          <div className="text-sm opacity-90">{points} point{points !== 1 ? 's' : ''} earned</div>
        </div>
        
        {/* Sensei Icon (placeholder - can be replaced with actual mascot) */}
        <div className="text-3xl">🥋</div>
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
        message=""
        onHide={() => setShow(false)}
      />
    </div>
  )
}
