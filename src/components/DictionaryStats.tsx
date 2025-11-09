import { useState, useEffect } from 'react'
import { dictionaryClient } from '../lib/dictionaryClient'
import { dictionaryLogger } from '../lib/dictionaryLogger'

export function DictionaryStats() {
  const [clientStats, setClientStats] = useState(dictionaryClient.getStats())
  const [missingCount, setMissingCount] = useState<number>(0)

  useEffect(() => {
    // Update stats every 2 seconds
    const interval = setInterval(() => {
      setClientStats(dictionaryClient.getStats())
    }, 2000)

    // Load missing entries count
    loadMissingCount()

    return () => clearInterval(interval)
  }, [])

  const loadMissingCount = async () => {
    const count = await dictionaryLogger.getMissingEntriesCount()
    setMissingCount(count)
  }

  const handleClearCache = () => {
    if (confirm('Clear dictionary cache? This will reset hit rate statistics.')) {
      dictionaryClient.clearCache()
      setClientStats(dictionaryClient.getStats())
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Dictionary Analytics</h3>
        <button
          onClick={handleClearCache}
          className="text-sm px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded"
        >
          Clear Cache
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Cache Hit Rate */}
        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg">
          <div className="text-sm text-green-700 mb-1">Hit Rate</div>
          <div className="text-3xl font-bold text-green-800">{clientStats.hitRate}%</div>
          <div className="text-xs text-green-600 mt-1">
            {clientStats.hitCount} / {clientStats.totalLookups} lookups
          </div>
        </div>

        {/* Cache Size */}
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-700 mb-1">Cache Size</div>
          <div className="text-3xl font-bold text-blue-800">{clientStats.cacheSize}</div>
          <div className="text-xs text-blue-600 mt-1">cached entries</div>
        </div>

        {/* Total Lookups */}
        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg">
          <div className="text-sm text-purple-700 mb-1">Total Lookups</div>
          <div className="text-3xl font-bold text-purple-800">{clientStats.totalLookups}</div>
          <div className="text-xs text-purple-600 mt-1">this session</div>
        </div>

        {/* Missing Entries */}
        <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg">
          <div className="text-sm text-yellow-700 mb-1">Missing</div>
          <div className="text-3xl font-bold text-yellow-800">{missingCount}</div>
          <div className="text-xs text-yellow-600 mt-1">logged entries</div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="font-semibold text-sm mb-2">Performance Insights</h4>
        <div className="space-y-1 text-xs text-gray-700">
          {clientStats.hitRate >= 80 && (
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Excellent cache performance - most lookups served from memory</span>
            </div>
          )}
          {clientStats.hitRate < 80 && clientStats.hitRate >= 50 && (
            <div className="flex items-center gap-2">
              <span className="text-yellow-600">⚠</span>
              <span>Good performance - consider pre-warming cache with common characters</span>
            </div>
          )}
          {clientStats.hitRate < 50 && clientStats.totalLookups > 5 && (
            <div className="flex items-center gap-2">
              <span className="text-orange-600">⚠</span>
              <span>Cache underutilized - mostly unique character lookups</span>
            </div>
          )}
          {clientStats.cacheSize > 100 && (
            <div className="flex items-center gap-2">
              <span className="text-blue-600">ℹ</span>
              <span>Large cache size - good for frequent users, clear if memory constrained</span>
            </div>
          )}
          {missingCount > 20 && (
            <div className="flex items-center gap-2">
              <span className="text-yellow-600">📝</span>
              <span>Many missing entries - consider expanding dictionary seed</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
