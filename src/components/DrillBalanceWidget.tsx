// Drill Balance Widget - Dashboard proficiency overview
// Epic 5.5: UX Refinement - Task 5.5.5
// Updated: Clickable struggling count + Last Week/Last 60 Days toggle

import { useState, useEffect } from 'react'
import {
  recommendDrill,
  getStrugglingCharacters,
  getAccuracyForTimeframe,
  type DrillRecommendation,
  type StrugglingCharacter
} from '../lib/drillBalanceService'
import { DRILLS, type PracticeDrill } from '../types'
import { StrugglingCharactersModal } from './StrugglingCharactersModal'

interface DrillBalanceWidgetProps {
  kidId: string
}

type TimeframeOption = 'week' | 'sixty_days'

export function DrillBalanceWidget({ kidId }: DrillBalanceWidgetProps) {
  const [recommendation, setRecommendation] = useState<DrillRecommendation | null>(null)
  const [loading, setLoading] = useState(true)

  // Timeframe toggle state (per drill)
  const [drillATimeframe, setDrillATimeframe] = useState<TimeframeOption>('week')
  const [drillBTimeframe, setDrillBTimeframe] = useState<TimeframeOption>('week')

  // Time-based accuracy (separate from the default last-10 accuracy)
  const [drillAAccuracy, setDrillAAccuracy] = useState<number | null>(null)
  const [drillBAccuracy, setDrillBAccuracy] = useState<number | null>(null)
  const [accuracyLoading, setAccuracyLoading] = useState(false)

  // Struggling modal state
  const [showStrugglingModal, setShowStrugglingModal] = useState(false)
  const [modalDrill, setModalDrill] = useState<'drill_a' | 'drill_b'>('drill_a')
  const [strugglingCharacters, setStrugglingCharacters] = useState<StrugglingCharacter[]>([])
  const [strugglingLoading, setStrugglingLoading] = useState(false)

  useEffect(() => {
    loadBalance()
  }, [kidId])

  // Load accuracy when timeframe changes
  useEffect(() => {
    loadAccuracyForDrill(DRILLS.ZHUYIN, drillATimeframe, setDrillAAccuracy)
  }, [kidId, drillATimeframe])

  useEffect(() => {
    loadAccuracyForDrill(DRILLS.TRAD, drillBTimeframe, setDrillBAccuracy)
  }, [kidId, drillBTimeframe])

  async function loadBalance() {
    setLoading(true)
    try {
      const rec = await recommendDrill(kidId)
      setRecommendation(rec)
      // Initialize accuracy from recommendation (last 10 events)
      setDrillAAccuracy(rec.drillA.avgAccuracy)
      setDrillBAccuracy(rec.drillB.avgAccuracy)
    } catch (error) {
      console.error('[DrillBalanceWidget] Failed to load balance:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadAccuracyForDrill(
    drill: PracticeDrill,
    timeframe: TimeframeOption,
    setAccuracy: (val: number | null) => void
  ) {
    setAccuracyLoading(true)
    try {
      const days = timeframe === 'week' ? 7 : 60
      const accuracy = await getAccuracyForTimeframe(kidId, drill, days)
      setAccuracy(accuracy)
    } catch (error) {
      console.error(`[DrillBalanceWidget] Failed to load accuracy for ${drill}:`, error)
    } finally {
      setAccuracyLoading(false)
    }
  }

  async function handleStrugglingClick(drill: PracticeDrill) {
    const drillKey = drill === DRILLS.ZHUYIN ? 'drill_a' : 'drill_b'
    setModalDrill(drillKey)
    setShowStrugglingModal(true)
    setStrugglingLoading(true)

    try {
      const characters = await getStrugglingCharacters(kidId, drill)
      setStrugglingCharacters(characters)
    } catch (error) {
      console.error('[DrillBalanceWidget] Failed to load struggling characters:', error)
      setStrugglingCharacters([])
    } finally {
      setStrugglingLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-heading text-lg text-gray-900 mb-4">📊 Drill Proficiency</h3>
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!recommendation) {
    return null
  }

  const { drillA, drillB } = recommendation

  const renderDrillRow = (
    name: string,
    description: string,
    proficiency: typeof drillA,
    emoji: string,
    drill: PracticeDrill,
    accuracy: number | null,
    timeframe: TimeframeOption,
    setTimeframe: (tf: TimeframeOption) => void
  ) => {
    const displayAccuracy = accuracy !== null ? accuracy : 0
    const hasData = accuracy !== null

    return (
      <div className="py-3 border-b border-gray-100 last:border-b-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{emoji}</span>
            <div>
              <div className="font-semibold text-gray-900">
                {name}
                {proficiency.needsAttention && (
                  <span className="ml-2 text-sm">⚠️</span>
                )}
              </div>
              <div className="text-xs text-gray-500">{description}</div>
            </div>
          </div>
        </div>

        {/* Timeframe Toggle */}
        <div className="mb-2">
          <div className="inline-flex rounded-md border border-gray-200 p-0.5 bg-gray-50">
            <button
              onClick={() => setTimeframe('week')}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                timeframe === 'week'
                  ? 'bg-white text-ninja-blue shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Last Week
            </button>
            <button
              onClick={() => setTimeframe('sixty_days')}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                timeframe === 'sixty_days'
                  ? 'bg-white text-ninja-blue shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Last 60 Days
            </button>
          </div>
        </div>

        {/* Accuracy Bar */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Accuracy</span>
            {accuracyLoading ? (
              <span className="text-gray-400">...</span>
            ) : hasData ? (
              <span className={displayAccuracy < 70 ? 'text-orange-600 font-semibold' : 'font-semibold'}>
                {displayAccuracy}%
              </span>
            ) : (
              <span className="text-gray-400 font-medium">N/A</span>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                !hasData ? 'bg-gray-300' :
                displayAccuracy >= 80 ? 'bg-green-500' :
                displayAccuracy >= 70 ? 'bg-yellow-500' :
                'bg-orange-500'
              }`}
              style={{ width: hasData ? `${displayAccuracy}%` : '0%' }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
          <div>
            📝 {proficiency.queueDepth} item{proficiency.queueDepth !== 1 ? 's' : ''}
          </div>
          {proficiency.strugglingCount > 0 ? (
            <button
              onClick={() => handleStrugglingClick(drill)}
              className="text-orange-600 font-medium hover:text-orange-700 hover:underline focus:outline-none focus:underline transition-colors"
              aria-label={`View ${proficiency.strugglingCount} struggling characters for ${name}`}
            >
              ⚠️ {proficiency.strugglingCount} struggling
            </button>
          ) : (
            <span className="text-gray-400">0 struggling</span>
          )}
          {!hasData && proficiency.queueDepth > 0 && (
            <div className="text-blue-600">Not practiced yet</div>
          )}
        </div>

        {proficiency.needsAttention && (
          <div className="mt-2 text-xs text-orange-600 font-medium">
            💡 Needs practice
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-heading text-lg text-gray-900 mb-4">📊 Drill Proficiency Overview</h3>

        <div className="space-y-0">
          {renderDrillRow(
            'Drill A',
            'Zhuyin Recognition',
            drillA,
            'ㄅ',
            DRILLS.ZHUYIN,
            drillAAccuracy,
            drillATimeframe,
            setDrillATimeframe
          )}
          {renderDrillRow(
            'Drill B',
            'Traditional Form',
            drillB,
            '🈚',
            DRILLS.TRAD,
            drillBAccuracy,
            drillBTimeframe,
            setDrillBTimeframe
          )}
        </div>

        {/* Overall recommendation hint */}
        {recommendation.recommendedDrill && recommendation.reason !== 'balanced' && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-blue-700">💡 Tip:</span>{' '}
              Try {recommendation.recommendedDrill === DRILLS.ZHUYIN ? 'Drill A' : 'Drill B'} next for better balance
            </p>
          </div>
        )}
      </div>

      {/* Struggling Characters Modal */}
      <StrugglingCharactersModal
        isOpen={showStrugglingModal}
        onClose={() => setShowStrugglingModal(false)}
        drill={modalDrill}
        characters={strugglingCharacters}
        isLoading={strugglingLoading}
      />
    </>
  )
}
