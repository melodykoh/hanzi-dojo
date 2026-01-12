// Training Mode - Full-screen landscape-optimized practice for kids
// Epic 4: Training Mode UX & Guardrails
// Epic: Drill C (Word Match) integration

import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PracticeCard } from './PracticeCard'
import { WordMatchDrill } from './WordMatchDrill'
import { FeedbackToast } from './FeedbackToast'
import { OfflineGuard } from './OfflineModal'
import type { QueueEntry } from '../lib/practiceQueueService'
import type { PracticeDrill } from '../types'
import { DRILLS } from '../types'
import { fetchPracticeQueue } from '../lib/practiceQueueService'
import { supabase } from '../lib/supabase'
import { usePracticeSession } from '../hooks/usePracticeSession'

/**
 * TrainingMode - Full-screen landscape-optimized practice mode for kids
 *
 * CORE FEATURES:
 * - Fetches practice queue (20 items) ordered by familiarity/struggle state
 * - Supports drill switching (A: Zhuyin recognition, B: Simplified→Traditional)
 * - Session stats tracking (score, accuracy, progress)
 * - Auto-generated session summary on completion/exit
 *
 * UX DESIGN PHILOSOPHY:
 * - Parent supervision assumed (no passcode needed for exit)
 * - Simple "Exit Training" button returns to dashboard
 * - Offline detection pauses training with themed modal
 * - Landscape-optimized for tablets (full-screen experience)
 *
 * DRILL FLOW:
 * 1. Load practice queue from Supabase (fetchPracticeQueue)
 * 2. Render current drill question (PracticeCard)
 * 3. Capture answer and update stats (handleCardComplete)
 * 4. Show feedback toast (1.0/0.5/0 points)
 * 5. Move to next question automatically
 * 6. Display summary modal when queue exhausted or user exits
 *
 * STATE MANAGEMENT:
 * - currentDrill: 'zhuyin' | 'trad' (from URL params or switcher)
 * - currentQueue: Array of 20 practice entries
 * - currentIndex: Position in queue (0-19)
 * - Session stats: Delegated to usePracticeSession hook (shared with Practice Demo)
 *
 * DRILL SWITCHING:
 * - URL param ?drill=zhuyin or ?drill=trad (from Dashboard selection modal)
 * - In-session switcher buttons reload queue for new drill type
 * - Switching resets queue to index 0 (fresh start)
 *
 * EXIT BEHAVIOR:
 * - If sessionTotal > 0: Show summary modal first
 * - If sessionTotal === 0: Exit directly to dashboard (no summary needed)
 * - Summary modal offers "Continue Training" or "Exit to Dashboard"
 *
 * OFFLINE HANDLING:
 * - OfflineGuard wrapper monitors navigator.onLine + Supabase connectivity
 * - Training pauses automatically when offline (dojo-themed modal)
 * - Resumes when connection restored
 *
 * RELATED COMPONENTS:
 * @see PracticeCard - Renders individual drill questions with options
 * @see FeedbackToast - Shows animated scoring feedback
 * @see OfflineGuard - Network connectivity monitoring wrapper
 * @see fetchPracticeQueue - Supabase service to fetch ordered practice items
 * @see usePracticeSession - Shared hook for session stats (score, accuracy, toast state)
 *
 * EPIC CONTEXT:
 * - Epic 4: Training Mode UX & Guardrails
 * - Epic 5.5: Drill selection modal before training
 * - Session 8-12: Mobile polish, exit summary, offline detection
 */
