import { useState } from 'react'
import { dictionaryClient, determineApplicableDrills, hasMultipleReadings } from '../lib/dictionaryClient'
import { dictionaryLogger } from '../lib/dictionaryLogger'
import { formatZhuyinDisplay } from '../lib/zhuyin'
import { DictionaryLookupResult } from '../types'

export function DictionaryDemo() {
  const [searchChar, setSearchChar] = useState('')
  const [result, setResult] = useState<DictionaryLookupResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(dictionaryClient.getStats())

  const handleLookup = async () => {
    if (!searchChar.trim()) return

    setLoading(true)
    try {
      const lookupResult = await dictionaryClient.lookup(searchChar.trim())
      setResult(lookupResult)
      setStats(dictionaryClient.getStats())

      // If not found, log it
      if (!lookupResult.found) {
        await dictionaryLogger.logMissingEntry({ simp: searchChar.trim() })
      }
    } catch (err) {
      console.error('Lookup error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Batch Test removed from UI - developer testing only
  // To test batch lookup in console:
  // import { dictionaryClient } from './lib/dictionaryClient'
  // await dictionaryClient.batchLookup(['太', '阳', '黑', '前', '后', '着', '光', '灯', '亮', '见'])
  //
  // Rationale: Batch Test was confusing for end users (no clear purpose)
  // Lookup button provides all user-facing value (check if character exists before adding)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-4">Dictionary Lookup Test</h3>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchChar}
            onChange={(e) => setSearchChar(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
            placeholder="Enter character (e.g., 太)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dojo-red"
          />
          <button
            onClick={handleLookup}
            disabled={loading}
            className="dojo-button-primary disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? 'Looking up...' : 'Lookup'}
          </button>
        </div>

        {/* Cache Stats */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
          <h4 className="font-semibold mb-2">Cache Statistics</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Cache Size: <span className="font-bold">{stats.cacheSize}</span></div>
            <div>Hit Rate: <span className="font-bold">{stats.hitRate}%</span></div>
            <div>Hits: <span className="font-bold">{stats.hitCount}</span></div>
            <div>Misses: <span className="font-bold">{stats.missCount}</span></div>
          </div>
        </div>

        {/* Result Display */}
        {result && (
          <div className={`p-4 rounded-lg border ${result.found ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
            {result.found && result.entry ? (
              <div className="space-y-3">
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-serif">{result.entry.simp}</span>
                  {result.entry.simp !== result.entry.trad && (
                    <>
                      <span className="text-gray-400">→</span>
                      <span className="text-4xl font-serif">{result.entry.trad}</span>
                    </>
                  )}
                </div>

                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-semibold">Zhuyin:</span>{' '}
                    <span className="text-xl font-serif">
                      {formatZhuyinDisplay(result.entry.zhuyin ?? [])}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">Pinyin:</span> {result.entry.pinyin || 'N/A'}
                  </div>
                  <div>
                    <span className="font-semibold">Meanings:</span> {result.entry.meanings?.join(', ') || 'N/A'}
                  </div>
                  <div>
                    <span className="font-semibold">Applicable Drills:</span>{' '}
                    {determineApplicableDrills(result.entry).join(', ')}
                  </div>
                  {hasMultipleReadings(result.entry) && (
                    <div className="text-amber-700">
                      ⚠️ Multiple readings - requires context selection
                      <details className="text-xs mt-1">
                        <summary className="cursor-pointer">Show variants</summary>
                        <div className="mt-1 space-y-1">
                          {result.entry.zhuyin_variants?.map((variant, i) => (
                            <div key={i} className="pl-2">
                              • {formatZhuyinDisplay(variant.zhuyin)}
                              {variant.pinyin ? ` (${variant.pinyin})` : ''}
                              {variant.meanings ? ` — ${variant.meanings.join(', ')}` : ''}
                              {variant.context_words ? ` [${variant.context_words.join(', ')}]` : ''}
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  )}
                </div>

                {result.confusions && (
                  <details className="text-xs">
                    <summary className="cursor-pointer font-semibold">Confusion Data (for drills)</summary>
                    <pre className="mt-2 p-2 bg-white rounded overflow-auto">
                      {JSON.stringify(result.confusions, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ) : (
              <div className="text-yellow-800">
                <p className="font-semibold">Character not found in dictionary</p>
                <p className="text-sm mt-1">This entry has been logged for future seeding.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
