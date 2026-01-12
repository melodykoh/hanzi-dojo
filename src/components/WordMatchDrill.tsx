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

interface SelectedCard {
  pairId: string
  side: 'left' | 'right'
}

interface LineCoords {
  x1: number
  y1: number
  x2: number
  y2: number
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function calculateLineCoords(
  leftCard: HTMLButtonElement,
  rightCard: HTMLButtonElement,
  container: HTMLDivElement
): LineCoords {
  const containerRect = container.getBoundingClientRect()
  const leftRect = leftCard.getBoundingClientRect()
  const rightRect = rightCard.getBoundingClientRect()

  return {
    x1: leftRect.right - containerRect.left,
    y1: leftRect.top + leftRect.height / 2 - containerRect.top,
    x2: rightRect.left - containerRect.left,
    y2: rightRect.top + rightRect.height / 2 - containerRect.top,
  }
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

  // Selection state - now supports either column being selected first
  const [selectedCard, setSelectedCard] = useState<SelectedCard | null>(null)
  const [matchStates, setMatchStates] = useState<Map<string, MatchState>>(new Map())
  const [completedWords, setCompletedWords] = useState<CompletedWord[]>([])

  // Connected pairs for drawing lines
  const [connectedPairs, setConnectedPairs] = useState<string[]>([])

  // Session state
  const [sessionPoints, setSessionPoints] = useState(0)
  const [matchedCount, setMatchedCount] = useState(0)

  // Animation state
  const [wrongCardId, setWrongCardId] = useState<string | null>(null)
  const [revealCorrectId, setRevealCorrectId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Refs for SVG line drawing
  const containerRef = useRef<HTMLDivElement>(null)
  const leftCardRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const rightCardRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  // Timeout tracking for cleanup on unmount
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([])

  // Ref to prevent mid-round reloading (fixes shuffle bug)
  const isRoundActiveRef = useRef(false)

  // Ref to stabilize onError callback (prevents useCallback dep changes)
  const onErrorRef = useRef(onError)
  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  // Force re-render for SVG lines when cards change position
  const [, forceUpdate] = useState({})

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
    // Prevent mid-round reloading (fixes shuffle bug)
    if (isRoundActiveRef.current) {
      return
    }

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
      setConnectedPairs([])
      setSelectedCard(null)

      // Mark round as active to prevent reloading
      isRoundActiveRef.current = true
    } catch (error) {
      if (error instanceof InsufficientPairsError) {
        console.warn('[WordMatchDrill] Insufficient pairs:', error.message)
      } else {
        console.error('[WordMatchDrill] Load error:', error)
      }
      // Use ref to call onError without adding it to dependencies
      if (onErrorRef.current) onErrorRef.current(error as Error)
    } finally {
      setIsLoading(false)
    }
  }, [kidId]) // Removed onError from deps - using ref instead

  useEffect(() => {
    loadRound()
  }, [loadRound])

  // Update SVG lines when layout changes
  useEffect(() => {
    if (connectedPairs.length > 0) {
      // Small delay to ensure DOM has updated
      const timeoutId = setTimeout(() => forceUpdate({}), 50)
      return () => clearTimeout(timeoutId)
    }
  }, [connectedPairs, matchedCount])

  // Handle card click - unified handler for both columns
  const handleCardClick = (card: WordMatchCard, side: 'left' | 'right') => {
    if (isProcessing) return

    const state = matchStates.get(card.pairId)
    if (state?.isMatched) return // Already matched

    if (!selectedCard) {
      // First selection - can be either column
      setSelectedCard({ pairId: card.pairId, side })
    } else if (selectedCard.pairId === card.pairId && selectedCard.side === side) {
      // Clicking same card - deselect
      setSelectedCard(null)
    } else if (selectedCard.side === side) {
      // Same column - switch selection
      setSelectedCard({ pairId: card.pairId, side })
    } else {
      // Different columns - check for match
      checkMatch(selectedCard.pairId, card.pairId, card)
    }
  }

  // Check if two cards match
  const checkMatch = async (firstPairId: string, secondPairId: string, clickedCard: WordMatchCard) => {
    const firstState = matchStates.get(firstPairId)
    if (!firstState || firstState.isMatched) return

    setIsProcessing(true)

    const isCorrect = firstPairId === secondPairId
    const attemptIndex = (firstState.attemptCount + 1) as 1 | 2

    // Determine points
    let points: 0 | 0.5 | 1.0 = 0
    if (isCorrect) {
      points = attemptIndex === 1 ? 1.0 : 0.5
    }

    // Record attempt (unless mock mode)
    if (!mockMode) {
      const pair = roundData?.pairs.find(p => p.id === firstPairId)
      if (pair) {
        try {
          await recordWordMatchAttempt(
            kidId,
            firstPairId,
            pair.word,
            clickedCard.char,
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
      const pair = roundData?.pairs.find(p => p.id === firstPairId)

      // Update match state
      setMatchStates(prev => {
        const newMap = new Map(prev)
        newMap.set(firstPairId, {
          ...firstState,
          attemptCount: attemptIndex,
          isMatched: true,
          points
        })
        return newMap
      })

      // Update session stats
      setSessionPoints(prev => prev + points)
      setMatchedCount(prev => prev + 1)

      // Add to connected pairs (for drawing lines)
      setConnectedPairs(prev => [...prev, firstPairId])

      // Add to completed words
      if (pair) {
        setCompletedWords(prev => [...prev, { word: pair.word, pairId: pair.id }])
      }

      // Clear selection
      setSelectedCard(null)

      // Notify parent
      onComplete(points)

      // Check if round complete - derive count from matchStates (authoritative source)
      const currentMatchedCount = Array.from(matchStates.values())
        .filter(s => s.isMatched).length + 1 // +1 for this match
      if (currentMatchedCount >= PAIRS_PER_ROUND) {
        // Auto-advance to next round after delay
        setTrackedTimeout(() => {
          setRoundNumber(prev => prev + 1)
          setCompletedWords([])
          setConnectedPairs([])
          // Reset the flag to allow loading next round
          isRoundActiveRef.current = false
          loadRound()
        }, ANIMATION_DELAYS.ROUND_TRANSITION)
      }

      setIsProcessing(false)
    } else {
      // Wrong match
      setWrongCardId(secondPairId)

      if (attemptIndex === 1) {
        // First wrong: allow retry
        setMatchStates(prev => {
          const newMap = new Map(prev)
          newMap.set(firstPairId, {
            ...firstState,
            attemptCount: 1
          })
          return newMap
        })

        // Clear wrong indicator after animation
        setTrackedTimeout(() => {
          setWrongCardId(null)
          setIsProcessing(false)
        }, ANIMATION_DELAYS.WRONG_SHAKE)
      } else {
        // Second wrong: reveal correct, award 0 points
        setRevealCorrectId(firstPairId)

        // Update state as matched (with 0 points)
        setMatchStates(prev => {
          const newMap = new Map(prev)
          newMap.set(firstPairId, {
            ...firstState,
            attemptCount: 2,
            isMatched: true,
            points: 0
          })
          return newMap
        })

        setMatchedCount(prev => prev + 1)

        // Add to connected pairs (for drawing lines)
        setConnectedPairs(prev => [...prev, firstPairId])

        // Add to completed words
        const pair = roundData?.pairs.find(p => p.id === firstPairId)
        if (pair) {
          setCompletedWords(prev => [...prev, { word: pair.word, pairId: pair.id }])
        }

        // Notify parent
        onComplete(0)

        // Clear after delay
        setTrackedTimeout(() => {
          setWrongCardId(null)
          setRevealCorrectId(null)
          setSelectedCard(null)

          // Check if round complete
          const currentMatchedCount = Array.from(matchStates.values())
            .filter(s => s.isMatched).length + 1 // +1 for this match
          if (currentMatchedCount >= PAIRS_PER_ROUND) {
            setTrackedTimeout(() => {
              setRoundNumber(prev => prev + 1)
              setCompletedWords([])
              setConnectedPairs([])
              // Reset the flag to allow loading next round
              isRoundActiveRef.current = false
              loadRound()
            }, ANIMATION_DELAYS.POST_REVEAL_TRANSITION)
          } else {
            setIsProcessing(false)
          }
        }, ANIMATION_DELAYS.REVEAL_CORRECT)
      }
    }
  }

  // Get card class based on state
  const getCardClass = (card: WordMatchCard, side: 'left' | 'right') => {
    const state = matchStates.get(card.pairId)
    const isSelected = selectedCard?.pairId === card.pairId && selectedCard?.side === side

    const classes: string[] = [
      'flex flex-col items-center justify-center',
      'p-3 sm:p-4 rounded-xl border-2 cursor-pointer',
      'transition-all duration-200',
      'relative z-10' // Ensure cards are above SVG lines
    ]

    if (state?.isMatched) {
      classes.push('bg-green-500 border-green-600 text-white cursor-default matched')
      return classes.join(' ')
    }

    if (isSelected) {
      classes.push('bg-yellow-100 border-yellow-500 ring-2 ring-yellow-400 selected')
      return classes.join(' ')
    }

    if (wrongCardId === card.pairId) {
      classes.push('bg-red-100 border-red-500 animate-shake wrong')
      return classes.join(' ')
    }

    if (revealCorrectId === card.pairId) {
      classes.push('bg-green-200 border-green-600 ring-2 ring-green-500 reveal-correct')
      return classes.join(' ')
    }

    // Default state - blue cards like in the demo
    classes.push('bg-blue-500 border-blue-600 text-white hover:bg-blue-400')

    return classes.join(' ')
  }

  // Get text color for zhuyin based on card state
  const getZhuyinClass = (card: WordMatchCard) => {
    const state = matchStates.get(card.pairId)
    if (state?.isMatched) {
      return 'text-green-100'
    }
    return 'text-blue-100'
  }

  // Render SVG lines connecting matched pairs
  const renderConnectingLines = () => {
    if (!containerRef.current || connectedPairs.length === 0) return null

    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 5 }}
      >
        {connectedPairs.map(pairId => {
          const leftCard = leftCardRefs.current.get(pairId)
          const rightCard = rightCardRefs.current.get(pairId)
          if (!leftCard || !rightCard || !containerRef.current) return null

          const coords = calculateLineCoords(leftCard, rightCard, containerRef.current)
          return (
            <line
              key={pairId}
              x1={coords.x1}
              y1={coords.y1}
              x2={coords.x2}
              y2={coords.y2}
              stroke="#22c55e"
              strokeWidth="3"
              strokeLinecap="round"
            />
          )
        })}
      </svg>
    )
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
          回合 {roundNumber}
        </div>
        <div
          className="text-white font-bold"
          data-testid="match-progress"
        >
          配對: {matchedCount}/{PAIRS_PER_ROUND}
        </div>
        <div
          className="text-white font-bold"
          data-testid="session-points"
        >
          {sessionPoints.toFixed(1)} 分
        </div>
      </div>

      {/* Instruction */}
      <div className="text-center text-white py-2 text-sm sm:text-base">
        點一個字，再點另一個字來配對！
      </div>

      {/* Main matching area */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center gap-6 sm:gap-12 px-4 py-4 relative"
      >
        {/* SVG lines connecting matched pairs */}
        {renderConnectingLines()}

        {/* Left Column */}
        <div
          className="flex flex-col gap-3"
          data-testid="left-column"
        >
          {roundData.leftColumn.map(card => (
            <button
              key={card.pairId}
              ref={el => {
                if (el) leftCardRefs.current.set(card.pairId, el)
              }}
              data-testid="char-card"
              data-pair-id={card.pairId}
              className={getCardClass(card, 'left')}
              onClick={() => handleCardClick(card, 'left')}
              disabled={matchStates.get(card.pairId)?.isMatched || isProcessing}
              aria-label={`Character ${card.char}, pronunciation ${formatZhuyinDisplay(card.zhuyin)}`}
              role="button"
            >
              <div className="text-4xl sm:text-5xl font-serif">{card.char}</div>
              <div
                className={`text-sm sm:text-base mt-1 ${getZhuyinClass(card)}`}
                data-testid="zhuyin"
              >
                {formatZhuyinDisplay(card.zhuyin)}
              </div>
            </button>
          ))}
        </div>

        {/* Right Column */}
        <div
          className="flex flex-col gap-3"
          data-testid="right-column"
        >
          {roundData.rightColumn.map(card => (
            <button
              key={card.pairId}
              ref={el => {
                if (el) rightCardRefs.current.set(card.pairId, el)
              }}
              data-testid="char-card"
              data-pair-id={card.pairId}
              className={getCardClass(card, 'right')}
              onClick={() => handleCardClick(card, 'right')}
              disabled={matchStates.get(card.pairId)?.isMatched || isProcessing}
              aria-label={`Character ${card.char}, pronunciation ${formatZhuyinDisplay(card.zhuyin)}`}
              role="button"
            >
              <div className="text-4xl sm:text-5xl font-serif">{card.char}</div>
              <div
                className={`text-sm sm:text-base mt-1 ${getZhuyinClass(card)}`}
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
            <span className="text-white opacity-50">配對字卡組成詞語</span>
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
