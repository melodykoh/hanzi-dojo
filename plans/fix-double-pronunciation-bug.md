# Fix: Double Pronunciation Bug in Drill A

**Date:** 2025-12-06
**Type:** 🐛 Bug Fix
**Priority:** P1 Critical
**Session:** 17
**GitHub Issue:** #20

---

## Problem Statement

Character 只 (and 4 others) display "merged" pronunciation options in Drill A where each button shows **two Zhuyin readings** (e.g., "ㄓ ㄓˇ") instead of a single pronunciation.

### Screenshot Evidence
Options displayed as:
- "ㄓ ㄓˊ" (two readings merged)
- "ㄓ ㄓˇ"
- "ㄓ ㄓ"
- "ㄓ ㄓˋ"

**Expected:** Single pronunciations like "ㄓˉ", "ㄓˊ", "ㄓˇ", "ㄓˋ"

---

## Root Cause Analysis

### Primary Cause: Malformed Dictionary Data

Migration 009 (`009_expand_dictionary_hsk1-4.sql`) stores multi-pronunciation characters incorrectly. Instead of using `zhuyin_variants` for alternate pronunciations, ALL pronunciations are stored as a multi-syllable array in the `zhuyin` field:

```sql
-- WRONG (current state for 43+ characters):
('只', '隻', '[["ㄓ","","ˉ"],["ㄓ","","ˇ"]]'::jsonb, 1265)
--            ^--- Two "syllables" but it's actually two pronunciations

-- CORRECT structure:
zhuyin: '[["ㄓ","","ˉ"]]'  -- Single primary pronunciation
zhuyin_variants: '[...]'   -- Alternates with context
```

### Secondary Cause: Parameter Order Bug

`PracticeCard.tsx:69-72` passes parameters in wrong order to `buildDrillAOptions()`:

```typescript
// CURRENT (wrong - allValidPronunciations in position 3):
buildDrillAOptions(queueEntry.reading.zhuyin, undefined, allValidPronunciations)

// Function signature expects it in position 2:
buildDrillAOptions(correctZhuyin, allValidPronunciations, confusionData?)
```

**Impact:** Valid alternate pronunciations may appear as "wrong" distractors.

---

## Affected Data

### User's Readings (5 entries)
| Character | Current Data | Correct Pronunciation |
|-----------|--------------|----------------------|
| 几 | jī + jǐ merged | jǐ (ㄐㄧˇ) - "how many" |
| 刷 | shuā + shuà merged | shuā (ㄕㄨㄚˉ) - "to brush" |
| 只 | zhī + zhǐ merged | zhī (ㄓˉ) - measure word |
| 可 | kě + kè merged | kě (ㄎㄜˇ) - "can" |
| 拉 | lā + lá merged | lā (ㄌㄚˉ) - "to pull" |

### Dictionary Source (43+ characters)
Single-character entries with multiple syllables in `zhuyin` field.
**Deferred to Epic 8 Phase 4** - see `docs/operational/EPIC_8_PHASE_3_EXPANSION.md`

---

## Implementation Plan (Simplified)

### Phase 1: Fix Parameter Order Bug

**File:** `src/components/PracticeCard.tsx`
**Lines:** 69-72
**Effort:** 5 minutes

```typescript
// BEFORE (wrong):
const drillAOptions = buildDrillAOptions(
  queueEntry.reading.zhuyin,
  undefined, // confusionData - WRONG POSITION
  allValidPronunciations
)

// AFTER (correct):
const drillAOptions = buildDrillAOptions(
  queueEntry.reading.zhuyin,
  allValidPronunciations
  // confusionData omitted (uses default)
)
```

**Why this works:** Removing the errant `undefined` puts `allValidPronunciations` in position 2 where the function expects it.

---

### Phase 2: User Self-Service Recovery

**Action:** Notify affected users to delete and re-add characters after dictionary fix.
**Effort:** 0 code changes

**User Communication:**
> "We fixed the Zhuyin display bug. If you still see merged options for characters like 只, 几, 刷, 可, or 拉, simply delete the character and re-add it."

**Why this works:**
- After the dictionary source is fixed (Epic 8 Phase 4), re-adding pulls correct data
- Avoids manual SQL intervention
- Users can self-serve in 2 clicks
- No coordination overhead

---

## Deferred Work → Epic 8 Phase 4

