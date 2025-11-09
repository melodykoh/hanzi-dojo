// Drill Balance Widget - Dashboard proficiency overview
// Epic 5.5: UX Refinement - Task 5.5.5

import { useState, useEffect } from 'react'
import { recommendDrill, type DrillRecommendation } from '../lib/drillBalanceService'

interface DrillBalanceWidgetProps {
  kidId: string
}

export function DrillBalanceWidget({ kidId }: DrillBalanceWidgetProps) {
  const [recommendation, setRecommendation] = useState<DrillRecommendation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBalance()
  }, [kidId])

  async function loadBalance() {
    setLoading(true)
    try {
      const rec = await recommendDrill(kidId)
      setRecommendation(rec)
    } catch (error) {
      console.error('[DrillBalanceWidget] Failed to load balance:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Drill Proficiency</h3>
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
    emoji: string
  ) => {
    const accuracy = proficiency.avgAccuracy !== null ? proficiency.avgAccuracy : 0
    const hasData = proficiency.avgAccuracy !== null

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

        {/* Accuracy Bar */}
        {hasData && (
          <div className="mb-2">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Accuracy</span>
              <span className={accuracy < 70 ? 'text-orange-600 font-semibold' : 'font-semibold'}>
                {accuracy}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  accuracy >= 80 ? 'bg-green-500' :
                  accuracy >= 70 ? 'bg-yellow-500' :
                  'bg-orange-500'
                }`}
                style={{ width: `${accuracy}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-4 text-xs text-gray-600">
          <div>
            📝 {proficiency.queueDepth} item{proficiency.queueDepth !== 1 ? 's' : ''}
          </div>
          {proficiency.strugglingCount > 0 && (
            <div className="text-orange-600 font-medium">
              ⚠️ {proficiency.strugglingCount} struggling
            </div>
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
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Drill Proficiency Overview</h3>

      <div className="space-y-0">
        {renderDrillRow('Drill A', 'Zhuyin Recognition', drillA, 'ㄅ')}
        {renderDrillRow('Drill B', 'Traditional Form', drillB, '🈚')}
      </div>

      {/* Overall recommendation hint */}
      {recommendation.recommendedDrill && recommendation.reason !== 'balanced' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-blue-700">💡 Tip:</span>{' '}
            Try {recommendation.recommendedDrill === 'zhuyin' ? 'Drill A' : 'Drill B'} next for better balance
          </p>
        </div>
      )}
    </div>
  )
}
