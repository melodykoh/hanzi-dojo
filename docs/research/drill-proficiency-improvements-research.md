# Research Report: Drill Proficiency Overview Improvements

**Feature:** Clickable struggling characters and expanded recency window for drill proficiency overview

**Date:** 2025-12-30

**Research Scope:** Dashboard drill proficiency overview implementation, struggling character calculation, "last 10 first tries" logic, clickable/expandable UI patterns, and practice event data structures.

---

## 1. Dashboard Drill Proficiency Overview Location

### Primary Component: DrillBalanceWidget
**File:** `/Users/melodykoh/Documents/Claude Projects - Coding/Hanzi Dojo/src/components/DrillBalanceWidget.tsx`

**Current Implementation (lines 1-139):**
- Displays proficiency metrics for Drill A (Zhuyin) and Drill B (Traditional)
- Shows per-drill:
  - Accuracy percentage (from last 10 first tries)
  - Queue depth (items available)
  - Struggling count (items with consecutive_miss_count >= 2)
  - Needs attention flag
- Non-interactive display (no click handlers)

**Key Rendering Function:**
```typescript
const renderDrillRow = (
  name: string,
  description: string,
  proficiency: typeof drillA,
  emoji: string
) => {
  // Lines 47-117
  // Displays:
  // - Accuracy bar (green/yellow/orange based on %)
  // - Queue depth: "📝 X items"
  // - Struggling count: "⚠️ X struggling" (line 100-104)
  // - No click handlers currently
}
```

**Location in Dashboard:**
```typescript
// /Users/melodykoh/Documents/Claude Projects - Coding/Hanzi Dojo/src/components/Dashboard.tsx
// Lines 339-350 (Dashboard tab content)
{activeTab === 'metrics' && (
  <>
    {session && kidId ? (
      <div className="space-y-6">
        <DrillBalanceWidget kidId={kidId} />  // ← Here
        <DashboardMetrics kidId={kidId} />
      </div>
    ) : (
      <DemoDashboard />
    )}
  </>
)}
```

---

## 2. Struggling Characters Calculation

### Service: drillBalanceService
**File:** `/Users/melodykoh/Documents/Claude Projects - Coding/Hanzi Dojo/src/lib/drillBalanceService.ts`

**Calculation Logic (lines 73-79):**
```typescript
// Count struggling items (consecutive_miss_count >= 2)
const { count: strugglingCount } = await supabase
  .from('practice_state')
  .select('*', { count: 'exact', head: true })
  .eq('kid_id', kidId)
  .eq('drill', drill)
  .gte('consecutive_miss_count', 2)  // ← Threshold
```

**Practice State Schema:**
- Table: `practice_state`
- Relevant columns (from `/Users/melodykoh/Documents/Claude Projects - Coding/Hanzi Dojo/src/types/index.ts` lines 53-65):
  ```typescript
  export interface PracticeState {
    id: string
    kid_id: string
    entry_id: string
    drill: PracticeDrill
    first_try_success_count: number
    second_try_success_count: number
    consecutive_miss_count: number  // ← Used for "struggling"
    last_attempt_at?: string
    last_success_at?: string
    created_at: string
    updated_at: string
  }
  ```

**Known Status Logic (used elsewhere):**
- From `/Users/melodykoh/Documents/Claude Projects - Coding/Hanzi Dojo/src/lib/practiceStateService.ts` (lines 69-81):
  ```typescript
  export function isDrillKnown(state: PracticeState): boolean {
    const totalSuccesses = state.first_try_success_count + state.second_try_success_count
    return (
      totalSuccesses >= KNOWN_THRESHOLD &&  // KNOWN_THRESHOLD = 2
      state.consecutive_miss_count < DEMOTION_THRESHOLD  // DEMOTION_THRESHOLD = 2
    )
  }
  ```

**Struggling Definition:**
- `consecutive_miss_count >= 2` (demotion threshold)
- Opposite of "known" status
- Calculated per (kid, entry, drill) tuple

---

## 3. "Last 10 First Tries" Logic

