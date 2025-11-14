// Training Mode - Full-screen landscape-optimized practice for kids
// Epic 4: Training Mode UX & Guardrails

import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PracticeCard } from './PracticeCard'
import { FeedbackToast } from './FeedbackToast'
import { OfflineGuard } from './OfflineModal'
import type { QueueEntry } from '../lib/practiceQueueService'
import type { PracticeDrill } from '../types'
import { fetchPracticeQueue } from '../lib/practiceQueueService'
import { supabase } from '../lib/supabase'

export function TrainingMode() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  // Get drill from URL params (Epic 5.5 - drill selection modal)
  const drillParam = searchParams.get('drill') as PracticeDrill | null
  const [currentDrill, setCurrentDrill] = useState<PracticeDrill>(drillParam || 'zhuyin')
  const [sessionScore, setSessionScore] = useState(0)
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [sessionTotal, setSessionTotal] = useState(0)
  const [showToast, setShowToast] = useState(false)
  const [toastPoints, setToastPoints] = useState<0 | 0.5 | 1.0>(0)
  const [currentQueue, setCurrentQueue] = useState<QueueEntry[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [kidId, setKidId] = useState<string | null>(null)
  const [showSummary, setShowSummary] = useState(false)

  // Fetch practice queue from Supabase
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

        // Fetch practice queue (20 items for longer sessions)
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
    if (drillParam && drillParam !== currentDrill) {
      setCurrentDrill(drillParam)
    }
  }, [drillParam])

  const handleCardComplete = (points: number) => {
    // Update session stats
    setSessionScore(prev => prev + points)
    setSessionTotal(prev => prev + 1)
    if (points > 0) {
      setSessionCorrect(prev => prev + 1)
    }

    // Show toast
    setToastPoints(points as 0 | 0.5 | 1.0)
    setShowToast(true)

    // Move to next item
    if (currentIndex + 1 < currentQueue.length) {
      setCurrentIndex(prev => prev + 1)
    } else {
      // Session complete
      setShowSummary(true)
    }
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
      <div className="fixed inset-0 bg-gradient-to-br from-red-800 to-red-600 flex items-center justify-center">
        <div className="text-white text-3xl font-bold">Loading practice...</div>
      </div>
    )
  }

  // No data state
  if (currentQueue.length === 0) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-red-800 to-red-600 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl mx-4 text-center">
          <div className="text-8xl mb-6">📚</div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">No Practice Items</h2>
          <p className="text-xl text-gray-600 mb-8">
            Ask your parent to add some characters to practice!
          </p>
          <button
            onClick={exitToDashboard}
            className="px-8 py-4 bg-red-600 text-white text-xl font-bold rounded-xl hover:bg-red-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <OfflineGuard>
      <div className="fixed inset-0 bg-gradient-to-br from-red-800 to-red-600 overflow-auto">
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
                  setCurrentDrill('zhuyin')
                  setCurrentIndex(0)
                }}
                className={`px-3 py-2 rounded-lg font-bold transition-colors text-sm sm:text-base ${
                  currentDrill === 'zhuyin'
                    ? 'bg-white text-red-700 shadow-lg'
                    : 'bg-red-700 text-white hover:bg-red-800'
                }`}
              >
                Drill A
              </button>
              <button
                onClick={() => {
                  setCurrentDrill('trad')
                  setCurrentIndex(0)
                }}
                className={`px-3 py-2 rounded-lg font-bold transition-colors text-sm sm:text-base ${
                  currentDrill === 'trad'
                    ? 'bg-white text-red-700 shadow-lg'
                    : 'bg-red-700 text-white hover:bg-red-800'
                }`}
              >
                Drill B
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
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold">
                {currentIndex + 1}/{currentQueue.length}
              </div>
              <div className="text-xs opacity-90">Progress</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Practice Area - Centered vertically and horizontally */}
      <div className="min-h-screen flex items-center justify-center pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        {!showSummary && currentEntry ? (
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
              <h2 className="text-5xl font-bold mb-3">Amazing Work!</h2>
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
                  className="flex-1 px-8 py-4 bg-red-600 text-white text-xl font-bold rounded-xl hover:bg-red-700 transition-colors"
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
        message=""
        onHide={() => setShowToast(false)}
      />
      </div>
    </OfflineGuard>
  )
}
