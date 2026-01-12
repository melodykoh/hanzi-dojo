// Drill Selection Modal - Pre-Training drill choice with recommendations
// Epic 5.5: UX Refinement - Tasks 5.5.2 & 5.5.4
// Epic: Drill C (Word Match) integration

import { useState, useEffect } from 'react'
import {
  recommendDrill,
  getRecommendationMessage,
  type DrillRecommendation
} from '../lib/drillBalanceService'
import { fetchEligibleWordPairs, MIN_PAIRS_FOR_ROUND } from '../lib/wordPairService'
import type { PracticeDrill } from '../types'
import { DRILLS } from '../types'

interface DrillSelectionModalProps {
  kidId: string
  onSelectDrill: (drill: PracticeDrill) => void
  onCancel: () => void
}

interface DrillInfo {
  drill: PracticeDrill
  queueDepth: number
  displayName: string
  description: string
  emoji: string
  disabledReason?: string
}

export function DrillSelectionModal({ kidId, onSelectDrill, onCancel }: DrillSelectionModalProps) {
  const [selectedDrill, setSelectedDrill] = useState<PracticeDrill | null>(null)
  const [drillsInfo, setDrillsInfo] = useState<DrillInfo[]>([])
  const [recommendation, setRecommendation] = useState<DrillRecommendation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDrillInfo() {
      setLoading(true)
      try {
        // Get proficiency-based recommendation (Epic 5.5 Task 5.5.4)
        // and Drill C eligibility in parallel
        // Note: Fetch word pairs once and derive both values to avoid duplicate RPC calls
        const [rec, eligiblePairs] = await Promise.all([
          recommendDrill(kidId),
          fetchEligibleWordPairs(kidId)
        ])
        const wordMatchEligible = eligiblePairs.length >= MIN_PAIRS_FOR_ROUND
        const wordPairCount = eligiblePairs.length
        setRecommendation(rec)

        // Build drill info from recommendation data
        const info: DrillInfo[] = [
          {
            drill: DRILLS.ZHUYIN,
            queueDepth: rec.drillA.queueDepth,
            displayName: 'Drill A',
            description: 'Zhuyin Recognition',
            emoji: 'ㄅ'
          },
          {
            drill: DRILLS.TRAD,
            queueDepth: rec.drillB.queueDepth,
            displayName: 'Drill B',
            description: 'Traditional Form',
            emoji: '🈚'
          },
          {
            drill: DRILLS.WORD_MATCH,
            queueDepth: wordMatchEligible ? wordPairCount : 0,
            displayName: 'Drill C',
            description: 'Word Match',
            emoji: '🧩',
            disabledReason: wordMatchEligible ? undefined : `Need ${5 - wordPairCount} more word pairs`
          }
        ]

        setDrillsInfo(info)

        // Auto-select recommended drill if available
        if (rec.recommendedDrill) {
          setSelectedDrill(rec.recommendedDrill)
        }
      } catch (error) {
        console.error('[DrillSelectionModal] Failed to load drill info:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDrillInfo()
  }, [kidId])



  function handleStart() {
    if (selectedDrill) {
      onSelectDrill(selectedDrill)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <p className="text-center text-gray-600">Loading drills...</p>
        </div>
      </div>
    )
  }

  const hasNoDrills = drillsInfo.every(d => d.queueDepth === 0)

  const getProficiencyInfo = (drill: PracticeDrill) => {
    if (!recommendation) return null
    // Drill C (word_match) doesn't have proficiency data in the recommendation
    if (drill === DRILLS.WORD_MATCH) return null
    const proficiency = drill === DRILLS.ZHUYIN ? recommendation.drillA : recommendation.drillB
    return proficiency
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🎯 Choose Your Practice Drill</h2>
        <p className="text-sm text-gray-600 mb-6">Select which drill to practice today</p>

        {/* Recommendation Chip - only for Drills A/B (character-based drills) */}
        {recommendation && recommendation.recommendedDrill && recommendation.recommendedDrill !== DRILLS.WORD_MATCH && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <div className="flex items-start gap-2">
              <span className="text-lg">💡</span>
              <div>
                <p className="font-semibold text-blue-900 text-sm">
                  Recommended: {recommendation.recommendedDrill === DRILLS.ZHUYIN ? 'Drill A' : 'Drill B'}
                </p>
                <p className="text-sm text-blue-700">
                  {getRecommendationMessage(recommendation)}
                </p>
              </div>
            </div>
          </div>
        )}

        {hasNoDrills && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>No items available for practice.</strong><br />
              Add some characters first using the ➕ Add Item button.
            </p>
          </div>
        )}

        <div className="space-y-3 mb-6">
          {drillsInfo.map((info) => {
            const isDisabled = info.queueDepth === 0
            const isSelected = selectedDrill === info.drill
            const proficiency = getProficiencyInfo(info.drill)

            return (
              <button
                key={info.drill}
                onClick={() => !isDisabled && setSelectedDrill(info.drill)}
                disabled={isDisabled}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : isDisabled
                    ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                    : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{info.emoji}</div>
                    <div>
                      <div className="font-bold text-lg text-gray-900">
                        {info.displayName}
                        {proficiency?.needsAttention && (
                          <span className="ml-2 text-sm">⚠️</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {info.description}
                      </div>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isSelected
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-300 bg-white'
                  }`}>
                    {isSelected && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                      </svg>
                    )}
                  </div>
                </div>
                
                {/* Proficiency Metrics */}
                <div className={`text-sm space-y-1 ${isDisabled ? 'text-gray-400' : 'text-gray-600'}`}>
                  {info.queueDepth === 0 ? (
                    <div>{info.disabledReason || 'No items available'}</div>
                  ) : (
                    <>
                      {/* Drill C shows "word pairs", others show "items" */}
                      <div>
                        📝 {info.queueDepth} {info.drill === DRILLS.WORD_MATCH ? 'word pair' : 'item'}{info.queueDepth !== 1 ? 's' : ''} ready
                      </div>
                      {proficiency && proficiency.avgAccuracy !== null && (
                        <div className={proficiency.avgAccuracy < 70 ? 'text-orange-600 font-medium' : ''}>
                          ✓ Avg accuracy: {proficiency.avgAccuracy}%
                        </div>
                      )}
                      {proficiency && proficiency.strugglingCount > 0 && (
                        <div className="text-orange-600 font-medium">
                          ⚠️ {proficiency.strugglingCount} struggling item{proficiency.strugglingCount !== 1 ? 's' : ''}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            disabled={!selectedDrill}
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Start Practice
          </button>
        </div>
      </div>
    </div>
  )
}