### Accuracy Calculation
**File:** `/Users/melodykoh/Documents/Claude Projects - Coding/Hanzi Dojo/src/lib/drillBalanceService.ts`

**Query (lines 56-70):**
```typescript
// Calculate average first-try accuracy from recent practice events
const { data: recentEvents, error: eventsError } = await supabase
  .from('practice_events')
  .select('is_correct')
  .eq('kid_id', kidId)
  .eq('drill', drill)
  .eq('attempt_index', 1)  // ← First try only
  .order('created_at', { ascending: false })  // ← Most recent first
  .limit(10)  // ← Last 10 attempts

const avgAccuracy = recentEvents && recentEvents.length > 0
  ? Math.round((recentEvents.filter(e => e.is_correct).length / recentEvents.length) * 100)
  : null
```

**Practice Events Schema:**
- Table: `practice_events` (from migration file)
  ```sql
  CREATE TABLE practice_events (
    id UUID PRIMARY KEY,
    kid_id UUID NOT NULL,
    entry_id UUID NOT NULL,
    drill practice_drill NOT NULL,
    attempt_index INT NOT NULL CHECK (attempt_index IN (1, 2)),  -- 1st or 2nd attempt
    is_correct BOOLEAN NOT NULL,
    points_awarded NUMERIC(3,1) NOT NULL,
    chosen_option JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
  ```

**Type Definition:**
- From `/Users/melodykoh/Documents/Claude Projects - Coding/Hanzi Dojo/src/types/index.ts` (lines 67-77):
  ```typescript
  export interface PracticeEvent {
    id: string
    kid_id: string
    entry_id: string
    drill: PracticeDrill
    attempt_index: 1 | 2  // ← First or second attempt
    is_correct: boolean
    points_awarded: 0 | 0.5 | 1.0
    chosen_option?: unknown
    created_at: string
  }
  ```

**Current Limitation:**
- Only considers **last 10 practice events** globally for the drill
- Does **not** track which specific entries those events belong to
- Cannot identify **which characters** are struggling from this query alone

---

## 4. Retrieving Struggling Characters

### Query to Get Struggling Entries
**Pattern found in:** `/Users/melodykoh/Documents/Claude Projects - Coding/Hanzi Dojo/src/components/EntryCatalog.tsx`

**Relevant Code (lines 77-148):**
```typescript
async function loadEntries() {
  // Fetch all entries
  const { data: entries } = await supabase
    .from('entries')
    .select('*')
    .eq('kid_id', kidId)

  // Fetch all practice states
  const { data: states } = await supabase
    .from('practice_state')
    .select('*')
    .eq('kid_id', kidId)

  // Build catalog items
  const catalogItems = entries.map(entry => {
    const entryStates = states.filter(s => s.entry_id === entry.id)

    // Count struggling (consecutive misses >= 2)
    const strugglingCount = entryStates.filter(s => s.consecutive_miss_count >= 2).length

    // ... other calculations
    return {
      entry,
      practiceStates: entryStates,
      strugglingCount,
      // ...
    }
  })
}
```

**Needed Query for Feature:**
```typescript
// Get struggling entries for a specific drill
const { data: strugglingEntries } = await supabase
  .from('practice_state')
  .select(`
    *,
    entries:entry_id (
      id,
      simp,
      trad,
      type,
      applicable_drills
    )
  `)
  .eq('kid_id', kidId)
  .eq('drill', drill)
  .gte('consecutive_miss_count', 2)  // Struggling threshold
  .order('consecutive_miss_count', { ascending: false })  // Most struggling first
```

---

## 5. Existing Modal/Detail View Patterns

### Modal Pattern 1: DrillSelectionModal
**File:** `/Users/melodykoh/Documents/Claude Projects - Coding/Hanzi Dojo/src/components/DrillSelectionModal.tsx`

