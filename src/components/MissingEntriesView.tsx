import { useEffect, useState } from 'react'
import { dictionaryLogger } from '../lib/dictionaryLogger'

interface MissingEntry {
  id: string
  simp: string
  trad?: string
  pinyin?: string
  created_at: string
}

export function MissingEntriesView() {
  const [entries, setEntries] = useState<MissingEntry[]>([])
  const [count, setCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  const loadMissingEntries = async () => {
    setLoading(true)
    try {
      const [entriesData, totalCount] = await Promise.all([
        dictionaryLogger.getMissingEntries(20),
        dictionaryLogger.getMissingEntriesCount()
      ])
      setEntries(entriesData)
      setCount(totalCount)
    } catch (err) {
      console.error('Failed to load missing entries:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMissingEntries()
  }, [])

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading missing entries...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-xl">Missing Dictionary Entries</h3>
        <button
          onClick={loadMissingEntries}
          className="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
        >
          Refresh
        </button>
      </div>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-800">
          <strong>{count}</strong> unique characters have been searched but not found in the dictionary.
          These will guide future dictionary expansion.
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <p>No missing entries logged yet.</p>
          <p className="text-sm mt-2">Search for a character not in the dictionary to test logging.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="p-3 bg-white border border-gray-200 rounded hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-serif">{entry.simp}</span>
                  {entry.trad && entry.trad !== entry.simp && (
                    <>
                      <span className="text-gray-400">→</span>
                      <span className="text-3xl font-serif">{entry.trad}</span>
                    </>
                  )}
                  {entry.pinyin && (
                    <span className="text-sm text-gray-600">({entry.pinyin})</span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(entry.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {entries.length > 0 && count > entries.length && (
        <div className="text-center text-sm text-gray-500">
          Showing {entries.length} of {count} entries
        </div>
      )}
    </div>
  )
}
