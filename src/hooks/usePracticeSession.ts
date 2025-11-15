// Custom hook for managing practice session state
// Shared by TrainingMode and PracticeDemo components

import { useState } from 'react'

export function usePracticeSession() {
  const [sessionScore, setSessionScore] = useState(0)
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [sessionTotal, setSessionTotal] = useState(0)
  const [showToast, setShowToast] = useState(false)
  const [toastPoints, setToastPoints] = useState<0 | 0.5 | 1.0>(0)

  const handleCardComplete = (points: number, onAdvance: () => void) => {
    // Update session stats
    setSessionScore(prev => prev + points)
    setSessionTotal(prev => prev + 1)
    if (points > 0) {
      setSessionCorrect(prev => prev + 1)
    }

    // Show toast
    setToastPoints(points as 0 | 0.5 | 1.0)
    setShowToast(true)

    // Callback handles advancement logic (differs between TrainingMode and PracticeDemo)
    onAdvance()
  }

  const resetSession = () => {
    setSessionScore(0)
    setSessionCorrect(0)
    setSessionTotal(0)
  }

  return {
    sessionScore,
    sessionCorrect,
    sessionTotal,
    showToast,
    toastPoints,
    setShowToast,
    handleCardComplete,
    resetSession
  }
}