**Structure (lines 101-223):**
```typescript
export function DrillSelectionModal({ kidId, onSelectDrill, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🎯 Choose Your Practice Drill</h2>

        {/* Recommendation chip */}
        {recommendation && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            {/* ... */}
          </div>
        )}

        {/* Drill options */}
        <div className="space-y-3 mb-6">
          {drillsInfo.map((info) => (
            <button
              key={info.drill}
              onClick={() => setSelectedDrill(info.drill)}
              className={`w-full text-left p-4 rounded-lg border-2 ${
                isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
              }`}
            >
              {/* Drill details */}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onCancel}>Cancel</button>
          <button onClick={handleStart}>Start Practice</button>
        </div>
      </div>
    </div>
  )
}
```

**Key Patterns:**
- Fixed overlay: `fixed inset-0 bg-black bg-opacity-50`
- Centered modal: `flex items-center justify-center`
- White content card: `bg-white rounded-lg shadow-xl`
- Max width constraint: `max-w-md w-full`
- Two-button footer: Cancel + Primary action

---

### Modal Pattern 2: OfflineModal
**File:** `/Users/melodykoh/Documents/Claude Projects - Coding/Hanzi Dojo/src/components/OfflineModal.tsx`

**Structure (lines 23-77):**
```typescript
return (
  <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-12 text-center">
      {/* Dojo-themed illustration */}
      <div className="mb-6">
        <div className="text-8xl mb-2">🥋</div>
        <div className="text-6xl">💤</div>
      </div>

      <h2 className="text-4xl font-bold text-gray-900 mb-4">Training Paused</h2>

      {/* Message */}
      <div className="text-xl text-gray-700 mb-8 space-y-3">
        <p className="font-semibold">Sensei cannot reach the dojo right now.</p>
        <p className="text-lg text-gray-600">Check your internet connection...</p>
      </div>

      {/* Status indicator */}
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-8">
        <div className="flex items-center justify-center gap-3 text-red-700">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="font-semibold text-lg">Connection Lost</span>
        </div>
      </div>

      <button onClick={handleRetry}>Retry Connection</button>
    </div>
  </div>
)
```

**Key Patterns:**
- Backdrop blur for emphasis: `backdrop-blur-sm`
- Center-aligned content: `text-center`
- Large emoji illustrations: `text-8xl`
- Status indicators with color-coded backgrounds
- Single action button

---

### Modal Pattern 3: Detail View in EntryCatalog
**File:** `/Users/melodykoh/Documents/Claude Projects - Coding/Hanzi Dojo/src/components/EntryCatalog.tsx`

**Usage (lines 350-550+):**
```typescript
{selectedEntry && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Character Details</h2>
          <button onClick={() => setSelectedEntry(null)}>✕</button>
        </div>
      </div>

      <div className="p-6">
        {/* Character display */}
        <div className="text-center mb-6">
          <div className="text-7xl font-serif mb-2">{selectedEntry.entry.simp}</div>
          {/* ... */}
        </div>

        {/* Practice stats */}
        <div className="space-y-4">
          {/* Familiarity, drill states, etc. */}
        </div>

        {/* Pronunciation variants (if multi-reading) */}
        {selectedEntry.needsPronunciationReview && (
          <div className="bg-yellow-50 border-2 border-yellow-200 p-4">
            {/* Pronunciation selection UI */}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
        <button onClick={() => setSelectedEntry(null)}>Close</button>
      </div>
    </div>
  </div>
)}
```

**Key Patterns:**
- Scrollable modal: `max-h-[90vh] overflow-y-auto`
- Sticky header/footer: `sticky top-0` / `sticky bottom-0`
- Large character display: `text-7xl font-serif`
- Expandable sections within modal
- Close button in top-right: `✕`

---

## 6. Clickable UI Patterns

### Pattern: Dictionary Demo Clickable Search
**File:** `/Users/melodykoh/Documents/Claude Projects - Coding/Hanzi Dojo/src/components/DictionaryDemo.tsx`

**Not directly applicable** - no expandable lists, just form inputs

### Pattern: Entry Catalog Row Click
**File:** `/Users/melodykoh/Documents/Claude Projects - Coding/Hanzi Dojo/src/components/EntryCatalog.tsx`

