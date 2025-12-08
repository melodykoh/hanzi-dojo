# fix: Drill A options shuffle/flash immediately after loading

**Type:** Bug Fix
**Priority:** P1 High
**Reported:** December 7, 2025
**Introduced:** PR #19 (December 6, 2025)

## Overview

When Drill A first loads, the four selection options visually change/shuffle right after loading without any user interaction. For example, if the first slot shows the second tone, it immediately shuffles to show a different tone. This happens for every new character that loads, but only once per load.

## Problem Statement

### User-Reported Behavior
- Options appear on screen
- Without user interaction, options immediately shuffle/change positions
- Happens consistently for every character in Drill A
- Only happens once per character load (not continuous)
- Was NOT observed before December 7, 2025 (before PR #21 merged)

### Business Impact
- **Child confusion:** Options move after child may have mentally selected an answer
- **Unprofessional appearance:** Makes app look buggy/unpolished
- **First impression:** New users see unstable UI on first training session

## Root Cause Analysis

### Timeline of Changes
| Date | PR | Change | Impact |
|------|-----|--------|--------|
| Nov 30 | PR #17 | Added `allPronunciations` to QueueEntry | Enabled synchronous data access |
| Dec 6 | PR #19 | Changed PracticeCard from async Supabase query to sync data | **BUG INTRODUCED** |
| Dec 7 | - | Bug observed | - |

### Technical Root Cause

**PR #19 commit 70b9178** changed `PracticeCard.tsx` from async Supabase query to synchronous data access. The network latency (~200-500ms) previously masked a timing issue that now manifests visually.

### The Real Problem: `onError` in Dependency Array

**File:** `src/components/PracticeCard.tsx:85`
```tsx
}, [queueEntry, drill, onError])  // ← onError causes re-triggers
```

The `onError` prop is a function. React compares dependencies by reference. If the parent component re-renders (for any reason), it creates a new `onError` function reference, which triggers the useEffect again, which re-shuffles the options.

### The Mechanism

```
Render 1: PracticeCard mounts
  └─> useEffect runs
       └─> buildDrillAOptions() with shuffle() → Options Set A
            └─> setOptions(A) → Component displays Set A

[Parent re-renders OR StrictMode double-render]

Render 2: onError has new reference
  └─> useEffect runs AGAIN (dependency changed!)
       └─> buildDrillAOptions() with NEW shuffle() → Options Set B
            └─> setOptions(B) → Component displays Set B (VISIBLE CHANGE!)
```

**Why only once per character:** After the initial re-render settles, dependencies stabilize.

## Proposed Solution

### Recommended: Simple useMemo (No Deterministic Shuffle Needed)

Replace `useEffect` + `useState` with `useMemo`. Once memoized, the shuffle only runs once per character - determinism is automatic.

### Why This Solution

| Approach | Fixes Bug | Complexity | Lines Changed |
|----------|-----------|------------|---------------|
| **A: Remove onError from deps** | **Yes** | **Minimal** | **1 line** |
| B: useMemo | Yes | Low | ~20 lines |
| ~~C: Deterministic shuffle~~ | ~~Overkill~~ | ~~High~~ | ~~100+ lines~~ |

**Reviewers unanimously agreed:** Deterministic shuffle is unnecessary. useMemo already provides determinism - same inputs produce same outputs, and it only runs once.

## Technical Approach

### Option A: Minimal Fix (1 line)

**File:** `src/components/PracticeCard.tsx:85`

```tsx
// BEFORE
}, [queueEntry, drill, onError])

// AFTER - just remove onError
}, [queueEntry, drill])
```

**Why this works:**
- `onError` doesn't affect option generation output
- Options only need to regenerate when entry or drill changes
- Removing it prevents the re-trigger that causes reshuffling

**ESLint note:** May need `// eslint-disable-next-line react-hooks/exhaustive-deps` if linter complains.

### Option B: useMemo (React Best Practice)

If we want to follow React conventions for derived state:

**File:** `src/components/PracticeCard.tsx`

**Before (lines 47-85):**
```tsx
const [options, setOptions] = useState<DrillAOption[] | DrillBOption[]>([])
const [correctOptionIndex, setCorrectOptionIndex] = useState<number | null>(null)

useEffect(() => {
  async function generateOptions() {
    if (drill === DRILLS.ZHUYIN) {
      const allValidPronunciations = queueEntry.allPronunciations || [queueEntry.reading.zhuyin]
      const drillAOptions = buildDrillAOptions(
        queueEntry.reading.zhuyin,
        allValidPronunciations
      )
      setOptions(drillAOptions)
      setCorrectOptionIndex(drillAOptions.findIndex(opt => opt.isCorrect))
    }
    // ... Drill B logic
  }
  generateOptions()
}, [queueEntry, drill, onError])
```

**After:**
```tsx
import { useMemo } from 'react'

// Replace useState + useEffect with useMemo
const { options, correctOptionIndex } = useMemo(() => {
  try {
    if (drill === DRILLS.ZHUYIN) {
      const allValidPronunciations = queueEntry.allPronunciations || [queueEntry.reading.zhuyin]
      const drillAOptions = buildDrillAOptions(
        queueEntry.reading.zhuyin,
        allValidPronunciations
      )
      const validation = validateDrillOptions(drillAOptions)
      if (!validation.valid) {
        throw new Error(`Invalid DrillA options: ${validation.error}`)
      }
      return {
        options: drillAOptions,
        correctOptionIndex: drillAOptions.findIndex(opt => opt.isCorrect)
      }
    } else if (drill === DRILLS.TRAD) {
      const drillBOptions = buildDrillBOptions(
        queueEntry.entry.simp,
        queueEntry.entry.trad
      )
      const validation = validateDrillOptions(drillBOptions)
      if (!validation.valid) {
        throw new Error(`Invalid DrillB options: ${validation.error}`)
      }
      return {
        options: drillBOptions,
        correctOptionIndex: drillBOptions.findIndex(opt => opt.isCorrect)
      }
    }
    return { options: [] as DrillAOption[], correctOptionIndex: -1 }
  } catch (error) {
    console.error('Failed to generate drill options:', error)
    onError?.(error instanceof Error ? error : new Error(String(error)))
    return { options: [] as DrillAOption[], correctOptionIndex: -1 }
  }
}, [queueEntry.entry.id, drill])  // Use stable primitive (entry.id), not object reference
```

### What NOT to Do (Removed from Original Plan)

~~**Deterministic shuffle with seeded random**~~ - REMOVED

Reviewers identified this as over-engineering:
- useMemo already provides determinism (only runs once per unique input)
- Seeded random adds 40+ lines of code
- Tests for PRNG don't test actual user behavior
- Adds complexity without user benefit

## Acceptance Criteria

### Functional Requirements
- [ ] Options render once and remain stable (no visual movement)
- [ ] Correct answer is always present in options
- [ ] Alternate pronunciations still excluded from distractors (PR #19 fix preserved)
- [ ] Both Drill A and Drill B work correctly

### Non-Functional Requirements
- [ ] Works in development mode (StrictMode enabled)
- [ ] Works in production (Vercel build)
- [ ] Drill generation time remains <10ms per character

### Quality Gates
- [ ] Existing unit tests pass
- [ ] Component test verifies stable options across re-renders
- [ ] Manual QA: Training Mode → Drill A → 5 characters (no shuffle)

## Test Plan

### Component Tests (`PracticeCard.test.tsx`)

```typescript
describe('PracticeCard option stability', () => {
  it('should not change options on re-render', async () => {
    const queueEntry = createMockQueueEntry('学')
    const { rerender, getAllByRole } = render(
      <PracticeCard
        queueEntry={queueEntry}
        drill={DRILLS.ZHUYIN}
        kidId="test-kid"
        onComplete={jest.fn()}
      />
    )

    // Get initial options
    const initialButtons = getAllByRole('button')
    const initialLabels = initialButtons.map(b => b.textContent)

    // Force re-render (simulates StrictMode or parent update)
    rerender(
      <PracticeCard
        queueEntry={queueEntry}
        drill={DRILLS.ZHUYIN}
        kidId="test-kid"
        onComplete={jest.fn()}
      />
    )

    // Get options after re-render
    const afterButtons = getAllByRole('button')
    const afterLabels = afterButtons.map(b => b.textContent)

    // Options should be identical
    expect(afterLabels).toEqual(initialLabels)
  })
})
```

### Manual QA Checklist

**Development Mode (localhost:5173):**
- [ ] Training Mode → Drill A → First question loads without shuffle
- [ ] Complete 5 questions → No shuffle on any load
- [ ] Switch to Drill B → Options stable
- [ ] Practice Demo → Drill A → Options stable

**Production Mode (Vercel):**
- [ ] Deploy preview build
- [ ] Training Mode → Drill A → Options stable
- [ ] Character '处' (chǔ/chù) → Correct pronunciation shown, alternate excluded

## Risk Analysis

### Low Risks
- **ESLint warning:** May need to suppress exhaustive-deps rule for Option A

### Mitigations
- Run full test suite before merge
- Manual QA with multi-pronunciation characters (处, 着, 了)
- Monitor console for errors after deploy

## Dependencies

- None (self-contained fix)

## References

### Internal References
- `src/components/PracticeCard.tsx:47-85` - Current useEffect implementation
- `src/components/PracticeCard.tsx:85` - Dependency array with onError
- `src/main.tsx:13` - StrictMode wrapper

### External References
- [React useMemo Documentation](https://react.dev/reference/react/useMemo)
- [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)

### Related PRs
- PR #17 (Nov 30): Added `allPronunciations` to QueueEntry
- PR #19 (Dec 6): Changed to synchronous data access (**introduced bug**)
