# P3-3: Remove Defensive Logic After Epic 8 Phase 4

**Status:** Pending (Blocked by Epic 8 Phase 4)
**Priority:** P3 (Low)
**Source:** PR #21 Code Review (Session 17)
**Created:** 2025-12-06

## Issue

The defensive logic for Migration 009 malformed data is a temporary workaround. Once Epic 8 Phase 4 fixes the database, this code becomes unnecessary overhead.

## File Affected

- `src/lib/practiceQueueService.ts:126-151`

## Code to Remove (After Epic 8 Phase 4)

```typescript
// This entire block can be simplified after Epic 8 Phase 4:
if (row?.dictionary_zhuyin) {
  const charCount = row.simp ? [...row.simp].length : 1
  const syllableCount = row.dictionary_zhuyin.length

  // TEMPORARY: Detect and split malformed Migration 009 data
  if (charCount === 1 && syllableCount > 1) {
    console.warn('[practiceQueueService] Detected malformed Migration 009 data...', {...})
    for (const syllable of row.dictionary_zhuyin) {
      if (validateZhuyinSyllable(syllable)) {
        collected.push([syllable])
      }
    }
  } else if (validatePronunciation(row.dictionary_zhuyin)) {
    collected.push(row.dictionary_zhuyin)
  }
}
```

## Simplified Code (After Epic 8 Phase 4)

```typescript
if (row?.dictionary_zhuyin && validatePronunciation(row.dictionary_zhuyin)) {
  collected.push(row.dictionary_zhuyin)
}
```

## Blockers

- [ ] Epic 8 Phase 4 migration must be complete
- [ ] Verify no remaining malformed data in production
- [ ] User readings auto-fixed by Phase 4 SQL

## Acceptance Criteria

- [ ] Remove defensive splitting logic
- [ ] Remove console.warn for Migration 009 detection
- [ ] Simplify to standard validation path
- [ ] Run tests to confirm no regression