**Clickable Row (lines 400-500+):**
```typescript
<div
  onClick={() => setSelectedEntry(item)}
  className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow"
>
  {/* Entry content */}
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="text-4xl font-serif">{item.entry.simp}</div>
      {/* ... */}
    </div>
  </div>

  {/* Stats badges */}
  <div className="flex gap-2 mt-2">
    {item.strugglingCount > 0 && (
      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded">
        ⚠️ {item.strugglingCount} struggling
      </span>
    )}
    {/* ... */}
  </div>
</div>
```

**Key Patterns:**
- `cursor-pointer` for clickable indication
- `hover:shadow-md` for hover feedback
- `onClick={() => setSelectedEntry(item)}` for modal trigger
- Badge display: `bg-orange-100 text-orange-800`

---

## 7. Data Structures Needed for Feature

### DrillProficiency Interface
**Current (from drillBalanceService.ts lines 12-18):**
```typescript
export interface DrillProficiency {
  drill: PracticeDrill
  queueDepth: number
  avgAccuracy: number | null  // % correct on first try (last 10 attempts)
  strugglingCount: number      // Items with consecutive_miss_count >= 2
  needsAttention: boolean
}
```

### Proposed: StrugglingEntry Interface
```typescript
export interface StrugglingEntry {
  entry_id: string
  simp: string
  trad: string
  consecutive_miss_count: number
  last_attempt_at: string | null
  first_try_success_count: number
  second_try_success_count: number
  familiarity: number  // Computed: first * 1.0 + second * 0.5
}
```

### Proposed: ExtendedDrillProficiency
```typescript
export interface ExtendedDrillProficiency extends DrillProficiency {
  strugglingEntries?: StrugglingEntry[]  // Lazy-loaded when clicked
  recentAttempts?: number  // Count of practice_events in last N days
}
```

---

## 8. Query Patterns for Expanded Recency Window

### Current: Last 10 First Tries (Global)
```typescript
// From drillBalanceService.ts
const { data: recentEvents } = await supabase
  .from('practice_events')
  .select('is_correct')
  .eq('kid_id', kidId)
  .eq('drill', drill)
  .eq('attempt_index', 1)
  .order('created_at', { ascending: false })
  .limit(10)  // ← Fixed window
```

### Proposed: Last N Days (Configurable)
```typescript
// Option 1: Time-based window (last 30 days)
const thirtyDaysAgo = new Date()
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

const { data: recentEvents } = await supabase
  .from('practice_events')
  .select('is_correct, entry_id')
  .eq('kid_id', kidId)
  .eq('drill', drill)
  .eq('attempt_index', 1)
  .gte('created_at', thirtyDaysAgo.toISOString())  // ← Time-based
  .order('created_at', { ascending: false })
```

### Proposed: Last N Attempts with Min/Max
```typescript
// Option 2: Configurable attempt count with bounds
const windowSize = 20  // Configurable
const minWindow = 10
const maxWindow = 50

const { data: recentEvents } = await supabase
  .from('practice_events')
  .select('is_correct, entry_id, created_at')
  .eq('kid_id', kidId)
  .eq('drill', drill)
  .eq('attempt_index', 1)
  .order('created_at', { ascending: false })
  .limit(Math.min(Math.max(windowSize, minWindow), maxWindow))
```

### Proposed: Per-Entry Recency (Most Granular)
```typescript
// Option 3: Track recency per entry (for detailed modal)
const { data: entryHistory } = await supabase
  .from('practice_events')
  .select('is_correct, attempt_index, created_at')
  .eq('kid_id', kidId)
  .eq('entry_id', entryId)  // ← Specific character
  .eq('drill', drill)
  .order('created_at', { ascending: false })
  .limit(20)  // Last 20 attempts for this character
```

---

## 9. Ninjago Theme Design Patterns

### Color Palette (from Dashboard header, lines 182-252)
```typescript
// Fire Element Theme (Primary - Red)
className="bg-gradient-to-r from-ninja-red to-ninja-red-dark"

// Gold (Accent)
className="bg-ninja-gold text-gray-900"

// Status Colors
// - Struggling: orange (bg-orange-100 text-orange-800)
// - Warning: yellow (bg-yellow-50 border-yellow-200)
// - Success: green (bg-green-500)
// - Info: blue (bg-blue-50 border-blue-500)
```

