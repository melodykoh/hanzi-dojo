// Practice Demo - Test the complete drill flow with mock data

import { useState, useEffect } from 'react'
import { PracticeCard } from './PracticeCard'
import { FeedbackToast } from './FeedbackToast'
import { KnownBadge } from './KnownBadge'
import type { QueueEntry } from '../lib/practiceQueueService'
import type { PracticeDrill, Entry, Reading } from '../types'
import { DRILLS } from '../types'
import { fetchPracticeQueue } from '../lib/practiceQueueService'
import { supabase } from '../lib/supabase'
import { usePracticeSession } from '../hooks/usePracticeSession'

// =============================================================================
// MOCK DATA
// =============================================================================

const MOCK_ENTRY: Entry = {
  id: 'mock-entry-1',
  owner_id: 'mock-user',
  kid_id: 'mock-kid',
  simp: '阳',
  trad: '陽',
  type: 'char',
  applicable_drills: [DRILLS.ZHUYIN, DRILLS.TRAD],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const MOCK_READING: Reading = {
  id: 'mock-reading-1',
  entry_id: 'mock-entry-1',
  zhuyin: [['ㄧ', 'ㄤ', 'ˊ']],
  pinyin: 'yáng',
  created_at: new Date().toISOString()
}

const MOCK_QUEUE_ENTRY: QueueEntry = {
  entry: MOCK_ENTRY,
  reading: MOCK_READING,
  practiceState: null,
  priority: 1000,
  priorityReason: 'Never practiced',
  familiarity: 0,
  isKnown: false
}

// =============================================================================
// COMPONENT
// =============================================================================

export function PracticeDemo() {
  const [currentDrill, setCurrentDrill] = useState<PracticeDrill>(DRILLS.ZHUYIN)

  // Use shared practice session hook
  const {
    sessionScore,
    sessionCorrect,
    sessionTotal,
    showToast,
    toastPoints,
    setShowToast,
    handleCardComplete: handleCardCompleteBase,
    resetSession: resetSessionBase
  } = usePracticeSession()

  const [currentQueue, setCurrentQueue] = useState<QueueEntry[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [useMockData, setUseMockData] = useState(true)
  const [kidId, setKidId] = useState<string | null>(null)
  const [roundCounter, setRoundCounter] = useState(0)
  const [showSummary, setShowSummary] = useState(false)
  
  // Fetch real data from Supabase
  useEffect(() => {
    async function loadRealData() {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          console.log('No authenticated user, using mock data')
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
          console.log('No kids found, using mock data')
          return
        }
        
        const kid = kids[0]
        setKidId(kid.id)
        
        // Fetch practice queue
        const queue = await fetchPracticeQueue(kid.id, currentDrill, 10)
        
        if (queue.length === 0) {
          console.log('No entries in queue, using mock data')
          return
        }
        
        setCurrentQueue(queue)
        setUseMockData(false)
      } catch (error) {
        console.error('Failed to load real data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (!useMockData) {
      loadRealData()
    } else {
      setIsLoading(false)
    }
  }, [currentDrill, useMockData])
  
  const handleCardComplete = (points: number) => {
    handleCardCompleteBase(points, () => {
      // Move to next item immediately
      if (useMockData) {
        // Increment round counter to force re-render with fresh card
        setRoundCounter(prev => prev + 1)
      } else {
        // Move to next in queue
        setCurrentIndex(prev => prev + 1)
      }
    })
  }
  
  const handleError = (error: Error) => {
    console.error('Practice card error:', error)
    alert(`Error: ${error.message}`)
  }
  
  const resetSession = () => {
    resetSessionBase()
    setCurrentIndex(0)
    setRoundCounter(0)
    setShowSummary(false)
  }
  
  const endSession = () => {
    setShowSummary(true)
  }
  
  // Reset index when switching modes or drills
  useEffect(() => {
    setCurrentIndex(0)
    setRoundCounter(0)
  }, [useMockData, currentDrill])
  
  // Get current queue entry
  const currentEntry = useMockData
    ? MOCK_QUEUE_ENTRY
    : currentQueue[currentIndex]
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="text-center text-gray-600">Loading...</div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Practice Demo</h1>
        
        {/* Session Stats */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-gray-900">{sessionScore.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Points</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">
                {sessionTotal > 0 ? Math.round((sessionCorrect / sessionTotal) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">
                {sessionCorrect}/{sessionTotal}
              </div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
          </div>
        </div>
        
        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2 sm:gap-4 justify-center sm:justify-start">
            <button
              onClick={() => setCurrentDrill(DRILLS.ZHUYIN)}
              className={`px-4 py-2 rounded whitespace-nowrap ${
                currentDrill === DRILLS.ZHUYIN
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Drill A (Zhuyin)
            </button>
            <button
              onClick={() => setCurrentDrill(DRILLS.TRAD)}
              className={`px-4 py-2 rounded whitespace-nowrap ${
                currentDrill === DRILLS.TRAD
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Drill B (Traditional)
            </button>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-4 justify-center sm:justify-end">
            <button
              onClick={endSession}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 whitespace-nowrap"
            >
              End Training
            </button>
            <button
              onClick={resetSession}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 whitespace-nowrap"
            >
              Reset Session
            </button>
            <button
              onClick={() => setUseMockData(!useMockData)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 whitespace-nowrap"
            >
              {useMockData ? 'Use Real Data' : 'Use Mock Data'}
            </button>
          </div>
        </div>
        
        {/* Queue Info */}
        {!useMockData && currentQueue.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="text-sm text-blue-800">
              <strong>Queue:</strong> {currentIndex + 1} / {currentQueue.length} items
              {currentEntry && (
                <span className="ml-4">
                  <KnownBadge
                    entry={currentEntry.entry}
                    practiceStates={currentEntry.practiceState ? [currentEntry.practiceState] : []}
                    size="sm"
                  />
                </span>
              )}
            </div>
          </div>
        )}
        
        {useMockData && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="text-sm text-yellow-800">
              <strong>Mock Mode:</strong> Using demo data. Sign in and add entries to use real data.
            </div>
          </div>
        )}
      </div>
      
      {/* Session Summary Modal */}
      {showSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold mb-2">Training Complete!</h2>
              <p className="text-gray-600 mb-6">Great work in the dojo today.</p>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700 font-semibold">Total Points</span>
                  <span className="text-2xl font-bold text-blue-600">{sessionScore.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700 font-semibold">Accuracy</span>
                  <span className="text-2xl font-bold text-green-600">
                    {sessionTotal > 0 ? Math.round((sessionCorrect / sessionTotal) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700 font-semibold">Correct</span>
                  <span className="text-2xl font-bold text-gray-700">{sessionCorrect}/{sessionTotal}</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSummary(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Continue Training
                </button>
                <button
                  onClick={() => {
                    resetSession()
                    setShowSummary(false)
                  }}
                  className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
                >
                  New Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Practice Card */}
      {!showSummary && currentEntry ? (
        <PracticeCard
          key={`${currentEntry.entry.id}-${currentIndex}-${currentDrill}-${useMockData ? roundCounter : ''}`}
          queueEntry={currentEntry}
          drill={currentDrill}
          kidId={useMockData ? 'mock-kid' : (kidId || 'mock-kid')}
          onComplete={handleCardComplete}
          onError={handleError}
          mockMode={true}  // ALWAYS mock mode - Practice Demo should never write to production
        />
      ) : !showSummary ? (
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="text-center text-gray-600">
            {!useMockData && currentIndex >= currentQueue.length && currentQueue.length > 0 ? (
              // Finished practicing all items in queue
              <>
                <div className="text-6xl mb-4">🎉</div>
                <div className="text-2xl font-bold mb-2">Session Complete!</div>
                <div className="text-lg mb-4">
                  You earned {sessionScore.toFixed(1)} points
                </div>
                <button
                  onClick={resetSession}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Start New Session
                </button>
              </>
            ) : !useMockData && currentQueue.length === 0 ? (
              // No data available in real mode
              <>
                <div className="text-6xl mb-4">📚</div>
                <div className="text-2xl font-bold mb-2 text-gray-700">No Practice Data</div>
                <div className="text-base mb-4 text-gray-600">
                  {isLoading ? 
                    'Loading...' : 
                    'Sign in and add entries to practice with real data.'
                  }
                </div>
                <button
                  onClick={() => setUseMockData(true)}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Switch to Mock Mode
                </button>
              </>
            ) : (
              // Mock mode with no current entry (shouldn't happen)
              'No entries available for this drill'
            )}
          </div>
        </div>
      ) : null}
      
      {/* Feedback Toast */}
      <FeedbackToast
        show={showToast}
        points={toastPoints}
        onHide={() => setShowToast(false)}
      />
    </div>
  )
}
