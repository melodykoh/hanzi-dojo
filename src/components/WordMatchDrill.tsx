// Word Match Drill (Drill C: 配對高手)
// Match character pairs to form 2-character words

import { useState, useEffect, useCallback, useRef } from 'react'
import type { WordMatchRoundData, WordMatchCard } from '../types'
import {
  fetchAndGenerateRound,
  recordWordMatchAttempt,
  InsufficientPairsError,
  MIN_PAIRS_FOR_ROUND
} from '../lib/wordPairService'
import { formatZhuyinDisplay } from '../lib/zhuyin'

// =============================================================================
// CONSTANTS
// =============================================================================

const PAIRS_PER_ROUND = MIN_PAIRS_FOR_ROUND
const ANIMATION_DELAYS = {
  ROUND_TRANSITION: 1000,
  WRONG_SHAKE: 400,
  REVEAL_CORRECT: 1000,
  POST_REVEAL_TRANSITION: 500,
} as const

// =============================================================================
// TYPES
// =============================================================================

interface WordMatchDrillProps {
  kidId: string
  mockMode?: boolean
  onComplete: (pointsAwarded: number) => void
  onError?: (error: Error) => void
  onExit?: () => void
}

interface MatchState {
  pairId: string
  attemptCount: number // 0, 1, or 2
  isMatched: boolean
  points: number
}

interface CompletedWord {
  word: string
  pairId: string
}

// =============================================================================
// COMPONENT
// =============================================================================