### Button Styles
```typescript
// Primary action (from Dashboard.tsx line 238)
className="ninja-button ninja-button-lightning"

// Gold action (line 244)
className="ninja-button ninja-button-gold"

// Fire action (from OfflineModal.tsx line 59)
className="ninja-button ninja-button-fire"
```

### Visual Elements
```typescript
// Emoji usage
"⚠️"  // Struggling indicator
"📝"  // Queue depth
"✓"   // Accuracy
"💡"  // Tip/recommendation
"🥋"  // Dojo/training
"⚔️"  // Combat/practice

// Ninja star (Dashboard.tsx lines 187-194)
<div className="absolute top-4 right-4 w-12 h-12 text-ninja-gold opacity-20 ninja-star-spin">
  <svg viewBox="0 0 100 100">
    <path d="M50,10 L55,40 L85,35 L60,55 L80,80 L50,65 L20,80 L40,55 L15,35 L45,40 Z"/>
  </svg>
</div>
```

---

## 10. Implementation Recommendations

### Phase 1: Make Struggling Count Clickable
**File to modify:** `DrillBalanceWidget.tsx`

1. **Add state for modal:**
   ```typescript
   const [showStrugglingModal, setShowStrugglingModal] = useState(false)
   const [selectedDrill, setSelectedDrill] = useState<PracticeDrill | null>(null)
   const [strugglingEntries, setStrugglingEntries] = useState<StrugglingEntry[]>([])
   ```

2. **Make struggling count clickable (line 100-104):**
   ```typescript
   {proficiency.strugglingCount > 0 && (
     <button
       onClick={(e) => {
         e.stopPropagation()
         handleShowStruggling(proficiency.drill)
       }}
       className="text-orange-600 font-medium hover:underline cursor-pointer"
     >
       ⚠️ {proficiency.strugglingCount} struggling
     </button>
   )}
   ```

3. **Add handler to load struggling entries:**
   ```typescript
   async function handleShowStruggling(drill: PracticeDrill) {
     setSelectedDrill(drill)

     const { data: entries } = await supabase
       .from('practice_state')
       .select(`
         entry_id,
         consecutive_miss_count,
         last_attempt_at,
         first_try_success_count,
         second_try_success_count,
         entries:entry_id (simp, trad)
       `)
       .eq('kid_id', kidId)
       .eq('drill', drill)
       .gte('consecutive_miss_count', 2)
       .order('consecutive_miss_count', { ascending: false })

     setStrugglingEntries(entries || [])
     setShowStrugglingModal(true)
   }
   ```

4. **Add modal component (similar to DrillSelectionModal pattern):**
   ```typescript
   {showStrugglingModal && (
     <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
       <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
         <div className="sticky top-0 bg-white border-b p-6">
           <div className="flex items-center justify-between">
             <h2 className="text-2xl font-bold">
               ⚠️ Struggling Characters - {selectedDrill === DRILLS.ZHUYIN ? 'Drill A' : 'Drill B'}
             </h2>
             <button onClick={() => setShowStrugglingModal(false)}>✕</button>
           </div>
         </div>

         <div className="p-6">
           <div className="space-y-3">
             {strugglingEntries.map(entry => (
               <div key={entry.entry_id} className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                     <div className="text-5xl font-serif">{entry.simp}</div>
                     {entry.simp !== entry.trad && (
                       <div className="text-4xl font-serif text-gray-400">{entry.trad}</div>
                     )}
                   </div>
                   <div className="text-right">
                     <div className="text-sm text-gray-600">Consecutive misses</div>
                     <div className="text-2xl font-bold text-orange-600">{entry.consecutive_miss_count}</div>
                   </div>
                 </div>
                 <div className="mt-2 text-sm text-gray-600">
                   Familiarity: {entry.first_try_success_count * 1.0 + entry.second_try_success_count * 0.5} pts
                 </div>
               </div>
             ))}
           </div>
         </div>
       </div>
     </div>
   )}
   ```