### Comprehensive Dictionary Cleanup (43+ characters)

The root cause (malformed dictionary data) requires fixing 43+ characters in `dictionary_entries`. This is **research-intensive work** that belongs in Epic 8's dictionary quality scope.

**Deferred items:**
1. Research correct primary pronunciation for each of 43+ characters
2. Create Migration 011e with proper Pattern A structure
3. Add `zhuyin_variants` with context words for each
4. Validate no regressions in existing multi-pronunciation support

**See:** `docs/operational/EPIC_8_PHASE_3_EXPANSION.md` (updated to include Phase 4)

**Rationale for deferral:**
- Phase 1 fix provides immediate relief (stops the bleeding)
- Dictionary fixes require careful research (10+ hours)
- Epic 8 already has infrastructure for dictionary migrations
- Prevents scope creep in bug fix PR

---

## Acceptance Criteria

### Immediate (This PR)
- [ ] Character 只 displays single Zhuyin per button in Drill A (after user re-adds)
- [ ] Parameter order bug fixed in PracticeCard.tsx
- [ ] Regression test added for merged Zhuyin scenario
- [ ] No regression on multi-character words (e.g., 什么 still shows 2 syllables)

### Deferred (Epic 8 Phase 4)
- [ ] 43+ dictionary entries fixed with proper Pattern A structure
- [ ] All single-char entries have single syllable in main `zhuyin` field
- [ ] `zhuyin_variants` contains all alternate pronunciations with context

---

## Test Plan

### Manual Testing
1. After Phase 1: Practice any character - verify no TypeScript errors
2. After Phase 1: Practice multi-pronunciation character - verify no valid alternates as distractors
3. User re-adds 只 - verify single pronunciations per button

### Automated Testing
```bash
npm run test:run
```

**New test to add:**
```typescript
it('should not merge multiple pronunciations into single option', () => {
  // Malformed input: two pronunciations stored as multi-syllable array
  const malformedZhuyin: ZhuyinSyllable[] = [
    ['ㄓ', '', 'ˉ'],  // zhī
    ['ㄓ', '', 'ˇ']   // zhǐ - should NOT be here
  ]

  const options = buildDrillAOptions(malformedZhuyin, [])

  // Each option's display should NOT contain spaces (merged readings)
  options.forEach(opt => {
    const display = formatZhuyinDisplay(opt.zhuyin)
    expect(display).not.toContain(' ')
  })
})
```

---

## Files Changed

| File | Change | Phase |
|------|--------|-------|
| `src/components/PracticeCard.tsx` | Fix parameter order (lines 69-72) | 1 |
| `src/lib/drillBuilders.test.ts` | Add regression test | 1 |

---

## Risk Assessment

| Phase | Risk | Mitigation |
|-------|------|------------|
| Phase 1 | Low | Simple parameter reorder, existing tests validate |
| Phase 2 | None | User self-service, no code changes |
| Deferred | Medium | Proper research in Epic 8 context |

---

## Reviewer Feedback Applied

This plan was revised based on parallel review by 3 specialized agents:

### DHH Rails Reviewer
- ✅ Consolidated from 4 phases to 2
- ✅ Removed "theatrical" manual SQL intervention
- ✅ Deferred comprehensive fix to proper scope (Epic 8)

### Kieran TypeScript Reviewer
- ✅ Added regression test requirement
- ⏳ Options object pattern for `buildDrillAOptions` - consider in future refactor
- ⏳ Extract safeguard to testable function - deferred (YAGNI)

### Code Simplicity Reviewer
- ✅ Removed Phase 1 (manual SQL) - users can self-serve
- ✅ Removed Phase 4 (safeguard) - YAGNI, root cause being fixed
- ✅ 50% complexity reduction achieved

---

## References

- GitHub Issue: #20
- Diagnostic script: `scripts/check-affected-readings.cjs`
- Dictionary source: `supabase/migrations/009_expand_dictionary_hsk1-4.sql`
- Previous multi-pronunciation work: PR #17 (Epic 8 Phase 1-2)
- Drill builder: `src/lib/drillBuilders.ts:376-500`
- Zhuyin formatter: `src/lib/zhuyin.ts:5-10`
- Epic 8 expansion: `docs/operational/EPIC_8_PHASE_3_EXPANSION.md`
