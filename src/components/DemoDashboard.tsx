/**
 * DemoDashboard - Static dashboard for signed-out users
 * Shows sample metrics to demonstrate app functionality
 */

import { useNavigate } from 'react-router-dom'
import { DEMO_METRICS } from '../lib/demoData'

export function DemoDashboard() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      {/* Demo Mode Banner */}
      <div className="bg-ninja-blue bg-opacity-10 border-2 border-ninja-blue rounded-lg p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 text-center sm:text-left">
          <div className="flex-1">
            <h3 className="font-heading text-xl font-bold mb-2 text-ninja-blue">
              You're Browsing in Demo Mode
            </h3>
            <p className="text-gray-700 mb-4 sm:mb-0">
              This dashboard shows sample data. Sign in to track your child's actual progress!
            </p>
          </div>
          <button
            onClick={() => navigate('/auth')}
            className="px-6 py-3 bg-ninja-gold text-gray-900 rounded-lg font-bold hover:bg-ninja-gold-dark transition-colors shadow-lg flex-shrink-0"
          >
            Sign In
          </button>
        </div>
      </div>

      {/* Sample Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Characters */}
        <div className="bg-ninja-red rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-bold">
              Total Characters
            </h3>
            <span className="text-3xl" aria-hidden="true">
              📚
            </span>
          </div>
          <div className="text-4xl font-bold mb-2">
            {DEMO_METRICS.totalCharacters}
          </div>
          <p className="text-sm text-white text-opacity-90">Characters added to study list</p>
        </div>

        {/* Known Characters (Drill A) */}
        <div className="bg-ninja-blue rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-bold">
              Known (Drill A)
            </h3>
            <span className="text-3xl" aria-hidden="true">
              ⚡
            </span>
          </div>
          <div className="text-4xl font-bold mb-2">
            {DEMO_METRICS.knownCountDrillA}
          </div>
          <p className="text-sm text-white text-opacity-90">
            {Math.round((DEMO_METRICS.knownCountDrillA / DEMO_METRICS.totalCharacters) * 100)}% proficiency
          </p>
        </div>

        {/* Known Characters (Drill B) */}
        <div className="bg-ninja-green rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-bold">
              Known (Drill B)
            </h3>
            <span className="text-3xl" aria-hidden="true">
              🔤
            </span>
          </div>
          <div className="text-4xl font-bold mb-2">
            {DEMO_METRICS.knownCountDrillB}
          </div>
          <p className="text-sm text-white text-opacity-90">
            {Math.round((DEMO_METRICS.knownCountDrillB / DEMO_METRICS.totalCharacters) * 100)}% proficiency
          </p>
        </div>

        {/* Weekly Familiarity */}
        <div className="bg-ninja-gold rounded-lg shadow-md p-6 text-gray-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-bold">
              Weekly Familiarity
            </h3>
            <span className="text-3xl" aria-hidden="true">
              📈
            </span>
          </div>
          <div className="text-4xl font-bold mb-2">
            +{DEMO_METRICS.weeklyFamiliarity.toFixed(1)}
          </div>
          <p className="text-sm text-gray-800">Points gained this week</p>
        </div>

        {/* Current Belt */}
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-ninja-gray">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-bold text-gray-900">
              Current Belt
            </h3>
            <span className="text-3xl" aria-hidden="true">
              🥋
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-2 capitalize">
            {DEMO_METRICS.currentBelt} Belt
          </div>
          <p className="text-sm text-gray-600">Belt progression based on familiarity</p>
        </div>

        {/* Practice Streak */}
        <div className="bg-ninja-orange rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-bold">
              Practice Streak
            </h3>
            <span className="text-3xl" aria-hidden="true">
              🔥
            </span>
          </div>
          <div className="text-4xl font-bold mb-2">
            {DEMO_METRICS.practiceStreak}
          </div>
          <p className="text-sm text-white text-opacity-90">Days in a row</p>
        </div>
      </div>

      {/* Accuracy Stats */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-heading text-xl font-bold text-gray-900 mb-6">
          Accuracy by Drill
        </h3>
        <div className="space-y-4">
          {/* Drill A Accuracy */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-700">
                ⚡ Drill A (Zhuyin Recognition)
              </span>
              <span className="font-bold text-ninja-blue">
                {Math.round(DEMO_METRICS.accuracyDrillA * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-ninja-blue h-3 rounded-full transition-all"
                style={{ width: `${DEMO_METRICS.accuracyDrillA * 100}%` }}
              />
            </div>
          </div>

          {/* Drill B Accuracy */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-700">
                🔤 Drill B (Simplified → Traditional)
              </span>
              <span className="font-bold text-ninja-green">
                {Math.round(DEMO_METRICS.accuracyDrillB * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-ninja-green h-3 rounded-full transition-all"
                style={{ width: `${DEMO_METRICS.accuracyDrillB * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade CTA */}
      <div className="bg-ninja-red rounded-lg p-8 text-white text-center shadow-xl">
        <div className="text-5xl mb-4" aria-hidden="true">
          🥋
        </div>
        <h3 className="font-heading text-3xl font-bold mb-3">
          Ready to Start Your Child's Training?
        </h3>
        <p className="text-lg text-white text-opacity-90 mb-6 max-w-2xl mx-auto">
          Sign in to track real progress, add your own characters,
          and watch your child master Chinese through the power of the dojo.
        </p>
        <button
          onClick={() => navigate('/auth')}
          className="px-8 py-3 bg-white text-ninja-red rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg inline-block"
        >
          Sign In
        </button>
        <p className="text-sm text-white text-opacity-75 mt-4">
          Free to use. No credit card required.
        </p>
      </div>
    </div>
  )
}