export function WordMatchDrill({
  kidId,
  mockMode = false,
  onComplete,
  onError,
  onExit
}: WordMatchDrillProps) {
  // Round state
  const [roundData, setRoundData] = useState<WordMatchRoundData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [roundNumber, setRoundNumber] = useState(1)

  // Selection state
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null)
  const [matchStates, setMatchStates] = useState<Map<string, MatchState>>(new Map())
  const [completedWords, setCompletedWords] = useState<CompletedWord[]>([])

  // Session state
  const [sessionPoints, setSessionPoints] = useState(0)
  const [matchedCount, setMatchedCount] = useState(0)

  // Animation state
  const [wrongCardId, setWrongCardId] = useState<string | null>(null)
  const [revealCorrectId, setRevealCorrectId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Timeout tracking for cleanup on unmount
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([])

  const setTrackedTimeout = (callback: () => void, delay: number) => {
    const timeoutId = setTimeout(callback, delay)
    timeoutRefs.current.push(timeoutId)
    return timeoutId
  }

  // Cleanup timeouts on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(clearTimeout)
    }
  }, [])

  // Load round data
  const loadRound = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await fetchAndGenerateRound(kidId)
      setRoundData(data)

      // Initialize match states
      const states = new Map<string, MatchState>()
      data.pairs.forEach(pair => {
        states.set(pair.id, {
          pairId: pair.id,
          attemptCount: 0,
          isMatched: false,
          points: 0
        })
      })
      setMatchStates(states)
      setMatchedCount(0)
    } catch (error) {
      if (error instanceof InsufficientPairsError) {
        console.warn('[WordMatchDrill] Insufficient pairs:', error.message)
      } else {
        console.error('[WordMatchDrill] Load error:', error)
      }
      if (onError) onError(error as Error)
    } finally {
      setIsLoading(false)
    }
  }, [kidId, onError])

  useEffect(() => {
    loadRound()
  }, [loadRound])

  // Handle left card click
  const handleLeftClick = (card: WordMatchCard) => {
    if (isProcessing) return

    const state = matchStates.get(card.pairId)
    if (state?.isMatched) return // Already matched

    // Toggle or select
    if (selectedLeftId === card.pairId) {
      setSelectedLeftId(null) // Deselect
    } else {
      setSelectedLeftId(card.pairId) // Select new
    }
  }

  // Handle right card click
  const handleRightClick = async (card: WordMatchCard) => {
    if (isProcessing) return
    if (!selectedLeftId) return // Must select left first

    const leftState = matchStates.get(selectedLeftId)
    if (!leftState || leftState.isMatched) return

    setIsProcessing(true)

    const isCorrect = card.pairId === selectedLeftId
    const attemptIndex = (leftState.attemptCount + 1) as 1 | 2

    // Determine points
    let points: 0 | 0.5 | 1.0 = 0
    if (isCorrect) {
      points = attemptIndex === 1 ? 1.0 : 0.5
    }

    // Record attempt (unless mock mode)
    if (!mockMode) {
      const pair = roundData?.pairs.find(p => p.id === selectedLeftId)
      if (pair) {
        try {
          await recordWordMatchAttempt(
            kidId,
            selectedLeftId,
            pair.word,
            card.char,
            attemptIndex,
            isCorrect,
            points
          )
        } catch (error) {
          console.error('[WordMatchDrill] Failed to record attempt:', error)
        }
      }
    }

    if (isCorrect) {
      // Correct match
      const pair = roundData?.pairs.find(p => p.id === selectedLeftId)

      // Update match state
      setMatchStates(prev => {
        const newMap = new Map(prev)
        newMap.set(selectedLeftId, {
          ...leftState,
          attemptCount: attemptIndex,
          isMatched: true,
          points
        })
        return newMap
      })

      // Update session stats
      setSessionPoints(prev => prev + points)
      setMatchedCount(prev => prev + 1)

      // Add to completed words
      if (pair) {
        setCompletedWords(prev => [...prev, { word: pair.word, pairId: pair.id }])
      }

      // Clear selection
      setSelectedLeftId(null)

      // Notify parent
      onComplete(points)

      // Check if round complete - derive count from matchStates (authoritative source)
      // to avoid stale closure issues with matchedCount state
      const currentMatchedCount = Array.from(matchStates.values())
        .filter(s => s.isMatched).length + 1 // +1 for this match
      if (currentMatchedCount >= PAIRS_PER_ROUND) {
        // Auto-advance to next round after delay
        setTrackedTimeout(() => {
          setRoundNumber(prev => prev + 1)
          setCompletedWords([])
          loadRound()
        }, ANIMATION_DELAYS.ROUND_TRANSITION)
      }
    } else {
      // Wrong match
      setWrongCardId(card.pairId)

      if (attemptIndex === 1) {
        // First wrong: allow retry
        setMatchStates(prev => {
          const newMap = new Map(prev)
          newMap.set(selectedLeftId, {
            ...leftState,
            attemptCount: 1
          })
          return newMap
        })

        // Clear wrong indicator after animation
        setTrackedTimeout(() => {
          setWrongCardId(null)
          setIsProcessing(false)
        }, ANIMATION_DELAYS.WRONG_SHAKE)
        return // Don't complete processing yet
      } else {
        // Second wrong: reveal correct, award 0 points
        setRevealCorrectId(selectedLeftId)

        // Update state as matched (with 0 points)
        setMatchStates(prev => {
          const newMap = new Map(prev)
          newMap.set(selectedLeftId, {
            ...leftState,
            attemptCount: 2,
            isMatched: true,
            points: 0
          })
          return newMap
        })

        setMatchedCount(prev => prev + 1)

        // Add to completed words
        const pair = roundData?.pairs.find(p => p.id === selectedLeftId)
        if (pair) {
          setCompletedWords(prev => [...prev, { word: pair.word, pairId: pair.id }])
        }

        // Notify parent
        onComplete(0)

        // Clear after delay
        setTrackedTimeout(() => {
          setWrongCardId(null)
          setRevealCorrectId(null)
          setSelectedLeftId(null)

          // Check if round complete - derive count from matchStates (authoritative source)
          // to avoid stale closure issues with matchedCount state
          const currentMatchedCount = Array.from(matchStates.values())
            .filter(s => s.isMatched).length + 1 // +1 for this match
          if (currentMatchedCount >= PAIRS_PER_ROUND) {
            setTrackedTimeout(() => {
              setRoundNumber(prev => prev + 1)
              setCompletedWords([])
              loadRound()
            }, ANIMATION_DELAYS.POST_REVEAL_TRANSITION)
          }
        }, ANIMATION_DELAYS.REVEAL_CORRECT)
        return
      }
    }

    setIsProcessing(false)
  }

  // Get card class based on state
  const getCardClass = (card: WordMatchCard, isLeftColumn: boolean) => {
    const state = matchStates.get(card.pairId)
    const classes: string[] = [
      'flex flex-col items-center justify-center',
      'p-3 sm:p-4 rounded-xl border-2 cursor-pointer',
      'transition-all duration-200'
    ]

    if (state?.isMatched) {
      classes.push('bg-green-100 border-green-500 opacity-60 cursor-default matched')
      return classes.join(' ')
    }

    if (isLeftColumn && selectedLeftId === card.pairId) {
      classes.push('bg-yellow-100 border-yellow-500 ring-2 ring-yellow-400 selected')
      return classes.join(' ')
    }

    if (!isLeftColumn && wrongCardId === card.pairId) {
      classes.push('bg-red-100 border-red-500 animate-shake wrong')
      return classes.join(' ')
    }

    if (!isLeftColumn && revealCorrectId === card.pairId) {
      classes.push('bg-green-200 border-green-600 ring-2 ring-green-500 reveal-correct')
      return classes.join(' ')
    }

    // Default state
    classes.push('bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50')

    return classes.join(' ')
  }

  // Loading state
  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center h-full"
        data-testid="word-match-drill"
      >
        <div className="text-xl text-gray-600">Loading word pairs...</div>
      </div>
    )
  }

  // No data state
  if (!roundData) {
    return (
      <div
        className="flex flex-col items-center justify-center h-full gap-4"
        data-testid="word-match-drill"
      >
        <div className="text-6xl">📚</div>
        <div className="text-xl text-gray-700">Not enough word pairs</div>
        <p className="text-gray-500 text-center max-w-md">
          Add more characters to unlock Word Match. Need at least {MIN_PAIRS_FOR_ROUND} word pairs.
        </p>
        {onExit && (
          <button
            onClick={onExit}
            className="mt-4 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Return to Dashboard
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      className="flex flex-col h-full"
      data-testid="word-match-drill"
    >
      {/* Header - Match progress and round indicator */}
      <div className="flex items-center justify-between px-4 py-2 bg-black bg-opacity-10">
        <div
          className="text-white font-bold"
          data-testid="round-indicator"
        >
          Round {roundNumber}
        </div>
        <div
          className="text-white font-bold"
          data-testid="match-progress"
        >
          {matchedCount}/{PAIRS_PER_ROUND} matched
        </div>
        <div
          className="text-white font-bold"
          data-testid="session-points"
        >
          {sessionPoints.toFixed(1)} pts
        </div>
      </div>

      {/* Main matching area */}
      <div className="flex-1 flex items-center justify-center gap-4 sm:gap-8 px-4 py-6">
        {/* Left Column */}
        <div
          className="flex flex-col gap-3"
          data-testid="left-column"
        >
          {roundData.leftColumn.map(card => (
            <button
              key={card.pairId}
              data-testid="char-card"
              data-pair-id={card.pairId}
              className={getCardClass(card, true)}
              onClick={() => handleLeftClick(card)}
              disabled={matchStates.get(card.pairId)?.isMatched || isProcessing}
              aria-label={`Character ${card.char}, pronunciation ${formatZhuyinDisplay(card.zhuyin)}`}
              role="button"
            >
              <div className="text-4xl sm:text-5xl font-serif">{card.char}</div>
              <div
                className="text-sm sm:text-base text-gray-600 mt-1"
                data-testid="zhuyin"
              >
                {formatZhuyinDisplay(card.zhuyin)}
              </div>
            </button>
          ))}
        </div>

        {/* Connection indicator */}
        <div className="flex flex-col items-center justify-center text-2xl text-white opacity-50">
          {selectedLeftId ? '→' : '•'}
        </div>

        {/* Right Column */}
        <div
          className="flex flex-col gap-3"
          data-testid="right-column"
        >
          {roundData.rightColumn.map(card => (
            <button
              key={card.pairId}
              data-testid="char-card"
              data-pair-id={card.pairId}
              className={getCardClass(card, false)}
              onClick={() => handleRightClick(card)}
              disabled={matchStates.get(card.pairId)?.isMatched || isProcessing}
              aria-label={`Character ${card.char}, pronunciation ${formatZhuyinDisplay(card.zhuyin)}`}
              role="button"
            >
              <div className="text-4xl sm:text-5xl font-serif">{card.char}</div>
              <div
                className="text-sm sm:text-base text-gray-600 mt-1"
                data-testid="zhuyin"
              >
                {formatZhuyinDisplay(card.zhuyin)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Completed words badges */}
      <div
        className="px-4 py-3 bg-black bg-opacity-10"
        data-testid="matched-words"
      >
        <div className="flex flex-wrap gap-2 justify-center">
          {completedWords.length === 0 ? (
            <span className="text-white opacity-50">Match characters to form words</span>
          ) : (
            completedWords.map(({ word, pairId }) => (
              <span
                key={pairId}
                data-testid="word-badge"
                className="px-3 py-1 bg-green-500 text-white rounded-full font-bold text-lg animate-bounce-in"
              >
                {word}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// Export for testing
export type { WordMatchDrillProps }
