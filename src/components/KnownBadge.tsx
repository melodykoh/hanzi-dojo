// Known Badge - Dynamic status indicator for entries

import type { Entry, PracticeState } from '../types'
import { DRILLS } from '../types'
import { computeKnownStatus } from '../lib/practiceStateService'

// =============================================================================
// TYPES
// =============================================================================

export interface KnownBadgeProps {
  entry: Entry
  practiceStates: PracticeState[]
  size?: 'sm' | 'md' | 'lg'
  showDetails?: boolean
}

// =============================================================================
// COMPONENT
// =============================================================================

export function KnownBadge({
  entry,
  practiceStates,
  size = 'md',
  showDetails = false
}: KnownBadgeProps) {
  const status = computeKnownStatus(entry, practiceStates)
  
  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  }
  
  const iconSize = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  }
  
  // Known status
  if (status.isKnown) {
    return (
      <div className="inline-flex items-center gap-2">
        <div className={`${sizeClasses[size]} bg-green-100 text-green-800 rounded-full font-semibold flex items-center gap-1.5`}>
          <span className={iconSize[size]}>⭐</span>
          <span>Known</span>
        </div>
        
        {showDetails && (
          <div className="text-xs text-gray-600">
            {Object.entries(status.drillsStatus).map(([drill, drillStatus]) => {
              if (!drillStatus) return null
              return (
                <div key={drill} className="flex items-center gap-1">
                  <span className="capitalize">{drill}</span>: {drillStatus.totalSuccesses} successes
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }
  
  // Not practiced yet
  if (status.reasonCode === 'not_practiced') {
    return (
      <div className="inline-flex items-center gap-2">
        <div className={`${sizeClasses[size]} bg-gray-100 text-gray-600 rounded-full font-semibold flex items-center gap-1.5`}>
          <span className={iconSize[size]}>◯</span>
          <span>New</span>
        </div>
        
        {showDetails && (
          <div className="text-xs text-gray-600">
            Not yet practiced
          </div>
        )}
      </div>
    )
  }
  
  // Needs review (consecutive misses)
  if (status.reasonCode === 'too_many_consecutive_misses') {
    const strugglingDrills = Object.entries(status.drillsStatus)
      .filter(([_, drillStatus]) => drillStatus && drillStatus.consecutiveMisses >= 2)
      .map(([drill]) => drill)
    
    return (
      <div className="inline-flex items-center gap-2">
        <div className={`${sizeClasses[size]} bg-red-100 text-red-800 rounded-full font-semibold flex items-center gap-1.5`}>
          <span className={iconSize[size]}>🔁</span>
          <span>Needs Review</span>
        </div>
        
        {showDetails && (
          <div className="text-xs text-red-600">
            Struggling with: {strugglingDrills.join(', ')}
          </div>
        )}
      </div>
    )
  }
  
  // In progress (not enough successes)
  if (status.reasonCode === 'not_enough_successes') {
    const inProgressDrills = Object.entries(status.drillsStatus)
      .filter(([_, drillStatus]) => drillStatus && drillStatus.totalSuccesses < 2)
      .map(([drill, drillStatus]) => ({
        drill,
        successes: drillStatus?.totalSuccesses || 0
      }))
    
    return (
      <div className="inline-flex items-center gap-2">
        <div className={`${sizeClasses[size]} bg-blue-100 text-blue-800 rounded-full font-semibold flex items-center gap-1.5`}>
          <span className={iconSize[size]}>⏳</span>
          <span>In Progress</span>
        </div>
        
        {showDetails && (
          <div className="text-xs text-blue-600">
            {inProgressDrills.map(({ drill, successes }) => (
              <div key={drill}>
                <span className="capitalize">{drill}</span>: {successes}/2 successes
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
  
  return null
}

// =============================================================================
// DRILL-SPECIFIC BADGE
// =============================================================================

export interface DrillKnownBadgeProps {
  practiceState: PracticeState | null
  size?: 'sm' | 'md' | 'lg'
}

export function DrillKnownBadge({ practiceState, size = 'sm' }: DrillKnownBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  }
  
  if (!practiceState) {
    return (
      <span className={`${sizeClasses[size]} bg-gray-100 text-gray-600 rounded-full`}>
        New
      </span>
    )
  }
  
  const totalSuccesses = practiceState.first_try_success_count + practiceState.second_try_success_count
  const isKnown = totalSuccesses >= 2 && practiceState.consecutive_miss_count < 2
  
  if (isKnown) {
    return (
      <span className={`${sizeClasses[size]} bg-green-100 text-green-700 rounded-full font-semibold`}>
        ⭐ Known
      </span>
    )
  }
  
  if (practiceState.consecutive_miss_count >= 2) {
    return (
      <span className={`${sizeClasses[size]} bg-red-100 text-red-700 rounded-full font-semibold`}>
        🔁 Review
      </span>
    )
  }
  
  return (
    <span className={`${sizeClasses[size]} bg-blue-100 text-blue-700 rounded-full`}>
      ⏳ {totalSuccesses}/2
    </span>
  )
}

// =============================================================================
// USAGE EXAMPLE
// =============================================================================

export function KnownBadgeDemo() {
  // Mock data for demonstration
  const mockEntry: Entry = {
    id: '1',
    owner_id: 'user1',
    kid_id: 'kid1',
    simp: '太',
    trad: '太',
    type: 'char',
    applicable_drills: [DRILLS.ZHUYIN],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const knownState: PracticeState = {
    id: '1',
    kid_id: 'kid1',
    entry_id: '1',
    drill: DRILLS.ZHUYIN,
    first_try_success_count: 2,
    second_try_success_count: 1,
    consecutive_miss_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  const inProgressState: PracticeState = {
    ...knownState,
    id: '2',
    first_try_success_count: 1,
    second_try_success_count: 0
  }
  
  const strugglingState: PracticeState = {
    ...knownState,
    id: '3',
    first_try_success_count: 1,
    second_try_success_count: 1,
    consecutive_miss_count: 2
  }
  
  return (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-bold mb-4">Known Badge Demo</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Known Status</h3>
          <KnownBadge entry={mockEntry} practiceStates={[knownState]} size="md" showDetails />
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">In Progress</h3>
          <KnownBadge entry={mockEntry} practiceStates={[inProgressState]} size="md" showDetails />
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Needs Review</h3>
          <KnownBadge entry={mockEntry} practiceStates={[strugglingState]} size="md" showDetails />
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Not Practiced</h3>
          <KnownBadge entry={mockEntry} practiceStates={[]} size="md" showDetails />
        </div>
      </div>
      
      <div className="pt-8 border-t space-y-4">
        <h3 className="font-semibold mb-2">Drill-Specific Badges</h3>
        <div className="flex gap-4 items-center">
          <DrillKnownBadge practiceState={knownState} size="md" />
          <DrillKnownBadge practiceState={inProgressState} size="md" />
          <DrillKnownBadge practiceState={strugglingState} size="md" />
          <DrillKnownBadge practiceState={null} size="md" />
        </div>
      </div>
    </div>
  )
}