export function TrainingMode() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Get drill from URL params (Epic 5.5 - drill selection modal)
  const drillParam = searchParams.get('drill') as PracticeDrill | null
  const [currentDrill, setCurrentDrill] = useState<PracticeDrill>(drillParam || DRILLS.ZHUYIN)

  // Use shared practice session hook
  const {
    sessionScore,
    sessionCorrect,
    sessionTotal,
    showToast,
    toastPoints,
    setShowToast,
    handleCardComplete: handleCardCompleteBase
  } = usePracticeSession()

  const [currentQueue, setCurrentQueue] = useState<QueueEntry[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [kidId, setKidId] = useState<string | null>(null)
  const [showSummary, setShowSummary] = useState(false)

  // Fetch practice queue from Supabase (for Drills A/B only)
  // Drill C (Word Match) manages its own data loading via WordMatchDrill component
  useEffect(() => {
    async function loadData() {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          console.log('No authenticated user')
          setIsLoading(false)
          return
        }

        // Get kid for this user
        const { data: kids, error: kidsError } = await supabase
          .from('kids')
          .select('*')
          .eq('owner_id', user.id)
          .limit(1)

        if (kidsError) throw kidsError
        if (!kids || kids.length === 0) {
          console.log('No kids found')
          setIsLoading(false)
          return
        }

        const kid = kids[0]
        setKidId(kid.id)

        // Drill C (Word Match) manages its own queue internally
        if (currentDrill === DRILLS.WORD_MATCH) {
          setCurrentQueue([]) // Empty queue signals WordMatchDrill to handle its own data
          setIsLoading(false)
          return
        }

        // Fetch practice queue (20 items for longer sessions) for Drills A/B
        const queue = await fetchPracticeQueue(kid.id, currentDrill, 20)

        setCurrentQueue(queue)
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to load practice data:', error)
        setIsLoading(false)
      }
    }

    loadData()
  }, [currentDrill])

  // Update drill if URL param changes (Epic 5.5)
  useEffect(() => {
    if (drillParam) {
      setCurrentDrill(drillParam)
    }
  }, [drillParam])

  const handleCardComplete = (points: number) => {
    handleCardCompleteBase(points, () => {
      // Drill C (Word Match) manages its own rounds internally - don't show summary here
      if (currentDrill === DRILLS.WORD_MATCH) {
        return // WordMatchDrill handles round progression
      }

      // Move to next question immediately (CSS animations are independent of React state)
      if (currentIndex + 1 < currentQueue.length) {
        setCurrentIndex(prev => prev + 1)
      } else {
        // Session complete
        setShowSummary(true)
      }
    })
  }

  const handleError = (error: Error) => {
    console.error('Practice card error:', error)
    alert(`Error: ${error.message}`)
  }

  const exitTraining = () => {
    // If user has started practicing, show summary first
    if (sessionTotal > 0) {
      setShowSummary(true)
    } else {
      // If no practice done yet, exit directly
      navigate('/')
    }
  }

  const exitToDashboard = () => {
    // Always exit to dashboard (used by summary modal buttons)
    navigate('/')
  }

  const continuePracticing = () => {
    // Just close the summary and continue from current index
    setShowSummary(false)
  }

  // Get current queue entry
  const currentEntry = currentQueue[currentIndex]

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-r from-ninja-red-dark via-ninja-red to-ninja-orange flex items-center justify-center">
        <div className="text-white text-3xl font-bold">Loading practice...</div>
      </div>
    )
  }

  // No data state (only for Drills A/B - Drill C handles its own empty state)
  if (currentQueue.length === 0 && currentDrill !== DRILLS.WORD_MATCH) {
    return (
      <div className="fixed inset-0 bg-gradient-to-r from-ninja-red-dark via-ninja-red to-ninja-orange flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl mx-4 text-center">
          <div className="text-8xl mb-6">📚</div>
          <h2 className="font-heading text-4xl text-gray-900 mb-4">No Practice Items</h2>
          <p className="text-xl text-gray-600 mb-8">
            Ask your parent to add some characters to practice!
          </p>
          <button
            onClick={exitToDashboard}
            className="ninja-button ninja-button-fire"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <OfflineGuard>
      <div className="fixed inset-0 bg-gradient-to-r from-ninja-red-dark via-ninja-red to-ninja-orange overflow-auto">
      {/* Top Bar - Fixed position for Exit button and stats */}
      <div className="fixed top-0 left-0 right-0 bg-black bg-opacity-20 backdrop-blur-sm z-10">
        <div className="w-full mx-auto px-3 py-3">
          {/* Row 1: Exit Button and Drill Switcher */}
          <div className="flex items-center justify-between mb-3">
            {/* Exit Button */}
            <button
              onClick={exitTraining}
              className="px-4 py-2 bg-white text-red-700 font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-lg text-sm sm:text-base"
            >
              ← Exit<span className="hidden sm:inline"> Training</span>
            </button>

            {/* Drill Switcher */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setCurrentDrill(DRILLS.ZHUYIN)
                  setCurrentIndex(0)
                }}
                className={`px-3 py-2 rounded-lg font-bold transition-colors text-sm sm:text-base ${
                  currentDrill === DRILLS.ZHUYIN
                    ? 'bg-white text-red-700 shadow-lg'
                    : 'bg-ninja-red text-white hover:bg-ninja-red-dark'
                }`}
              >
                Drill A
              </button>
              <button
                onClick={() => {
                  setCurrentDrill(DRILLS.TRAD)
                  setCurrentIndex(0)
                }}
                className={`px-3 py-2 rounded-lg font-bold transition-colors text-sm sm:text-base ${
                  currentDrill === DRILLS.TRAD
                    ? 'bg-white text-red-700 shadow-lg'
                    : 'bg-ninja-red text-white hover:bg-ninja-red-dark'
                }`}
              >
                Drill B
              </button>
              <button
                onClick={() => {
                  setCurrentDrill(DRILLS.WORD_MATCH)
                  setCurrentIndex(0)
                }}
                className={`px-3 py-2 rounded-lg font-bold transition-colors text-sm sm:text-base ${
                  currentDrill === DRILLS.WORD_MATCH
                    ? 'bg-white text-red-700 shadow-lg'
                    : 'bg-ninja-red text-white hover:bg-ninja-red-dark'
                }`}
              >
                Drill C
              </button>
            </div>
          </div>

          {/* Row 2: Session Stats */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 text-white">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold">{sessionScore.toFixed(1)}</div>
              <div className="text-xs opacity-90">Points</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold">
                {sessionTotal > 0 ? Math.round((sessionCorrect / sessionTotal) * 100) : 0}%
              </div>
              <div className="text-xs opacity-90">Accuracy</div>
            </div>
            {currentDrill !== DRILLS.WORD_MATCH ? (
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold">
                  {currentIndex + 1}/{currentQueue.length}
                </div>
                <div className="text-xs opacity-90">Progress</div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold">--</div>
                <div className="text-xs opacity-90">Progress</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Practice Area - Centered vertically and horizontally */}
      <div className="min-h-screen flex items-center justify-center pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        {!showSummary && currentDrill === DRILLS.WORD_MATCH && kidId ? (
          // Drill C: Word Match - Self-managed component
          <div className="w-full max-w-4xl h-[70vh]">
            <WordMatchDrill
              kidId={kidId}
              onComplete={handleCardComplete}
              onError={handleError}
              onExit={exitTraining}
            />
          </div>
        ) : !showSummary && currentEntry ? (
          // Drills A/B: Character-based practice
          <div className="w-full max-w-6xl lg:max-w-7xl">
            <PracticeCard
              key={`${currentEntry.entry.id}-${currentIndex}-${currentDrill}`}
              queueEntry={currentEntry}
              drill={currentDrill}
              kidId={kidId || 'unknown'}
              onComplete={handleCardComplete}
              onError={handleError}
              mockMode={false}
            />
          </div>
        ) : null}
      </div>

      {/* Session Summary Modal */}
      {showSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl mx-4">
            <div className="text-center">
              <div className="text-8xl mb-6">🎉</div>
              <h2 className="font-heading text-5xl mb-3">Amazing Work!</h2>
              <p className="text-2xl text-gray-600 mb-8">
                Sensei is proud of your training today.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <span className="text-xl font-semibold text-gray-700">Total Points</span>
                  <span className="text-4xl font-bold text-blue-600">{sessionScore.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <span className="text-xl font-semibold text-gray-700">Accuracy</span>
                  <span className="text-4xl font-bold text-green-600">
                    {sessionTotal > 0 ? Math.round((sessionCorrect / sessionTotal) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <span className="text-xl font-semibold text-gray-700">Correct Answers</span>
                  <span className="text-4xl font-bold text-gray-700">{sessionCorrect}/{sessionTotal}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={continuePracticing}
                  className="flex-1 px-8 py-4 bg-blue-500 text-white text-xl font-bold rounded-xl hover:bg-blue-600 transition-colors"
                >
                  Continue Training
                </button>
                <button
                  onClick={exitToDashboard}
                  className="flex-1 ninja-button ninja-button-fire"
                >
                  Exit to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Toast */}
      <FeedbackToast
        show={showToast}
        points={toastPoints}
        onHide={() => setShowToast(false)}
      />
      </div>
    </OfflineGuard>
  )
}
