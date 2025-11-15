// Entry Catalog - Browse and manage added characters
// Epic 6: Task 6.3 - RELEASE BLOCKER

import { useState, useEffect, useRef } from 'react'
import { ChevronUpIcon } from '@heroicons/react/24/solid'
import { supabase } from '../lib/supabase'
import { formatZhuyinDisplay } from '../lib/zhuyin'
import type { Entry, PracticeState, ZhuyinSyllable, DictionaryEntry } from '../types'

interface EntryCatalogProps {
  kidId: string
  onLaunchTraining?: (drill?: string) => void
  refreshTrigger?: number  // When this changes, reload entries
}

type SortOption = 'recent' | 'familiarity' | 'struggling'
type FilterOption = 'all' | 'known' | 'not-known' | 'same-form' | 'different-forms'

interface EntryCatalogItem {
  entry: Entry
  practiceStates: PracticeState[]
  zhuyin: ZhuyinSyllable[] | null
  familiarity: number
  isKnown: boolean
  strugglingCount: number
  lastPracticed: string | null
  needsPronunciationReview: boolean
  dictionaryEntry: DictionaryEntry | null
}

const formatZhuyin = formatZhuyinDisplay

export function EntryCatalog({ kidId, onLaunchTraining, refreshTrigger }: EntryCatalogProps) {
  const [items, setItems] = useState<EntryCatalogItem[]>([])
  const [filteredItems, setFilteredItems] = useState<EntryCatalogItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [selectedEntry, setSelectedEntry] = useState<EntryCatalogItem | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number | null>(null)
  const [isSavingVariant, setIsSavingVariant] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const headerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    loadEntries()
  }, [kidId, refreshTrigger])

  useEffect(() => {
    applyFiltersAndSort()
  }, [items, sortBy, filterBy])

  useEffect(() => {
    const handleScroll = () => {
      const threshold = headerRef.current
        ? headerRef.current.offsetTop + headerRef.current.offsetHeight
        : 200

      setShowBackToTop(window.scrollY > threshold)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function loadEntries() {
    setIsLoading(true)
    try {
      // Fetch all entries for this kid
      const { data: entries, error: entriesError } = await supabase
        .from('entries')
        .select('*')
        .eq('kid_id', kidId)
        .order('created_at', { ascending: false })

      if (entriesError) throw entriesError

      // Fetch all practice states
      const { data: states, error: statesError } = await supabase
        .from('practice_state')
        .select('*')
        .eq('kid_id', kidId)

      if (statesError) throw statesError

      // Fetch all readings for these entries
      const entryIds = (entries || []).map(e => e.id)
      const { data: readings, error: readingsError } = await supabase
        .from('readings')
        .select('*')
        .in('entry_id', entryIds)

      if (readingsError) throw readingsError

      // Fetch dictionary entries for all characters (to check for variants)
      const uniqueSimps = [...new Set((entries || []).map(e => e.simp))]
      const { data: dictEntries, error: dictError } = await supabase
        .from('dictionary_entries')
        .select('*')
        .in('simp', uniqueSimps)

      if (dictError) throw dictError

      // Combine entries with their practice states and readings
      const catalogItems: EntryCatalogItem[] = (entries || []).map(entry => {
        const entryStates = (states || []).filter(s => s.entry_id === entry.id)
        const reading = (readings || []).find(r => r.entry_id === entry.id)
        const dictionaryEntry = (dictEntries || []).find(d => d.simp === entry.simp)
        
        // Calculate familiarity
        const familiarity = entryStates.reduce((sum, s) => 
          sum + (s.first_try_success_count * 1.0) + (s.second_try_success_count * 0.5), 
          0
        )

        // Check if known (all applicable drills meet criteria)
        const applicableDrills: string[] = entry.applicable_drills || []
        let isKnown = applicableDrills.length > 0

        for (const drill of applicableDrills) {
          const state = entryStates.find(s => s.drill === drill)
          if (!state) {
            isKnown = false
            break
          }

          const totalSuccesses = state.first_try_success_count + state.second_try_success_count
          const meetsKnownCriteria = totalSuccesses >= 2 && state.consecutive_miss_count < 2

          if (!meetsKnownCriteria) {
            isKnown = false
            break
          }
        }

        // Count struggling (consecutive misses >= 2)
        const strugglingCount = entryStates.filter(s => s.consecutive_miss_count >= 2).length

        // Get last practiced date
        const lastPracticed = entryStates
          .map(s => s.last_attempt_at)
          .filter(d => d !== null)
          .sort()
          .reverse()[0] || null

        // Check if needs pronunciation review
        // True when: dictionary has variants AND entry doesn't have locked_reading_id
        const needsPronunciationReview = !!(
          dictionaryEntry?.zhuyin_variants && 
          dictionaryEntry.zhuyin_variants.length > 0 && 
          !entry.locked_reading_id
        )

        return {
          entry,
          practiceStates: entryStates,
          zhuyin: reading?.zhuyin || null,
          familiarity,
          isKnown,
          strugglingCount,
          lastPracticed,
          needsPronunciationReview,
          dictionaryEntry
        }
      })

      setItems(catalogItems)
    } catch (error) {
      console.error('[EntryCatalog] Failed to load entries:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function applyFiltersAndSort() {
    let filtered = [...items]

    // Apply filter
    switch (filterBy) {
      case 'known':
        filtered = filtered.filter(item => item.isKnown)
        break
      case 'not-known':
        filtered = filtered.filter(item => !item.isKnown)
        break
      case 'same-form':
        // Characters where Simplified === Traditional
        filtered = filtered.filter(item => item.entry.simp === item.entry.trad)
        break
      case 'different-forms':
        // Characters where Simplified ≠ Traditional
        filtered = filtered.filter(item => item.entry.simp !== item.entry.trad)
        break
    }

    // Apply sort
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => 
          new Date(b.entry.created_at).getTime() - new Date(a.entry.created_at).getTime()
        )
        break
      case 'familiarity':
        filtered.sort((a, b) => a.familiarity - b.familiarity) // Low to high
        break
      case 'struggling':
        filtered.sort((a, b) => b.strugglingCount - a.strugglingCount)
        break
    }

    setFilteredItems(filtered)
  }

  async function handleDelete(entryId: string) {
    try {
      // Delete practice states first (foreign key constraint)
      const { error: statesError } = await supabase
        .from('practice_state')
        .delete()
        .eq('entry_id', entryId)

      if (statesError) throw statesError

      // Delete practice events
      const { error: eventsError } = await supabase
        .from('practice_events')
        .delete()
        .eq('entry_id', entryId)

      if (eventsError) throw eventsError

      // Delete entry
      const { error: entryError } = await supabase
        .from('entries')
        .delete()
        .eq('id', entryId)

      if (entryError) throw entryError

      // Reload entries
      await loadEntries()
      setShowDeleteConfirm(false)
      setDeleteTarget(null)
    } catch (error) {
      console.error('[EntryCatalog] Failed to delete entry:', error)
      alert('Failed to delete entry. Please try again.')
    }
  }

  function handlePracticeThis() {
    // Open drill selection modal to choose which drill to practice
    if (onLaunchTraining) {
      onLaunchTraining()
    }
  }

  async function handleSavePronunciation() {
    if (!selectedEntry || selectedVariantIndex === null) return

    setIsSavingVariant(true)
    try {
      // Pattern A: Default is first element in zhuyin_variants array
      const pronunciationData = selectedEntry.dictionaryEntry?.zhuyin_variants?.[selectedVariantIndex]

      if (!pronunciationData || !pronunciationData.zhuyin) throw new Error('Pronunciation data not found')

      // Create or update reading with the selected pronunciation
      const { data: existingReading } = await supabase
        .from('readings')
        .select('id')
        .eq('entry_id', selectedEntry.entry.id)
        .single()

      let readingId: string

      if (existingReading) {
        // Update existing reading
        const { data: updatedReading, error: updateError } = await supabase
          .from('readings')
          .update({
            zhuyin: pronunciationData.zhuyin,
            pinyin: pronunciationData.pinyin,
            sense: pronunciationData.meanings?.join(', '),
            context_words: pronunciationData.context_words
          })
          .eq('id', existingReading.id)
          .select('id')
          .single()

        if (updateError) throw updateError
        readingId = updatedReading.id
      } else {
        // Create new reading
        const { data: newReading, error: insertError } = await supabase
          .from('readings')
          .insert({
            entry_id: selectedEntry.entry.id,
            zhuyin: pronunciationData.zhuyin,
            pinyin: pronunciationData.pinyin,
            sense: pronunciationData.meanings?.join(', '),
            context_words: pronunciationData.context_words
          })
          .select('id')
          .single()

        if (insertError) throw insertError
        readingId = newReading.id
      }

      // Update entry with locked_reading_id
      const { error: entryError } = await supabase
        .from('entries')
        .update({ locked_reading_id: readingId })
        .eq('id', selectedEntry.entry.id)

      if (entryError) throw entryError

      // Reload entries to update UI
      await loadEntries()
      setSelectedEntry(null)
      setSelectedVariantIndex(null)
    } catch (error) {
      console.error('[EntryCatalog] Failed to save pronunciation:', error)
      alert('Failed to save pronunciation. Please try again.')
    } finally {
      setIsSavingVariant(false)
    }
  }

  function formatLastPracticed(date: string | null): string {
    if (!date) return 'Never'
    
    const now = new Date()
    const practiced = new Date(date)
    const diffMs = now.getTime() - practiced.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading your characters...</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No Characters Yet</h3>
          <p className="text-gray-600 mb-6">Add your first character to get started!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header with count */}
      <div ref={headerRef} className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Characters</h2>
        <p className="text-gray-600">{items.length} character{items.length !== 1 ? 's' : ''} added</p>
      </div>

      {/* Sort and Filter Controls */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Sort */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="recent">Recently added</option>
              <option value="familiarity">Familiarity (low to high)</option>
              <option value="struggling">Struggling items first</option>
            </select>
          </div>

          {/* Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter</label>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as FilterOption)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">Show all</option>
              <option value="known">Known only</option>
              <option value="not-known">Not known yet</option>
              <option value="same-form">Same form (Simp = Trad)</option>
              <option value="different-forms">Different forms (Simp ≠ Trad)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Entries Grid - Simplified Colors, Full-width on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredItems.map(item => {
          const applicableDrills = item.entry.applicable_drills || []
          const hasDrillA = applicableDrills.includes('zhuyin')
          const hasDrillB = applicableDrills.includes('trad')

          return (
            <div
              key={item.entry.id}
              className="bg-white shadow-lg p-6 border-2 border-gray-200 hover:shadow-xl hover:border-gray-300 transition-all relative overflow-hidden rounded-xl"
            >
              {/* Subtle angular pattern */}
              <div className="absolute inset-0 angular-stripe opacity-5 pointer-events-none" />

              {/* Character */}
              <div className="mb-4 relative z-10">
                {/* Top row: Drill badges + Status icons */}
                <div className="flex items-start justify-between mb-3">
                  {/* Drill badges (left) */}
                  <div className="flex gap-1">
                    {hasDrillA && (
                      <div className="bg-ninja-blue text-white px-2 py-1 text-xs font-bold shadow-md rounded" title="Drill A: Zhuyin">
                        ⚡
                      </div>
                    )}
                    {hasDrillB && (
                      <div className="bg-ninja-red text-white px-2 py-1 text-xs font-bold shadow-md rounded" title="Drill B: Traditional">
                        🔥
                      </div>
                    )}
                  </div>

                  {/* Status icons (right) */}
                  <div className="flex gap-1">
                    {item.isKnown && (
                      <div className="text-xl" title="Known">🌟</div>
                    )}
                    {!item.isKnown && item.strugglingCount > 0 && (
                      <div className="text-xl" title="Needs practice">⚠️</div>
                    )}
                    {item.needsPronunciationReview && (
                      <div className="text-xl" title="Review pronunciation">
                        <span className="inline-block bg-yellow-100 text-yellow-600 rounded-full px-2 text-sm font-semibold">
                          ⚠️
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Character display */}
                <div>
                  <div className="text-4xl font-bold mb-2">{item.entry.simp}</div>
                  {item.entry.simp !== item.entry.trad && (
                    <div className="text-2xl text-gray-600">{item.entry.trad}</div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-2 text-sm text-gray-600 mb-4 relative z-10">
              <div className="flex justify-between">
                <span>Familiarity:</span>
                <span className="font-semibold">{item.familiarity.toFixed(1)} pts</span>
              </div>
              <div className="flex justify-between">
                <span>Last practiced:</span>
                <span>{formatLastPracticed(item.lastPracticed)}</span>
              </div>
            </div>

              {/* Actions */}
              <div className="flex items-center gap-2 relative z-10">
                {/* Main action buttons */}
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedEntry(item)}
                    className="px-4 py-3 bg-gray-200 border-2 border-gray-300 text-gray-800 text-sm font-bold hover:bg-gray-300 hover:border-gray-400 transition-all rounded-lg"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => handlePracticeThis()}
                    className="px-4 py-3 bg-ninja-red text-white text-sm font-bold hover:bg-ninja-red-dark transition-all shadow-md rounded-lg"
                  >
                    Practice
                  </button>
                </div>

                {/* Delete button - small, minimal, on the side */}
                <button
                  onClick={() => {
                    setDeleteTarget(item.entry.id)
                    setShowDeleteConfirm(true)
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No characters match your filters.</p>
        </div>
      )}

      {/* Details Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="text-6xl font-bold mb-2">{selectedEntry.entry.simp}</div>
                {selectedEntry.entry.simp !== selectedEntry.entry.trad && (
                  <div className="text-4xl text-gray-600 mb-2">{selectedEntry.entry.trad}</div>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedEntry(null)
                  setSelectedVariantIndex(null)
                }}
                className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Pronunciation Review Section (if needed) */}
            {selectedEntry.needsPronunciationReview && selectedEntry.dictionaryEntry?.zhuyin_variants && (
              <div className="mb-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">⚠️</span>
                  <h4 className="text-base font-bold text-gray-900">Review Pronunciation</h4>
                </div>
                <p className="text-sm text-gray-700 mb-4">
                  This character has multiple pronunciations. Select the one you're learning:
                </p>

                <div className="space-y-2">
                  {selectedEntry.dictionaryEntry.zhuyin_variants.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedVariantIndex(index)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        selectedVariantIndex === index
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-lg font-bold text-gray-900 mb-1">
                            {formatZhuyin(option.zhuyin)}
                            {option.pinyin && (
                              <span className="ml-2 text-base text-gray-600">({option.pinyin})</span>
                            )}
                          </div>
                          {option.meanings && option.meanings.length > 0 && (
                            <div className="text-sm text-gray-600 mb-1">
                              {option.meanings.join(', ')}
                            </div>
                          )}
                          {option.context_words && option.context_words.length > 0 && (
                            <div className="text-sm text-gray-500">
                              Examples: {option.context_words.join(', ')}
                            </div>
                          )}
                        </div>
                        {selectedVariantIndex === index && (
                          <div className="ml-2 text-blue-500 text-xl">✓</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleSavePronunciation}
                  disabled={selectedVariantIndex === null || isSavingVariant}
                  className={`w-full mt-4 px-6 py-3 font-bold rounded-lg transition-colors ${
                    selectedVariantIndex === null || isSavingVariant
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isSavingVariant ? 'Saving...' : 'Save Pronunciation'}
                </button>
              </div>
            )}

            {/* Pronunciation - Using Zhuyin from reading */}
            {!selectedEntry.needsPronunciationReview && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Pronunciation</h4>
                <div className="text-2xl text-gray-900">
                  {selectedEntry.zhuyin ? (
                    formatZhuyin(selectedEntry.zhuyin)
                  ) : (
                    <span className="text-gray-400 text-base">No pronunciation data</span>
                  )}
                </div>
              </div>
            )}

            {/* Practice Stats */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Practice Stats</h4>
              <div className="space-y-3">
                {selectedEntry.practiceStates
                  .sort((a, b) => {
                    // Always show Drill A first, then Drill B
                    if (a.drill === 'zhuyin' && b.drill === 'trad') return -1
                    if (a.drill === 'trad' && b.drill === 'zhuyin') return 1
                    return 0
                  })
                  .map(state => (
                  <div key={state.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">
                        {state.drill === 'zhuyin' ? 'ㄅ Drill A (Zhuyin)' : '🈚 Drill B (Traditional)'}
                      </span>
                      {state.first_try_success_count + state.second_try_success_count >= 2 && 
                       state.consecutive_miss_count < 2 && (
                        <span className="text-green-600 font-semibold">✓ Known</span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
                      <div>
                        <div className="font-semibold">{state.first_try_success_count}</div>
                        <div>First try</div>
                      </div>
                      <div>
                        <div className="font-semibold">{state.second_try_success_count}</div>
                        <div>Second try</div>
                      </div>
                      <div>
                        <div className={state.consecutive_miss_count >= 2 ? 'font-semibold text-orange-600' : 'font-semibold'}>
                          {state.consecutive_miss_count}
                        </div>
                        <div>Miss streak</div>
                      </div>
                    </div>
                  </div>
                  ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Familiarity</div>
                  <div className="text-xl font-bold text-gray-900">{selectedEntry.familiarity.toFixed(1)} pts</div>
                </div>
                <div>
                  <div className="text-gray-600">Last practiced</div>
                  <div className="text-xl font-bold text-gray-900">{formatLastPracticed(selectedEntry.lastPracticed)}</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedEntry(null)
                setSelectedVariantIndex(null)
              }}
              className="w-full px-6 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Delete Character?</h3>
            <p className="text-gray-600 mb-6">
              This will permanently delete this character and all practice history.
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeleteTarget(null)
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <ChevronUpIcon className="h-5 w-5" />
          <span className="hidden sm:inline text-sm font-semibold">Back to top</span>
        </button>
      )}
    </div>
  )
}
