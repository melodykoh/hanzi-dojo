# feat: Drill Proficiency Overview - Clickable Struggling & Expanded Recency Window

## Overview

Enhance the Dashboard's Drill Proficiency overview (DrillBalanceWidget) with two improvements:
1. **Clickable struggling count** - Click "X struggling" to see which characters need attention
2. **Expanded recency window** - Toggle between "Recent" (last 10) and "All Time" accuracy views

## Problem Statement / Motivation

**Current limitations:**
- Parents see "X struggling" count but can't identify which specific characters need work
- Accuracy is limited to last 10 first-try events, which may not reflect overall progress
- No way to compare recent performance vs. historical trends

**Why this matters:**
- Parents need to know which characters to focus on during practice
- Understanding progress trends helps parents make informed decisions about study time
- Actionable insights increase engagement and motivation

## Proposed Solution

### Feature 1: Clickable Struggling Characters

Make the struggling count clickable to open a modal showing character details:

```
[Drill A: Zhuyin Recognition]
Accuracy: 85% | [12 struggling] ← Click to view details | 45 known
```

**Modal displays:**
- Character (simplified, traditional)
- Zhuyin pronunciation
- Consecutive miss count
- Last practiced date

### Feature 2: Recent vs All Time Toggle

Add a toggle control to switch accuracy views:

```
[Drill A: Zhuyin Recognition]
Accuracy: [Last Week] [Last 60 Days] ← Tab-style toggle
85% | 12 struggling | 45 known
```

**Behavior:**
- **Last Week** = Practice events from last 7 days
- **Last 60 Days** = Practice events from last 60 days
- **No data** = Show "N/A" if no events in timeframe

## Technical Approach

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/DrillBalanceWidget.tsx` | Add click handler, toggle state, modal trigger |
| `src/lib/drillBalanceService.ts` | New query for struggling character details |
| `src/components/StrugglingCharactersModal.tsx` | **NEW** - Modal component (a11y concerns justify separate file) |

**NOT creating:** `src/hooks/useToggle.ts` - Inline `useState` instead (per reviewer feedback)

### Data Structures

```typescript
// Inline in StrugglingCharactersModal.tsx
interface StrugglingCharacter {
  entry_id: string;
  simplified: string;
  traditional: string;
  zhuyin: string;
  consecutive_miss_count: number;
  last_practiced_at: string | null;
}

type AccuracyTimeframe = 'recent' | 'all-time';
```

### Design Rationale (from code review)

**Why time-based filtering (7 days / 60 days)?**
- More intuitive for parents than event counts
- Simpler SQL (date filter vs limit)
- Consistent across practice frequencies
- "Last Week" and "Last 60 Days" are self-explanatory

**Why separate modal component?**
- 130+ lines with distinct a11y concerns (focus trap, ARIA, escape key)
- Testable in isolation
- Keeps DrillBalanceWidget focused on orchestration

**Why NOT useToggle hook?**
- Only used in ONE place
- Inline `useState` is clearer and has zero cognitive overhead
- Avoid premature abstraction

### Supabase Query for Struggling Characters

```sql
SELECT
  e.id as entry_id,
  e.simplified,
  e.traditional,
  d.zhuyin,
  ps.consecutive_miss_count,
  ps.last_practiced_at
FROM practice_state ps
JOIN entries e ON ps.entry_id = e.id
JOIN dictionary d ON e.simplified = d.simp
WHERE ps.kid_id = $1
  AND ps.drill = $2
  AND ps.consecutive_miss_count >= 2
