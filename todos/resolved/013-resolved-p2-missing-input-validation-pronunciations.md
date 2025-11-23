---
status: resolved
priority: p2
issue_id: "013"
tags: [security, data-validation, defensive-programming, pr-17]
resolved_date: 2025-11-22
dependencies: []
---

# Missing Input Validation on Pronunciation Data

## Problem Statement

The `allPronunciations` array fetched from `rpc_get_entry_pronunciations()` is used directly to build drill options without validation. If the RPC returns malformed or missing data (e.g., due to database corruption or RPC failure), the drill builder could fail or generate invalid options, causing client crashes.

## Findings

- **Discovery:** Code review of PR #17 (Security Sentinel)
- **Location:** `src/components/PracticeCard.tsx:52-64`
- **Impact:** Client crashes from malformed data, poor user experience
- **Violates:** "Treat external data as untrusted" principle from CLAUDE.md

**Current Code:**
```typescript
const validPronunciations = queueEntry.allPronunciations?.length
  ? queueEntry.allPronunciations  // ❌ No validation
  : [queueEntry.reading.zhuyin]

const canonicalZhuyin = queueEntry.entry.type === 'char'
  ? (validPronunciations.find(pronunciation => pronunciation.length === 1)
    ?? validPronunciations[0])  // ❌ Could be undefined or malformed
  : queueEntry.reading.zhuyin

const drillAOptions = buildDrillAOptions(
  canonicalZhuyin,  // ❌ Could be malformed
  validPronunciations
)
```

**Why This Matters:**
- RPC failures are rare but possible (network timeouts, database errors)
- Database corruption could produce invalid JSONB structures
- No defensive checks means silent failures or crashes
- Practice session breaks entirely for the user (no graceful degradation)

**Attack/Failure Scenarios:**

1. **Database Corruption Scenario:**
   - Migration error leaves malformed `zhuyin_variants` in database
   - RPC returns: `allPronunciations: [['ㄇ', 'ㄚ']]` (missing tone marker)
   - `buildDrillAOptions` expects 3-element tuples, crashes on array access

2. **RPC Failure Scenario:**
   - RPC timeout/error caught in practiceQueueService
   - Code sets `pronunciationRows = []` (silent failure)
   - Multi-pronunciation characters show WRONG answers as CORRECT (false negatives)
   - Child gets marked wrong when actually correct

3. **Type Mismatch Scenario:**
   - Database schema change returns different structure
   - TypeScript types don't catch runtime type mismatch
   - Drill generation fails with "Cannot read property of undefined"

## Proposed Solutions

### Option 1: Add Validation in practiceQueueService (RECOMMENDED)

Validate pronunciation data before building queue entries:

```typescript
// In src/lib/practiceQueueService.ts

/**
 * Validate Zhuyin syllable structure.
 * Each syllable must be [initial, final, tone] with valid tone marker.
 */
function validateZhuyinSyllable(syllable: any): syllable is ZhuyinSyllable {
  return (
    Array.isArray(syllable) &&
    syllable.length === 3 &&
    typeof syllable[0] === 'string' &&  // initial (can be empty)
    typeof syllable[1] === 'string' &&  // final
    typeof syllable[2] === 'string' &&  // tone
    ['ˉ', 'ˊ', 'ˇ', 'ˋ', '˙', ''].includes(syllable[2]) // valid tones
  )
}

/**
 * Validate complete pronunciation (array of syllables).
 */
function validatePronunciation(pronunciation: any): pronunciation is ZhuyinSyllable[] {
  return (
    Array.isArray(pronunciation) &&
    pronunciation.length > 0 &&
    pronunciation.every(validateZhuyinSyllable)
  )
}

// In buildPronunciationList():
function buildPronunciationList(
  primary: ZhuyinSyllable[] | undefined,
  row?: PronunciationRow
): ZhuyinSyllable[][] {
  const collected: ZhuyinSyllable[][] = []

  // Validate primary reading
  if (primary && validatePronunciation(primary)) {
    collected.push(primary)
  } else if (primary) {
    console.error('Invalid primary pronunciation:', primary)
  }

  // Validate manual readings
  if (row?.manual_readings) {
    for (const manual of row.manual_readings) {
      if (validatePronunciation(manual)) {
        collected.push(manual)
      } else {
        console.error('Invalid manual reading:', manual)
      }
    }
  }

  // Validate dictionary zhuyin
  if (row?.dictionary_zhuyin && validatePronunciation(row.dictionary_zhuyin)) {
    collected.push(row.dictionary_zhuyin)
  }

  // Validate dictionary variants
  if (row?.dictionary_variants) {
    for (const variant of row.dictionary_variants) {
      if (variant.zhuyin && validatePronunciation(variant.zhuyin)) {
        collected.push(variant.zhuyin)
      } else {
        console.error('Invalid dictionary variant:', variant)
      }
    }
  }

  return deduplicatePronunciations(collected)
}
```

