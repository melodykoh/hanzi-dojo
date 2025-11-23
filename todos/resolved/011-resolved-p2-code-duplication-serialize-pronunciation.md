---
status: resolved
priority: p2
issue_id: "011"
tags: [code-quality, dry-violation, refactoring, pr-17]
resolved_date: 2025-11-22
dependencies: []
---

# Code Duplication - serializePronunciation Function

## Problem Statement

The `serializePronunciation` function is defined identically in TWO separate files (`drillBuilders.ts` and `practiceQueueService.ts`). This violates the DRY (Don't Repeat Yourself) principle and creates maintenance burden - any change to the serialization format must be synchronized across both files.

## Findings

- **Discovery:** Code review of PR #17 (Pattern Recognition Specialist)
- **Location:**
  - `src/lib/drillBuilders.ts:239`
  - `src/lib/practiceQueueService.ts:31`
- **Impact:** Maintenance burden, bug risk from unsynchronized updates
- **Duplication:** 100% identical function in 2 files

**Current Code:**
```typescript
// drillBuilders.ts (line 239)
function serializePronunciation(zhuyin: ZhuyinSyllable[]): string {
  return zhuyin.map(([ini, fin, tone]) => `${ini}|${fin}|${tone}`).join(';')
}

// practiceQueueService.ts (line 31) - EXACT DUPLICATE
function serializePronunciation(zhuyin: ZhuyinSyllable[]): string {
  return zhuyin.map(([ini, fin, tone]) => `${ini}|${fin}|${tone}`).join(';')
}
```

**Why This Matters:**
- Developer changes serialization format in one file but forgets the other
- Result: Inconsistent serialization causes pronunciation comparison bugs
- Drill A guardrails break because excluded pronunciations don't match
- Example: Empty initial `""` might serialize differently causing false matches

**Failure Scenario:**
1. Developer needs to handle empty initials better (e.g., for vowel-initial syllables like 为)
2. Updates `drillBuilders.ts` to use `${ini || 'Ø'}` for empty initials
3. Forgets to update `practiceQueueService.ts`
4. Pronunciation comparison fails: `"ㄨㄟˊ"` vs `"Øㄨㄟˊ"` don't match
5. Valid alternate pronunciations appear as wrong answers in drills

## Proposed Solutions

### Option 1: Extract to Shared Utility Module (RECOMMENDED)

Create new utility file with pronunciation serialization/deserialization:

```typescript
// NEW FILE: src/lib/zhuyinUtils.ts

import type { ZhuyinSyllable } from '../types'

/**
 * Serialize Zhuyin pronunciation to string for comparison/deduplication.
 *
 * Format: "{initial}|{final}|{tone};{initial}|{final}|{tone};..."
 *
 * @example
 * serializePronunciation([['ㄒ', 'ㄢ', 'ˊ']]) // "ㄒ|ㄢ|ˊ"
 * serializePronunciation([['', 'ㄨㄟ', 'ˊ']]) // "|ㄨㄟ|ˊ" (empty initial for vowel-initial)
 */
export function serializePronunciation(zhuyin: ZhuyinSyllable[]): string {
  return zhuyin.map(([ini, fin, tone]) => `${ini}|${fin}|${tone}`).join(';')
}

/**
 * Deserialize Zhuyin pronunciation string back to syllable array.
 *
 * @example
 * deserializePronunciation("ㄒ|ㄢ|ˊ") // [['ㄒ', 'ㄢ', 'ˊ']]
 */
export function deserializePronunciation(serialized: string): ZhuyinSyllable[] {
  return serialized.split(';').map(syllable => {
    const [ini, fin, tone] = syllable.split('|')
    return [ini, fin, tone] as ZhuyinSyllable
  })
}
```

Update imports:
```typescript
// src/lib/drillBuilders.ts
import { serializePronunciation } from './zhuyinUtils'

// src/lib/practiceQueueService.ts
import { serializePronunciation } from './zhuyinUtils'
```

- **Pros:**
  - Single source of truth for pronunciation serialization
  - Easy to add related utilities (normalize, compare, etc.)
  - Future-proof for additional Zhuyin operations
  - Reduces bundle size (one function instead of two)
- **Cons:** None
- **Effort:** Small (30 minutes)
- **Risk:** Low

### Option 2: Keep Duplicate, Add Warning Comment

Add comment in both files warning about synchronization:

```typescript
// WARNING: Duplicate in practiceQueueService.ts - keep synchronized
function serializePronunciation(zhuyin: ZhuyinSyllable[]): string {
  return zhuyin.map(([ini, fin, tone]) => `${ini}|${fin}|${tone}`).join(';')
}
```

- **Pros:** Quick fix, no file structure changes
- **Cons:** Doesn't solve root problem, still requires manual sync
- **Effort:** Small (5 minutes)
- **Risk:** Low (but doesn't prevent future bugs)

## Recommended Action

Apply Option 1:
1. Create new file `src/lib/zhuyinUtils.ts`
2. Move `serializePronunciation` to new file
3. Add `deserializePronunciation` helper (bonus utility)
4. Update imports in `drillBuilders.ts`
5. Update imports in `practiceQueueService.ts`
6. Remove duplicate function definitions
7. Run tests: `npm test`
8. Verify TypeScript compilation: `npx tsc --noEmit`

## Technical Details

- **Affected Files:**
  - `src/lib/zhuyinUtils.ts` (NEW - shared utilities)
  - `src/lib/drillBuilders.ts` (remove duplicate, add import)
  - `src/lib/practiceQueueService.ts` (remove duplicate, add import)
- **Related Components:** Drill builders, practice queue, pronunciation comparison
- **Database Changes:** No

## Resources

- Original finding: Code Review PR #17 - Pattern Recognition Specialist
- DRY principle: Don't Repeat Yourself
- Related: `src/lib/zhuyin.ts` (existing Zhuyin utilities - consider consolidating)

## Acceptance Criteria

- [ ] New file created: `src/lib/zhuyinUtils.ts`
- [ ] `serializePronunciation` extracted to zhuyinUtils
- [ ] `deserializePronunciation` added as bonus utility
- [ ] Both drillBuilders.ts and practiceQueueService.ts import from zhuyinUtils
- [ ] No duplicate function definitions remain
- [ ] All tests passing: `npm test`
- [ ] TypeScript compilation clean: `npx tsc --noEmit`
- [ ] No breaking changes to existing functionality

## Work Log

### 2025-11-22 - Initial Discovery
**By:** Claude Triage System (Pattern Recognition Specialist)
**Actions:**
- Issue discovered during comprehensive code review of PR #17
- Categorized as P2 IMPORTANT (code quality / DRY violation)
- Estimated effort: Small (30 minutes)
- Identified exact duplicate in 2 files

**Learnings:**
- Even simple utilities should be extracted to shared modules
- Pronunciation serialization is a common operation across multiple services
- Creating zhuyinUtils.ts opens door for future Zhuyin-related utilities

## Notes

**Source:** Triage session on 2025-11-22 (PR #17 comprehensive review)

**Context:**
This duplication was introduced in PR #17 when pronunciation comparison logic was added to both drill builders (for exclusion) and practice queue service (for deduplication). Both modules independently needed serialization, leading to copy-paste.

**Future Enhancements:**
Once zhuyinUtils.ts exists, consider adding:
- `normalizePronunciation()` - normalize empty initials, tone markers
- `comparePronunciations()` - semantic comparison beyond string equality
- `isValidPronunciation()` - validation helper
- Integration with existing `src/lib/zhuyin.ts` utilities