ORDER BY ps.consecutive_miss_count DESC, ps.last_practiced_at ASC
LIMIT 50;
```

### Accuracy Calculation Changes

```typescript
// drillBalanceService.ts
export async function getDrillAccuracy(
  kidId: string,
  drill: DrillType,
  days: number = 7  // 7 for "Last Week", 60 for "Last 60 Days"
): Promise<number | null> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const { data } = await supabase
    .from('practice_events')
    .select('is_correct')
    .eq('kid_id', kidId)
    .eq('drill', drill)
    .eq('attempt_index', 1) // First tries only
    .gte('created_at', cutoffDate.toISOString());

  // Return null for "N/A" display when no events in timeframe
  if (!data || data.length === 0) return null;

  const correct = data.filter(e => e.is_correct).length;
  return Math.round((correct / data.length) * 100);
}
```

## Acceptance Criteria

### Feature 1: Clickable Struggling Count
- [ ] Struggling count text has hover state (pointer cursor, underline or color change)
- [ ] Clicking opens modal with list of struggling characters
- [ ] Modal shows: character, zhuyin, consecutive miss count, last practiced
- [ ] Modal sorted by severity (highest miss count first)
- [ ] Modal has close button (X) and responds to Escape key
- [ ] When count is 0, click is disabled (no modal opens)

### Feature 2: Accuracy Timeframe Toggle
- [ ] Tab-style toggle appears with "Last Week" and "Last 60 Days" options
- [ ] "Last Week" selected by default
- [ ] Clicking "Last 60 Days" recalculates accuracy for events in last 60 days
- [ ] Toggle state persists per drill (not global)
- [ ] Loading state shown during recalculation

### Empty/Edge States
- [ ] 0 struggling: Text is muted, not clickable
- [ ] No events in timeframe: Show "N/A"
- [ ] Loading: Show spinner while fetching
- [ ] Error: Graceful fallback with retry option

### Accessibility
- [ ] Modal has proper ARIA attributes (role="dialog", aria-modal="true")
- [ ] Focus trapped within modal when open
- [ ] Focus returns to trigger when modal closes
- [ ] Toggle buttons have proper aria-pressed/aria-selected state

## MVP Implementation

### StrugglingCharactersModal.tsx

```typescript
// src/components/StrugglingCharactersModal.tsx
import { useEffect, useRef } from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface StrugglingCharacter {
  entry_id: string;
  simplified: string;
  traditional: string;
  zhuyin: string;
  consecutive_miss_count: number;
  last_practiced_at: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  drill: string;
  characters: StrugglingCharacter[];
  isLoading?: boolean;
}