- **Pros:**
  - Catches malformed data at source (queue service layer)
  - Prevents corrupted data from reaching components
  - Logs specific validation errors for debugging
  - Falls back gracefully (skips invalid pronunciations)
- **Cons:**
  - Adds ~20 lines of validation code
  - Small runtime overhead (negligible)
- **Effort:** Small (30 minutes)
- **Risk:** Low

### Option 2: Add Error Boundary with User Feedback

Wrap PracticeCard in error boundary to catch runtime errors:

```typescript
class DrillErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Drill generation failed:', error, errorInfo)
    // Show user-friendly error message
  }

  render() {
    if (this.state.hasError) {
      return <div>⚠️ Drill data error. Please skip this character.</div>
    }
    return this.props.children
  }
}
```

- **Pros:** Catches all drill generation errors
- **Cons:** Doesn't prevent the error, just handles it after crash
- **Effort:** Small (20 minutes)
- **Risk:** Low

### Option 3: Combine Validation + Error Boundary (BEST)

Apply both Option 1 (prevent bad data) and Option 2 (catch any remaining errors).

- **Pros:** Defense in depth, graceful degradation
- **Cons:** More code to maintain
- **Effort:** Small (45 minutes total)
- **Risk:** Low

## Recommended Action

Apply Option 1 (validation in practiceQueueService):
1. Add `validateZhuyinSyllable()` and `validatePronunciation()` helper functions
2. Update `buildPronunciationList()` to validate all inputs
3. Add error logging for invalid data (helps debugging)
4. Test with malformed data:
   - Empty arrays: `[]`
   - Wrong structure: `[['ㄇ', 'ㄚ']]` (missing tone)
   - Wrong types: `[['ㄇ', 123, 'ˊ']]` (number instead of string)
   - Invalid tones: `[['ㄇ', 'ㄚ', 'X']]`
5. Verify graceful fallback (uses locked reading if all pronunciations invalid)

## Technical Details

- **Affected Files:**
  - `src/lib/practiceQueueService.ts` (add validation functions)
  - `src/types/index.ts` (may need to export ZhuyinSyllable type guards)
- **Related Components:** Practice queue, drill builders, PracticeCard
- **Database Changes:** No

## Resources

- Original finding: Code Review PR #17 - Security Sentinel
- Defensive programming: `CLAUDE.md` - "Treat external data as untrusted"
- TypeScript type guards: [Official docs](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)

## Acceptance Criteria

- [ ] `validateZhuyinSyllable()` function implemented with all checks
- [ ] `validatePronunciation()` function implemented
- [ ] `buildPronunciationList()` validates all inputs before use
- [ ] Invalid data logged to console with context
- [ ] Graceful fallback: uses locked reading if all pronunciations invalid
- [ ] Test case: malformed syllable (missing tone) → skipped, no crash
- [ ] Test case: invalid tone marker → skipped, no crash
- [ ] Test case: all pronunciations invalid → uses locked reading only
- [ ] No breaking changes to existing functionality

## Work Log

### 2025-11-22 - Initial Discovery
**By:** Claude Triage System (Security Sentinel)
**Actions:**
- Issue discovered during comprehensive code review of PR #17
- Categorized as P2 IMPORTANT (security / data validation)
- Estimated effort: Small (30 minutes)
- Identified missing defensive checks on external data

**Learnings:**
- Even TypeScript-typed data from database needs runtime validation
- RPC failures should degrade gracefully, not crash client
- Defensive programming prevents edge case crashes from becoming production incidents

## Notes

**Source:** Triage session on 2025-11-22 (PR #17 comprehensive review)

**Context:**
PR #17 introduces pronunciation fetching from RPC, but assumes RPC always returns well-formed data. While TypeScript provides compile-time safety, runtime data from database/RPC needs validation to prevent crashes from:
- Database corruption
- Migration errors
- Network failures
- Future schema changes

**Related Issue:**
This complements the RLS bypass fix (todo 009). Even if RLS is fixed, malformed data from database could still crash the client.

**Testing Strategy:**
1. Create test RPC responses with various malformed data
2. Verify validation catches each case
3. Confirm drill generation continues with fallback data
4. Check console logs show helpful error messages
