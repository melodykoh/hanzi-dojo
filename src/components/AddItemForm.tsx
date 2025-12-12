// Add Item Form - Dictionary-assisted entry creation with manual overrides
// Epic 5: Entry Management & Belt System

import { useState, useEffect } from 'react'
import { dictionaryClient } from '../lib/dictionaryClient'
import { dictionaryLogger } from '../lib/dictionaryLogger'
import { supabase } from '../lib/supabase'
import { formatZhuyinDisplay } from '../lib/zhuyin'
import type { ZhuyinSyllable, PracticeDrill, ZhuyinVariant } from '../types'
import { DRILLS } from '../types'

interface AddItemFormProps {
  kidId: string
  onSuccess?: () => void
  onCancel?: () => void
}

interface FormData {
  simplified: string
  traditional: string
  zhuyin: ZhuyinSyllable[]
  selectedVariantIndex: number | null
  pinyin?: string
  meanings?: string[]
  contextWords?: string[]
  type: 'char' | 'word'
}

export function AddItemForm({ kidId, onSuccess, onCancel }: AddItemFormProps) {
  const [input, setInput] = useState('')
  const [formData, setFormData] = useState<FormData>({
    simplified: '',
    traditional: '',
    zhuyin: [],
    selectedVariantIndex: null,
    pinyin: undefined,
    meanings: undefined,
    contextWords: undefined,
    type: 'char'
  })
  const [zhuyinVariants, setZhuyinVariants] = useState<ZhuyinVariant[]>([])
  const [primaryPronunciation, setPrimaryPronunciation] = useState<ZhuyinVariant | null>(null)
  const [lookupStatus, setLookupStatus] = useState<'idle' | 'loading' | 'found' | 'missing'>('idle')
  const [errors, setErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [manualZhuyinInput, setManualZhuyinInput] = useState('')
  const [hasConfirmedPronunciation, setHasConfirmedPronunciation] = useState(false)

  // Auto-lookup when input changes
  useEffect(() => {
    if (input.length === 0) {
      setLookupStatus('idle')
      setFormData({
        simplified: '',
        traditional: '',
        zhuyin: [],
        selectedVariantIndex: null,
        pinyin: undefined,
        meanings: undefined,
        contextWords: undefined,
        type: 'char'
      })
      setZhuyinVariants([])
      setPrimaryPronunciation(null)
      setManualZhuyinInput('')
      setHasConfirmedPronunciation(false)
      return
    }

    // Debounce lookup
    const timeout = setTimeout(async () => {
      await performLookup(input)
    }, 300)

    return () => clearTimeout(timeout)
  }, [input])

  const performLookup = async (character: string) => {
    setLookupStatus('loading')
    setErrors([])

    try {
      const result = await dictionaryClient.lookup(character)

      if (result.found && result.entry) {
        // Auto-fill from dictionary
        const isSingleCharacter = result.entry.simp.length === 1
        const dictionaryVariants = result.entry.zhuyin_variants ?? []
        const fallbackVariants: ZhuyinVariant[] = []

        if (dictionaryVariants.length === 0 && isSingleCharacter && result.entry.zhuyin.length > 1) {
          const [, ...otherPronunciations] = result.entry.zhuyin
          fallbackVariants.push(
            ...otherPronunciations.map(syllable => ({ zhuyin: [syllable] }))
          )
        }

        const variantsToUse = dictionaryVariants.length > 0 ? dictionaryVariants : fallbackVariants

        const primaryVariant: ZhuyinVariant = dictionaryVariants.length > 0
          ? dictionaryVariants[0]
          : {
              zhuyin: result.entry.zhuyin.length > 0
                ? [result.entry.zhuyin[0]]
                : [],
              pinyin: result.entry.pinyin ?? undefined,
              meanings: result.entry.meanings ?? undefined,
              context_words: undefined
            }

        setFormData({
          simplified: result.entry.simp,
          traditional: result.entry.trad,
          zhuyin: primaryVariant.zhuyin,
          selectedVariantIndex: null,
          pinyin: primaryVariant.pinyin ?? undefined,
          meanings: primaryVariant.meanings ?? undefined,
          contextWords: primaryVariant.context_words ?? undefined,
          type: result.entry.simp.length === 1 ? 'char' : 'word'
        })

        setPrimaryPronunciation(primaryVariant)
        setZhuyinVariants(variantsToUse)

        setLookupStatus('found')
        setHasConfirmedPronunciation(variantsToUse.length > 0 ? false : true)
      } else {
        // Not found in dictionary - log and allow manual entry
        await dictionaryLogger.logMissingEntry({ simp: character })

        setFormData({
          simplified: character,
          traditional: character, // Default to same
          zhuyin: [],
          selectedVariantIndex: null,
          pinyin: undefined,
          meanings: undefined,
          contextWords: undefined,
          type: character.length === 1 ? 'char' : 'word'
        })
        setZhuyinVariants([])
        setLookupStatus('missing')
        setPrimaryPronunciation(null)
        setHasConfirmedPronunciation(false)
      }
    } catch (error) {
      console.error('Dictionary lookup failed:', error)
      setErrors(['Failed to lookup character. Please check your connection.'])
      setLookupStatus('idle')
    }
  }

  const formatZhuyin = (zhuyin: ZhuyinSyllable[]): string => formatZhuyinDisplay(zhuyin)

  // Parse manual Zhuyin input with numeric tones (e.g., "ㄊㄡ2" or "ㄊㄡˊ")
  const parseManualZhuyin = (input: string): { syllables: ZhuyinSyllable[], errors: string[] } => {
    const errors: string[] = []
    const syllables: ZhuyinSyllable[] = []

    // Tone map: numeric to symbol
    const toneMap: Record<string, string> = {
      '1': 'ˉ',
      '2': 'ˊ',
      '3': 'ˇ',
      '4': 'ˋ',
      '5': '˙'
    }

    // Valid Zhuyin components
    const validInitials = ['ㄅ', 'ㄆ', 'ㄇ', 'ㄈ', 'ㄉ', 'ㄊ', 'ㄋ', 'ㄌ', 'ㄍ', 'ㄎ', 'ㄏ', 'ㄐ', 'ㄑ', 'ㄒ', 'ㄓ', 'ㄔ', 'ㄕ', 'ㄖ', 'ㄗ', 'ㄘ', 'ㄙ']
    const validFinals = ['ㄚ', 'ㄛ', 'ㄜ', 'ㄝ', 'ㄞ', 'ㄟ', 'ㄠ', 'ㄡ', 'ㄢ', 'ㄣ', 'ㄤ', 'ㄥ', 'ㄦ', 'ㄧ', 'ㄨ', 'ㄩ']
    const validTones = ['ˉ', 'ˊ', 'ˇ', 'ˋ', '˙', '1', '2', '3', '4', '5']

    // Split by spaces (if present) or parse as continuous string
    const parts = input.trim().split(/\s+/).filter(s => s.length > 0)

    if (parts.length === 0) {
      return { syllables: [], errors: ['Zhuyin input is empty'] }
    }

    for (const part of parts) {
      // Convert numeric tones to symbols
      let normalized = part
      for (const [num, symbol] of Object.entries(toneMap)) {
        normalized = normalized.replace(num, symbol)
      }

      // Parse syllable: should have at least one final and one tone
      const chars = Array.from(normalized)
      let initial = ''
      let final = ''
      let tone = ''

      for (const char of chars) {
        if (validInitials.includes(char) && initial === '') {
          initial = char
        } else if (validFinals.includes(char)) {
          final += char // Can have multiple finals (e.g., ㄧㄚ)
        } else if (validTones.includes(char)) {
          tone = toneMap[char] || char
          break // Tone should be last
        }
      }

      // Validate syllable
      if (!final) {
        errors.push(`Invalid syllable "${part}": missing final (vowel)`)
        continue
      }
      if (!tone) {
        errors.push(`Invalid syllable "${part}": missing tone (use 1-5 or ˉˊˇˋ˙)`)
        continue
      }

      syllables.push([initial, final, tone])
    }

    return { syllables, errors }
  }

  // Handle manual Zhuyin input change
  const handleManualZhuyinChange = (value: string) => {
    setManualZhuyinInput(value)

    // Parse and update formData in real-time
    const { syllables, errors: parseErrors } = parseManualZhuyin(value)

    if (parseErrors.length === 0 && syllables.length > 0) {
      setFormData(prev => ({ ...prev, zhuyin: syllables }))
      setHasConfirmedPronunciation(true)
    } else {
      // Clear zhuyin if parsing failed
      setFormData(prev => ({ ...prev, zhuyin: [] }))
      setHasConfirmedPronunciation(false)
    }
  }

  const handleVariantSelect = (index: number) => {
    const variant = zhuyinVariants[index]
    setFormData(prev => ({
      ...prev,
      zhuyin: variant.zhuyin,
      selectedVariantIndex: index,
      pinyin: variant.pinyin ?? prev.pinyin,
      meanings: variant.meanings ?? prev.meanings,
      contextWords: variant.context_words ?? prev.contextWords
    }))
    setHasConfirmedPronunciation(true)
  }

  const handlePrimaryPronunciationSelect = () => {
    if (primaryPronunciation) {
      setFormData(prev => ({
        ...prev,
        selectedVariantIndex: null,
        zhuyin: primaryPronunciation.zhuyin,
        pinyin: primaryPronunciation.pinyin ?? prev.pinyin,
        meanings: primaryPronunciation.meanings ?? prev.meanings,
        contextWords: primaryPronunciation.context_words ?? prev.contextWords
      }))
    } else {
      setFormData(prev => ({ ...prev, selectedVariantIndex: null }))
    }
    setHasConfirmedPronunciation(true)
  }

  const detectApplicableDrills = (): PracticeDrill[] => {
    const drills: PracticeDrill[] = []

    // Zhuyin drill always applicable if we have zhuyin
    if (formData.zhuyin.length > 0) {
      drills.push(DRILLS.ZHUYIN)
    }

    // Traditional drill only applicable if simp !== trad
    if (formData.simplified !== formData.traditional) {
      drills.push(DRILLS.TRAD)
    }

    return drills
  }

  const validateForm = (): string[] => {
    const errors: string[] = []

    // Basic validation
    if (!formData.simplified || formData.simplified.trim() === '') {
      errors.push('Simplified character/word is required')
    }

    if (!formData.traditional || formData.traditional.trim() === '') {
      errors.push('Traditional character/word is required')
    }

    if (formData.zhuyin.length === 0) {
      errors.push('Zhuyin pronunciation is required')
    }

    // Zhuyin tone validation
    const validTones = ['ˉ', 'ˊ', 'ˇ', 'ˋ', '˙']
    for (const syllable of formData.zhuyin) {
      if (!validTones.includes(syllable[2])) {
        errors.push(`Invalid tone mark in Zhuyin: ${syllable[2]}`)
      }
    }

    return errors
  }

  const checkDuplicate = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('entries')
        .select('id')
        .eq('kid_id', kidId)
        .eq('simp', formData.simplified)
        .limit(1)

      if (error) throw error

      return data && data.length > 0
    } catch (error) {
      console.error('Duplicate check failed:', error)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    setErrors([])

    try {
      // Check for duplicates
      const isDuplicate = await checkDuplicate()
      if (isDuplicate) {
        setErrors([`"${formData.simplified}" is already in your practice list`])
        setIsSubmitting(false)
        return
      }

      // Get current authenticated user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setErrors(['You must be logged in to add items'])
        setIsSubmitting(false)
        return
      }
      
      const ownerId = user.id

      const applicableDrills = detectApplicableDrills()

      // Insert entry
      const { data: entryData, error: entryError } = await supabase
        .from('entries')
        .insert({
          owner_id: ownerId,
          kid_id: kidId,
          simp: formData.simplified,
          trad: formData.traditional,
          type: formData.type,
          applicable_drills: applicableDrills
        })
        .select()
        .single()

      if (entryError) {
        console.error('[AddItemForm] Entry insert error:', entryError)
        throw entryError
      }

      console.log('[AddItemForm] Entry created:', entryData)

      const selectedVariant = formData.selectedVariantIndex !== null
        ? zhuyinVariants[formData.selectedVariantIndex]
        : null

      const readingPayload: Record<string, unknown> = {
        entry_id: entryData.id,
        zhuyin: formData.zhuyin
      }

      const pinyinToUse = selectedVariant?.pinyin ?? formData.pinyin
      if (pinyinToUse) {
        readingPayload.pinyin = pinyinToUse
      }

      const contextToUse = selectedVariant?.context_words ?? formData.contextWords
      if (contextToUse && contextToUse.length > 0) {
        readingPayload.context_words = contextToUse
      }

      const meaningsToUse = selectedVariant?.meanings ?? formData.meanings
      if (meaningsToUse && meaningsToUse.length > 0) {
        readingPayload.sense = meaningsToUse.join(', ')
      }

      // Insert reading
      const { data: readingData, error: readingError } = await supabase
        .from('readings')
        .insert(readingPayload)
        .select('id')
        .single()

      if (readingError) {
        console.error('[AddItemForm] Reading insert error:', readingError)
        throw readingError
      }

      const shouldLockReading = zhuyinVariants.length === 0 || hasConfirmedPronunciation

      if (shouldLockReading && readingData?.id) {
        const { error: lockError } = await supabase
          .from('entries')
          .update({ locked_reading_id: readingData.id })
          .eq('id', entryData.id)

        if (lockError) {
          console.error('[AddItemForm] Failed to lock pronunciation:', lockError)
          throw lockError
        }
      }

      // Success!
      if (onSuccess) onSuccess()

      // Reset form
      setInput('')
      setFormData({
        simplified: '',
        traditional: '',
        zhuyin: [],
        selectedVariantIndex: null,
        pinyin: undefined,
        meanings: undefined,
        contextWords: undefined,
        type: 'char'
      })
      setZhuyinVariants([])
      setPrimaryPronunciation(null)
      setManualZhuyinInput('')
      setLookupStatus('idle')
      setHasConfirmedPronunciation(false)
    } catch (error) {
      console.error('[AddItemForm] Failed to add entry:', error)
      // Show more detailed error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setErrors([`Failed to save entry: ${errorMessage}`])
    } finally {
      setIsSubmitting(false)
    }
  }

  const applicableDrills = detectApplicableDrills()

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="font-heading text-2xl text-gray-900 mb-6">➕ Add Practice Item</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Input Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Character or Word
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter Chinese character or word..."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-2xl"
            autoFocus
          />

          {/* Lookup Status */}
          {lookupStatus === 'loading' && (
            <p className="text-sm text-gray-500 mt-2">🔍 Looking up in dictionary...</p>
          )}
          {lookupStatus === 'found' && (
            <p className="text-sm text-green-600 mt-2">✅ Found in dictionary</p>
          )}
          {lookupStatus === 'missing' && (
            <p className="text-sm text-yellow-600 mt-2">
              ⚠️ Not found in dictionary. Manual entry required.
            </p>
          )}
        </div>

        {/* Auto-filled Data (when found) */}
        {lookupStatus !== 'idle' && (
          <>
            {/* Simplified / Traditional */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Simplified
                </label>
                <input
                  type="text"
                  value={formData.simplified}
                  onChange={(e) => setFormData(prev => ({ ...prev, simplified: e.target.value }))}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Traditional
                </label>
                <input
                  type="text"
                  value={formData.traditional}
                  onChange={(e) => setFormData(prev => ({ ...prev, traditional: e.target.value }))}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-xl"
                />
              </div>
            </div>

            {/* Zhuyin */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Zhuyin Pronunciation
              </label>

              {/* Manual input when missing from dictionary */}
              {lookupStatus === 'missing' ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={manualZhuyinInput}
                    onChange={(e) => handleManualZhuyinChange(e.target.value)}
                    placeholder="ㄊㄡ2 or ㄊㄡˊ"
                    className="w-full px-4 py-3 border-2 border-yellow-300 rounded-lg focus:border-yellow-500 focus:outline-none text-xl bg-yellow-50"
                  />
                  <p className="text-sm text-gray-600">
                    💡 <strong>Tip:</strong> Use numbers for tones: 1=ˉ, 2=ˊ, 3=ˇ, 4=ˋ, 5=˙
                    <br />
                    Example: <code className="bg-gray-100 px-1 rounded">ㄊㄡ2</code> or <code className="bg-gray-100 px-1 rounded">ㄇㄚ1 ㄇㄚ5</code> for multi-syllable
                  </p>

                  {/* Live preview */}
                  {formData.zhuyin.length > 0 && (
                    <div className="px-4 py-3 bg-green-50 border-2 border-green-300 rounded-lg">
                      <p className="text-xs font-semibold text-green-700 mb-1">Preview:</p>
                      <p className="text-2xl text-green-900">{formatZhuyin(formData.zhuyin)}</p>
                    </div>
                  )}

                  {/* Show parsing errors */}
                  {manualZhuyinInput.length > 0 && formData.zhuyin.length === 0 && (
                    <div className="px-4 py-2 bg-red-50 border-2 border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">
                        ⚠️ Unable to parse Zhuyin. Check format and ensure each syllable has a tone (1-5).
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Read-only when found in dictionary */
                <div className="px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-lg text-xl">
                  {formData.zhuyin.length > 0 ? formatZhuyin(formData.zhuyin) : <span className="text-gray-400">No pronunciation set</span>}
                </div>
              )}
            </div>

            {/* Zhuyin Variants (if multiple pronunciations) */}
            {zhuyinVariants.length > 0 && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-900 mb-3">
                  ⚠️ Multiple Pronunciations Detected
                </p>
                <div className="space-y-2">
                  {/* Default reading */}
                  <button
                    type="button"
                    onClick={handlePrimaryPronunciationSelect}
                    className={`w-full text-left px-4 py-2 rounded border-2 transition-colors ${
                      formData.selectedVariantIndex === null
                        ? 'border-blue-600 bg-blue-100'
                        : 'border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-lg font-semibold">{formatZhuyin(primaryPronunciation?.zhuyin ?? formData.zhuyin)}</div>
                    <div className="text-sm text-gray-600">Default pronunciation</div>
                  </button>

                  {zhuyinVariants.map((variant, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleVariantSelect(index)}
                      className={`w-full text-left px-4 py-2 rounded border-2 transition-colors ${
                        formData.selectedVariantIndex === index
                          ? 'border-blue-600 bg-blue-100'
                          : 'border-gray-300 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-lg font-semibold">{formatZhuyin(variant.zhuyin)}</div>
                      {variant.context_words && variant.context_words.length > 0 && (
                        <div className="text-sm text-gray-600">
                          Used in: {variant.context_words.join(', ')}
                        </div>
                      )}
                      {variant.meanings && variant.meanings.length > 0 && (
                        <div className="text-sm text-gray-500">
                          {variant.meanings.join('; ')}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Applicable Drills */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Applicable Drills
              </label>
              <div className="flex gap-3">
                {applicableDrills.includes(DRILLS.ZHUYIN) && (
                  <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-semibold">
                    ✓ Drill A (Zhuyin)
                  </div>
                )}
                {applicableDrills.includes(DRILLS.TRAD) && (
                  <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-semibold">
                    ✓ Drill B (Traditional)
                  </div>
                )}
                {applicableDrills.length === 0 && (
                  <div className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">
                    No drills available (add pronunciation)
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-red-900 mb-2">⚠️ Please fix the following:</p>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting || lookupStatus === 'idle' || applicableDrills.length === 0}
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Adding...' : '➕ Add to Practice List'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
