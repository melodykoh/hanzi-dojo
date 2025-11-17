// Practice Card - Drill display with attempt tracking

import { useState, useEffect } from 'react'
import type { PracticeDrill, ZhuyinSyllable } from '../types'
import { DRILLS } from '../types'
import type { QueueEntry } from '../lib/practiceQueueService'
import type { DrillAOption, DrillBOption } from '../lib/drillBuilders'
import { buildDrillAOptions, buildDrillBOptions, validateDrillOptions } from '../lib/drillBuilders'
import { recordFirstAttempt, recordSecondAttempt } from '../lib/practiceStateService'
import { supabase } from '../lib/supabase'

// =============================================================================
// TYPES
// =============================================================================

interface PracticeCardProps {
  queueEntry: QueueEntry
  drill: PracticeDrill
  kidId: string
  onComplete: (pointsAwarded: number) => void
  onError?: (error: Error) => void
  mockMode?: boolean // Skip database writes in mock mode
}

type AttemptState = 'first' | 'second' | 'complete'

// =============================================================================
// COMPONENT
// =============================================================================

export function PracticeCard({
  queueEntry,
  drill,
  kidId,
  onComplete,
  onError,
  mockMode = false
}: PracticeCardProps) {
  const [attemptState, setAttemptState] = useState<AttemptState>('first')
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [disabledOptions, setDisabledOptions] = useState<Set<number>>(new Set())
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<string>('')
  const [pointsAwarded, setPointsAwarded] = useState(0)
  
  // Generate drill options
  const [options, setOptions] = useState<DrillAOption[] | DrillBOption[]>([])
  
  useEffect(() => {
    async function generateOptions() {
      try {
        if (drill === DRILLS.ZHUYIN) {
          // Fetch dictionary entry to get ALL valid pronunciations (including alternates)
          // This prevents using valid alternate pronunciations as "wrong" answer distractors
          const char = queueEntry.entry.simp

          console.log('[PracticeCard] Fetching dictionary for:', {
            char,
            simp: queueEntry.entry.simp,
            trad: queueEntry.entry.trad
          })

          // Use RPC function for robust lookup (handles OR logic correctly)
          const { data: rpcResult, error: rpcError } = await supabase
            .rpc('lookup_dictionary_entry', { search_char: char })

          if (rpcError) {
            console.error('[PracticeCard] Dictionary RPC failed:', rpcError)
          }

          // Extract dictionary entry from RPC result
          const dictEntry = rpcResult?.found ? rpcResult.entry : null

          if (dictEntry) {
            console.log('[PracticeCard] Dictionary entry found:', {
              char,
              hasZhuyinVariants: !!dictEntry.zhuyin_variants,
              hasZhuyin: !!dictEntry.zhuyin,
              zhuyinType: Array.isArray(dictEntry.zhuyin) ? 'array' : typeof dictEntry.zhuyin
            })
          } else {
            console.log('[PracticeCard] No dictionary entry found, using reading zhuyin only')
          }

          // Extract all valid pronunciations from dictionary
          let allValidPronunciations: ZhuyinSyllable[][] = [queueEntry.reading.zhuyin]

          if (dictEntry) {
            if (dictEntry.zhuyin_variants && Array.isArray(dictEntry.zhuyin_variants)) {
              // Pattern A structure: extract zhuyin from each variant
              allValidPronunciations = dictEntry.zhuyin_variants.map(
                (variant: any) => variant.zhuyin
              )
              console.log('[PracticeCard] Using Pattern A variants:', {
                count: allValidPronunciations.length,
                pronunciations: allValidPronunciations
              })
            } else if (dictEntry.zhuyin) {
              // OLD FORMAT COMPATIBILITY: Handle multi-pronunciation characters
              // Old format stores multi-pronunciation as: [["ㄕ","ㄨㄚ",""], ["ㄕ","ㄨㄚ","ˋ"]]
              // This is ambiguous - could be:
              //   1. A 2-syllable word with pronunciation shuā-shuà
              //   2. A 1-character with 2 possible pronunciations (shuā OR shuà)
              //
              // Solution: Check if all elements are single syllables (3-element tuples)
              // If yes, treat as multi-pronunciation (#2), otherwise as multi-syllable word (#1)

              if (Array.isArray(dictEntry.zhuyin) && dictEntry.zhuyin.length > 1) {
                // Check if this looks like old multi-pronunciation format
                const isSingleSyllableList = dictEntry.zhuyin.every(
                  (elem: any) => Array.isArray(elem) && elem.length === 3 && typeof elem[0] === 'string'
                )

                console.log('[PracticeCard] Multi-element zhuyin detected:', {
                  length: dictEntry.zhuyin.length,
                  isSingleSyllableList
                })

                if (isSingleSyllableList) {
                  // OLD MULTI-PRONUNCIATION FORMAT DETECTED
                  // Convert: [["ㄕ","ㄨㄚ",""], ["ㄕ","ㄨㄚ","ˋ"]]
                  //      to: [[["ㄕ","ㄨㄚ",""]], [["ㄕ","ㄨㄚ","ˋ"]]]
                  console.log(
                    `[PracticeCard] ✓ Old format detected for ${char}, converting ${dictEntry.zhuyin.length} pronunciations`
                  )
                  allValidPronunciations = dictEntry.zhuyin.map((syl: ZhuyinSyllable) => [syl])
                } else {
                  // Multi-syllable word or complex structure - keep as-is
                  console.log('[PracticeCard] Multi-syllable word format')
                  allValidPronunciations = [dictEntry.zhuyin]
                }
              } else {
                // Single pronunciation
                console.log('[PracticeCard] Single pronunciation')
                allValidPronunciations = [dictEntry.zhuyin]
              }
            }
          }

          console.log('[PracticeCard] Final allValidPronunciations:', {
            count: allValidPronunciations.length,
            pronunciations: allValidPronunciations
          })

          const drillAOptions = buildDrillAOptions(
            queueEntry.reading.zhuyin,
            undefined, // confusionData - not used yet
            allValidPronunciations
          )
          const validation = validateDrillOptions(drillAOptions)
          if (!validation.valid) {
            throw new Error(`Invalid DrillA options: ${validation.error}`)
          }
          setOptions(drillAOptions)
          setCorrectOptionIndex(drillAOptions.findIndex(opt => opt.isCorrect))
        } else if (drill === DRILLS.TRAD) {
          const drillBOptions = buildDrillBOptions(
            queueEntry.entry.simp,
            queueEntry.entry.trad
          )
          const validation = validateDrillOptions(drillBOptions)
          if (!validation.valid) {
            throw new Error(`Invalid DrillB options: ${validation.error}`)
          }
          setOptions(drillBOptions)
          setCorrectOptionIndex(drillBOptions.findIndex(opt => opt.isCorrect))
        }
      } catch (error) {
        console.error('Failed to generate drill options:', error)
        if (onError) onError(error as Error)
      }
    }

    generateOptions()
  }, [queueEntry, drill])
  
  // Handle option selection
  const handleOptionClick = async (index: number) => {
    if (attemptState === 'complete') return
    if (disabledOptions.has(index)) return
    if (isSubmitting) return
    
    setSelectedOption(index)
    setIsSubmitting(true)
    
    const isCorrect = index === correctOptionIndex
    
    try {
      if (attemptState === 'first') {
        // First attempt
        let pointsAwarded: 0 | 0.5 | 1.0 = 0
        
        if (!mockMode) {
          // Real mode: write to database
          const result = await recordFirstAttempt(
            kidId,
            queueEntry.entry.id,
            drill,
            isCorrect,
            options[index]
          )
          pointsAwarded = result.pointsAwarded
        } else {
          // Mock mode: simulate scoring
          pointsAwarded = isCorrect ? 1.0 : 0
        }
        
        if (isCorrect) {
          // First try success: +1.0 points
          setFeedback('Perfect form! +1.0 point')
          setPointsAwarded(pointsAwarded)
          setAttemptState('complete')
        } else {
          // First try miss: disable option, allow retry
          setFeedback('Focus your form. Try again.')
          setDisabledOptions(prev => new Set(prev).add(index))
          setAttemptState('second')
        }
      } else if (attemptState === 'second') {
        // Second attempt
        let pointsAwarded: 0 | 0.5 | 1.0 = 0
        
        if (!mockMode) {
          // Real mode: write to database
          const result = await recordSecondAttempt(
            kidId,
            queueEntry.entry.id,
            drill,
            isCorrect,
            options[index]
          )
          pointsAwarded = result.pointsAwarded
        } else {
          // Mock mode: simulate scoring
          pointsAwarded = isCorrect ? 0.5 : 0
        }
        
        if (isCorrect) {
          // Second try success: +0.5 points
          setFeedback('Good recovery. +0.5 points')
          setPointsAwarded(pointsAwarded)
        } else {
          // Second try miss: 0 points, reveal correct
          setFeedback('The Sensei shows you the way: ')
          setPointsAwarded(0)
        }
        
        setAttemptState('complete')
      }
    } catch (error) {
      console.error('Failed to record attempt:', error)
      setFeedback('Error recording attempt. Please try again.')
      if (onError) onError(error as Error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Render Drill A (Zhuyin) - Lightning Element
  if (drill === DRILLS.ZHUYIN && options.length > 0) {
    const drillAOptions = options as DrillAOption[]

    return (
      <div className="bg-white shadow-2xl p-4 sm:p-6 md:p-8 w-full sm:max-w-3xl mx-auto border-4 border-ninja-blue relative overflow-hidden rounded-xl">
        {/* Subtle lightning element overlay */}
        <div className="absolute inset-0 angular-stripe-lightning opacity-10 pointer-events-none" />

        {/* Drill indicator badge */}
        <div className="absolute top-4 left-4 bg-ninja-blue text-white px-3 py-1 font-bold text-sm shadow-lg rounded">
          ⚡ DRILL A
        </div>

        {/* Prompt */}
        <div className="text-center mb-6 sm:mb-8 relative z-10 pt-12">
          <div className="text-xs sm:text-sm text-gray-600 mb-2 font-semibold uppercase tracking-wide">
            {queueEntry.entry.type === 'word' ? 'Word' : 'Character'}
          </div>
          <div className="text-7xl sm:text-8xl md:text-9xl font-serif mb-4">
            {queueEntry.entry.simp}
          </div>
          <div className="text-base sm:text-lg text-gray-700 font-semibold">
            Select the correct pronunciation
          </div>
        </div>
        
        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {drillAOptions.map((option, index) => {
            const isDisabled = disabledOptions.has(index)
            const isSelected = selectedOption === index
            const showAsCorrect = attemptState === 'complete' && index === correctOptionIndex
            const isWrong = isSelected && !showAsCorrect && attemptState !== 'first'
            
            return (
              <button
                key={index}
                onClick={() => handleOptionClick(index)}
                disabled={isDisabled || attemptState === 'complete' || isSubmitting}
                className={`
                  p-4 sm:p-6 min-h-[64px] sm:min-h-[72px] text-2xl sm:text-3xl font-sans border-2 transition-all
                  ${isDisabled ? 'opacity-30 cursor-not-allowed bg-gray-100 border-gray-300' : ''}
                  ${isWrong ? 'border-red-500 bg-red-50' : ''}
                  ${showAsCorrect ? 'border-green-500 bg-green-50' : ''}
                  ${!isDisabled && !isSelected && !showAsCorrect ? 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100' : ''}
                  rounded-xl
                `}
              >
                <span className="break-words">{option.display}</span>
              </button>
            )
          })}
        </div>
        
        {/* Feedback */}
        {feedback && (
          <div className="text-center">
            <div className={`
              inline-block px-6 py-3 rounded-lg text-lg
              ${attemptState === 'complete' && pointsAwarded > 0 ? 'bg-green-100 text-green-800' : ''}
              ${attemptState === 'complete' && pointsAwarded === 0 ? 'bg-orange-100 text-orange-800' : ''}
              ${attemptState === 'second' ? 'bg-yellow-100 text-yellow-800' : ''}
            `}>
              {feedback}
              {attemptState === 'complete' && pointsAwarded === 0 && correctOptionIndex !== null && (
                <span className="ml-2 font-bold">{drillAOptions[correctOptionIndex].display}</span>
              )}
            </div>
          </div>
        )}
        
        {/* Progress indicator / Next button */}
        <div className="mt-6 text-center relative z-10">
          {attemptState === 'first' && (
            <div className="text-sm text-ninja-gray font-bold uppercase tracking-wide">First attempt</div>
          )}
          {attemptState === 'second' && (
            <div className="text-sm text-ninja-yellow font-bold uppercase tracking-wide">Second attempt (retry)</div>
          )}
          {attemptState === 'complete' && (
            <button
              onClick={() => onComplete(pointsAwarded)}
              className="ninja-button ninja-button-lightning"
            >
              Next ⚡
            </button>
          )}
        </div>
      </div>
    )
  }

  // Render Drill B (Traditional) - Fire Element
  if (drill === DRILLS.TRAD && options.length > 0) {
    const drillBOptions = options as DrillBOption[]

    return (
      <div className="bg-white shadow-2xl p-4 sm:p-6 md:p-8 w-full sm:max-w-3xl mx-auto border-4 border-ninja-red relative overflow-hidden rounded-xl">
        {/* Subtle fire element overlay */}
        <div className="absolute inset-0 angular-stripe-fire opacity-10 pointer-events-none" />

        {/* Drill indicator badge */}
        <div className="absolute top-4 left-4 bg-ninja-red text-white px-3 py-1 font-bold text-sm shadow-lg rounded">
          🔥 DRILL B
        </div>

        {/* Prompt */}
        <div className="text-center mb-6 sm:mb-8 relative z-10 pt-12">
          <div className="text-xs sm:text-sm text-gray-600 mb-2 font-semibold uppercase tracking-wide">Simplified</div>
          <div className="text-7xl sm:text-8xl md:text-9xl font-serif mb-4">
            {queueEntry.entry.simp}
          </div>
          <div className="text-base sm:text-lg text-gray-700 font-semibold">
            Select the Traditional form
          </div>
        </div>
        
        {/* Options */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {drillBOptions.map((option, index) => {
            const isDisabled = disabledOptions.has(index)
            const isSelected = selectedOption === index
            const showAsCorrect = attemptState === 'complete' && index === correctOptionIndex
            const isWrong = isSelected && !showAsCorrect && attemptState !== 'first'
            
            return (
              <button
                key={index}
                onClick={() => handleOptionClick(index)}
                disabled={isDisabled || attemptState === 'complete' || isSubmitting}
                className={`
                  p-4 sm:p-6 min-h-[80px] sm:min-h-[96px] text-5xl sm:text-6xl font-serif border-2 transition-all
                  ${isDisabled ? 'opacity-30 cursor-not-allowed bg-gray-100 border-gray-300' : ''}
                  ${isWrong ? 'border-red-500 bg-red-50' : ''}
                  ${showAsCorrect ? 'border-green-500 bg-green-50' : ''}
                  ${!isDisabled && !isSelected && !showAsCorrect ? 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100' : ''}
                  rounded-xl
                `}
              >
                {option.traditional}
              </button>
            )
          })}
        </div>
        
        {/* Feedback */}
        {feedback && (
          <div className="text-center">
            <div className={`
              inline-block px-6 py-3 rounded-lg text-lg
              ${attemptState === 'complete' && pointsAwarded > 0 ? 'bg-green-100 text-green-800' : ''}
              ${attemptState === 'complete' && pointsAwarded === 0 ? 'bg-orange-100 text-orange-800' : ''}
              ${attemptState === 'second' ? 'bg-yellow-100 text-yellow-800' : ''}
            `}>
              {feedback}
              {attemptState === 'complete' && pointsAwarded === 0 && correctOptionIndex !== null && (
                <span className="ml-2 font-bold text-3xl">{drillBOptions[correctOptionIndex].traditional}</span>
              )}
            </div>
          </div>
        )}
        
        {/* Progress indicator / Next button */}
        <div className="mt-6 text-center relative z-10">
          {attemptState === 'first' && (
            <div className="text-sm text-ninja-gray font-bold uppercase tracking-wide">First attempt</div>
          )}
          {attemptState === 'second' && (
            <div className="text-sm text-ninja-orange font-bold uppercase tracking-wide">Second attempt (retry)</div>
          )}
          {attemptState === 'complete' && (
            <button
              onClick={() => onComplete(pointsAwarded)}
              className="ninja-button ninja-button-fire"
            >
              Next 🔥
            </button>
          )}
        </div>
      </div>
    )
  }

  // Loading state
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
      <div className="text-center text-gray-500">Loading drill...</div>
    </div>
  )
}