---

### Phase 2: Expand Recency Window

**File to modify:** `drillBalanceService.ts`

**Option A: Configurable Window Size**
```typescript
export async function calculateDrillProficiency(
  kidId: string,
  drill: PracticeDrill,
  options?: {
    accuracyWindow?: number  // Default: 10
  }
): Promise<DrillProficiency> {
  const windowSize = options?.accuracyWindow || 10

  const { data: recentEvents } = await supabase
    .from('practice_events')
    .select('is_correct')
    .eq('kid_id', kidId)
    .eq('drill', drill)
    .eq('attempt_index', 1)
    .order('created_at', { ascending: false })
    .limit(windowSize)  // ← Configurable

  // ... rest of calculation
}
```

**Option B: Time-Based Window (Last 30 Days)**
```typescript
export async function calculateDrillProficiency(
  kidId: string,
  drill: PracticeDrill,
  options?: {
    accuracyDays?: number  // Default: null (use count-based)
    accuracyWindow?: number  // Default: 10
  }
): Promise<DrillProficiency> {
  let query = supabase
    .from('practice_events')
    .select('is_correct')
    .eq('kid_id', kidId)
    .eq('drill', drill)
    .eq('attempt_index', 1)
    .order('created_at', { ascending: false })

  if (options?.accuracyDays) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - options.accuracyDays)
    query = query.gte('created_at', cutoffDate.toISOString())
  } else {
    query = query.limit(options?.accuracyWindow || 10)
  }

  const { data: recentEvents } = await query

  // ... rest of calculation
}
```

**Recommendation:** Start with Option A (configurable count) for simplicity, consider Option B (time-based) if user wants calendar-based windows.

---

## 11. Summary of Key Files

### Components
| File | Purpose | Lines of Interest |
|------|---------|-------------------|
| `/src/components/DrillBalanceWidget.tsx` | Main proficiency widget | 1-139 (entire file) |
| `/src/components/Dashboard.tsx` | Parent container | 339-350 (widget placement) |
| `/src/components/DrillSelectionModal.tsx` | Modal pattern reference | 101-223 (modal structure) |
| `/src/components/EntryCatalog.tsx` | Detail view pattern | 148 (struggling calculation), 400-500 (clickable rows) |

### Services
| File | Purpose | Lines of Interest |
|------|---------|-------------------|
| `/src/lib/drillBalanceService.ts` | Proficiency calculation | 34-88 (proficiency calc), 56-70 (last 10 query) |
| `/src/lib/practiceStateService.ts` | Known/struggling logic | 69-81 (isDrillKnown) |

### Types
| File | Purpose | Lines of Interest |
|------|---------|-------------------|
| `/src/types/index.ts` | Type definitions | 53-65 (PracticeState), 67-77 (PracticeEvent) |

### Database
| File | Purpose | Lines of Interest |
|------|---------|-------------------|
| `/supabase/migrations/001_initial_schema.sql` | Schema definitions | 124-142 (practice_events table) |

---

## 12. Next Steps

1. **Confirm requirements with user:**
   - Desired recency window (count-based or time-based?)
   - Modal design preferences (full details vs. simple list?)
   - Should clicking a struggling character navigate to EntryCatalog detail view or show inline modal?

2. **Implementation sequence:**
   - [ ] Phase 1: Add click handler to struggling count
   - [ ] Phase 1: Create StrugglingCharactersModal component
   - [ ] Phase 1: Add query to load struggling entries
   - [ ] Phase 2: Add recency window configuration
   - [ ] Phase 2: Update proficiency calculation to use new window

3. **Testing considerations:**
   - Test with users who have 0 struggling characters
   - Test with users who have >10 struggling characters (pagination?)
   - Test recency window edge cases (no recent practice, exactly 10 events, etc.)

---

**Research completed:** 2025-12-30
**Researcher:** Claude (Sonnet 4.5)
**Files analyzed:** 12 source files, 1 migration file
**Total lines reviewed:** ~2,000+ lines of code