export function StrugglingCharactersModal({ isOpen, onClose, drill, characters, isLoading }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap & escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    modalRef.current?.focus();

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const drillLabel = drill === 'drill_a' ? 'Drill A: Zhuyin Recognition' : 'Drill B: Simplified→Traditional';

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-ninja-red/10">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="w-6 h-6 text-ninja-red" />
            <h2 id="modal-title" className="text-lg font-bold text-ninja-black">
              Struggling Characters
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-ninja-red/20 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Drill Label */}
        <div className="px-4 py-2 bg-gray-50 text-sm text-gray-600">
          {drillLabel}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-96">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : characters.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl">🎉</span>
              <p className="mt-2 text-gray-600">All characters mastered!</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {characters.map((char) => (
                <li
                  key={char.entry_id}
                  className="flex items-center justify-between p-3 bg-ninja-red/5 rounded-lg border border-ninja-red/20"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-bold">{char.simplified}</span>
                    {char.traditional !== char.simplified && (
                      <span className="text-xl text-gray-500">{char.traditional}</span>
                    )}
                    <span className="text-sm text-gray-600">{char.zhuyin}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-ninja-red font-semibold">
                      {char.consecutive_miss_count} misses
                    </div>
                    {char.last_practiced_at && (
                      <div className="text-xs text-gray-500">
                        {new Date(char.last_practiced_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
```

### DrillBalanceWidget Updates

```typescript
// Add to DrillBalanceWidget.tsx

// State - inline useState, no custom hook needed
const [showStrugglingModal, setShowStrugglingModal] = useState(false);
const [showAllTime, setShowAllTime] = useState(false);
const [strugglingCharacters, setStrugglingCharacters] = useState<StrugglingCharacter[]>([]);
const [isLoadingStruggling, setIsLoadingStruggling] = useState(false);

// Click handler for struggling count
const handleStrugglingClick = async () => {
  if (proficiency.strugglingCount === 0) return;
  setIsLoadingStruggling(true);
  setShowStrugglingModal(true);

  const characters = await getStrugglingCharacters(kidId, drill);
  setStrugglingCharacters(characters);
  setIsLoadingStruggling(false);
};

// In render - struggling count (clickable)
{proficiency.strugglingCount > 0 ? (
  <button
    onClick={handleStrugglingClick}
    className="text-ninja-red font-semibold underline hover:no-underline cursor-pointer"
  >
    {proficiency.strugglingCount} struggling
  </button>
) : (
  <span className="text-gray-400">0 struggling</span>
)}

// Toggle UI - simple tab style
<div className="inline-flex rounded-lg border p-0.5 bg-gray-100">
  <button
    onClick={() => setShowAllTime(false)}
    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
      !showAllTime ? 'bg-white shadow-sm text-ninja-blue' : 'text-gray-600 hover:text-gray-900'
    }`}
  >
    Last Week
  </button>
  <button
    onClick={() => setShowAllTime(true)}
    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
      showAllTime ? 'bg-white shadow-sm text-ninja-blue' : 'text-gray-600 hover:text-gray-900'
    }`}
  >
    Last 60 Days
  </button>
</div>

// Display accuracy with N/A fallback
<span>{accuracy !== null ? `${accuracy}%` : 'N/A'}</span>
```

## Success Metrics

- **Engagement:** Track clicks on "X struggling" (analytics event)
- **Usability:** Parents can identify struggling characters within 5 seconds
- **Performance:** Modal opens in <500ms, toggle recalculates in <300ms

## Dependencies & Risks

| Risk | Mitigation |
|------|------------|
| Large dataset performance | Cap "All Time" at 500 events |
| Modal accessibility | Follow ARIA patterns from DrillSelectionModal |
| State complexity | Keep toggle state local to widget, not global |

## References

### Internal
- `src/components/DrillBalanceWidget.tsx:1-139` - Current implementation
- `src/lib/drillBalanceService.ts:56-79` - Accuracy calculation
- `src/lib/drillBalanceService.ts:73-79` - Struggling count query
- `src/components/DrillSelectionModal.tsx` - Existing modal pattern
- `src/index.css` - Ninjago animation system

### External
- [ARIA Modal Pattern - W3C](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [Tailwind Collapsible Cards](https://ui.shadcn.com/docs/components/collapsible)
- [React Accessible Modal Best Practices](https://medium.com/@katr.zaks/how-to-build-an-accessible-modal-dialog-in-react-7ac85cb87119)

### Related PRs
- PR #17 - Epic 8 Multi-Pronunciation Characters (similar modal patterns)
- PR #10 - Ninjago Design System (color palette reference)

## Decision Points (Resolved)

### Resolved by Code Review
1. **Modal data fields:** Show `simplified, traditional, zhuyin, consecutive_miss_count, last_practiced_at` ✓
2. **Toggle labels:** "Last Week" (7 days) and "Last 60 Days" ✓
3. **Filtering approach:** Time-based (simpler than event count cap) ✓
4. **No data display:** Show "N/A" when no events in timeframe ✓
5. **useToggle hook:** NOT creating - inline useState instead ✓
6. **Separate modal:** YES - a11y concerns justify it ✓

### Confirmed Defaults
7. **Modal actions:** V1 is read-only (no "Practice" button)
8. **Sort order:** By consecutive_miss_count DESC (worst first)
9. **Zero struggling UX:** Click disabled, text muted
10. **Drill B modal:** Same output as Drill A (just different header label)

## Implementation Requirements

### Frontend Design Skill (REQUIRED)
Use `/frontend-design` skill for all UI work due to:
- Mobile breakpoint constraints (tight space for toggle + metrics)
- Modal responsive layout across devices
- Ninjago design system consistency
- Touch target sizing for clickable elements

### Manual QA with Playwright MCP (REQUIRED)
After implementation, perform visual QA using Playwright browser tools across:

**Scenarios to test:**
| Scenario | Drill A | Drill B |
|----------|---------|---------|
| 0 struggling characters | ✓ | ✓ |
| 1-5 struggling characters | ✓ | ✓ |
| 10+ struggling characters (scrolling) | ✓ | ✓ |
| No events in "Last Week" (N/A) | ✓ | ✓ |
| Events in both timeframes | ✓ | ✓ |

**Breakpoints to verify:**
| Device | Width | Priority |
|--------|-------|----------|
| Mobile portrait | 375px | HIGH |
| Mobile landscape | 667px | HIGH |
| Tablet portrait | 768px | MEDIUM |
| Tablet landscape | 1024px | MEDIUM |
| Desktop | 1280px | LOW |

**QA Checklist:**
- [ ] Toggle fits without wrapping on mobile
- [ ] Struggling count clickable with adequate touch target (44px min)
- [ ] Modal scrolls properly with 10+ characters
- [ ] Modal closes on backdrop click and Escape key
- [ ] N/A displays correctly when no data
- [ ] Focus returns to trigger after modal close

## Estimated Scope

| Metric | Original Plan | Simplified |
|--------|---------------|------------|
| Files changed | 4 | 3 |
| New files | 2 | 1 |
| Estimated LOC | ~270 | ~180 |
| Custom hooks | 1 | 0 |
