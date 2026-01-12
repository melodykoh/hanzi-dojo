# feat: Pronunciation Filtering for Drill C Word Pairs

**Status:** Ready for Implementation
**Created:** 2026-01-11
**Updated:** 2026-01-11 (Simplified after plan review)
**Related PR:** #33 (Drill C Word Match - has known limitation)

---

## Overview

Multi-pronunciation characters (多音字) like 著 have different readings in different contexts. When a user saves a character with a specific pronunciation (via `locked_reading_id`), Drill C word pairs should only show words that use that pronunciation.

**Example:**
```
著 has pronunciations:
├── zhù (著名 famous, 著作 writings)
├── zhe (看著 looking at - particle)
└── zháo (著急 anxious)

If user saved 著 with "zhe" (particle usage):
❌ Showing 著名 would confuse the child - wrong pronunciation!
✅ Should only show words using "zhe": 看著, 跑著, etc.
```

---

## Hero-Centric Filtering Model

**Key insight:** Filtering is based on the "hero character" - the saved character we're practicing.

### Core Principles

1. **Hero character drives filtering** - Only the target character's pronunciation matters
2. **Non-hero character is irrelevant** - The second character's saved pronunciation doesn't affect eligibility
3. **Per-entry filtering** - Each saved character independently contributes word pairs
4. **Conflicts are OK** - A word pair might use a "wrong" pronunciation for the non-hero character

### Examples

#### Example 1: Clear Match
- Kid saved 著 with locked reading **"zhù"** (著名, 著作)
- Kid saved 名 (single pronunciation)
- **Word pair:** 著名

| Hero | Check | Result |
|------|-------|--------|
| 著 | Is 著名 in 著's "zhù" context_words? YES | ✅ Eligible |
| 名 | 名 has no pronunciation restriction | ✅ Eligible |

**Result:** 著名 appears in Drill C

#### Example 2: Pronunciation Mismatch
- Kid saved 著 with locked reading **"zhe"** (看著, 跑著 - particle)
- Kid saved 名 (single pronunciation)
- **Word pair:** 著名

| Hero | Check | Result |
|------|-------|--------|
| 著 | Is 著名 in 著's "zhe" context_words? NO | ❌ Not eligible via 著 |
| 名 | 名 has no restriction | ✅ Eligible via 名 |

**Result:** 著名 appears (via 名), practicing 名's vocabulary, not 著's

#### Example 3: Non-Hero Conflict (This is OK)
- Kid saved 行 with locked reading **"xíng"** (行走, 行為)
- Kid saved 為 with locked reading **"wèi"** (因為)
- **Word pair:** 行為 (uses 行=xíng, 為=**wéi** - different from saved!)

| Hero | Check | Result |
|------|-------|--------|
| 行 | Is 行為 in 行's "xíng" context_words? YES | ✅ Eligible |

**Result:** 行為 appears when practicing 行. The fact that 為 is saved with "wèi" but this word uses "wéi" doesn't matter - we're practicing 行, not 為.

---

## Technical Approach

### Single Migration: Update RPC Only

**No schema changes required.** The data we need already exists:
- `entries.locked_reading_id` → points to `readings` table
- `readings.context_words` → array of words using that pronunciation

```sql
-- File: supabase/migrations/YYYYMMDD_pronunciation_filtering.sql

CREATE OR REPLACE FUNCTION get_eligible_word_pairs(p_kid_id uuid)
RETURNS TABLE (
  id uuid,
  word text,
  char1 text,
  char1_zhuyin jsonb,
  char2 text,
  char2_zhuyin jsonb,
  category text
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    wp.id,
    wp.word,
    wp.char1,
    d1.zhuyin AS char1_zhuyin,
    wp.char2,
    d2.zhuyin AS char2_zhuyin,
    wp.category
  FROM word_pairs wp
  JOIN dictionary_entries d1 ON d1.trad = wp.char1
  JOIN dictionary_entries d2 ON d2.trad = wp.char2
  WHERE EXISTS (
    -- At least one saved character matches this word pair
    SELECT 1 FROM entries e
    LEFT JOIN readings r ON r.id = e.locked_reading_id
    WHERE e.kid_id = p_kid_id
    AND (e.trad = wp.char1 OR e.trad = wp.char2)
    AND (
      -- No pronunciation lock = accept all word pairs for this char
      e.locked_reading_id IS NULL
      -- No context words defined = accept all
      OR r.context_words IS NULL
      -- Word matches the hero character's pronunciation
      OR wp.word = ANY(r.context_words)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**That's it.** One RPC modification. Zero schema changes. Zero frontend changes.

---

## Why This Simplified Approach

### What Was Removed (from original plan)

| Removed | Why |
|---------|-----|
| Generated column `all_context_words` | Never used - filtering uses `readings.context_words` |
| GIN index on dictionary_entries | Unnecessary for 1,067 rows |
| Word pair counts in AddItemForm | Scope creep - handle at drill time instead |
| "Change Pronunciation" modal | User confirmed: delete + re-add is acceptable |
| Custom `InsufficientPronunciationPairsError` | Existing error handling sufficient |
| Data validation scripts | Run ad-hoc when issues appear |

### Plan Review Feedback (3 reviewers agreed)

> "The generated column and GIN index are dead weight - complexity without value."

> "This is premature optimization for a dataset that fits in a single database page."

> "One migration file. Zero frontend changes. The existing UI and error handling already work."

---

## Acceptance Criteria

### Functional Requirements
- [ ] Word pairs filtered by hero character's locked pronunciation
- [ ] Single-pronunciation characters work unchanged (no regression)
- [ ] Characters with `locked_reading_id = NULL` accept all word pairs
- [ ] Non-hero character pronunciation conflicts are allowed
- [ ] Existing "insufficient pairs" error handling still works

### Non-Functional Requirements
- [ ] RPC latency remains <250ms
- [ ] No schema migrations required (RPC-only change)

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Single pronunciation char (hero) | No filtering applied, all word pairs returned |
| Multi pronunciation char with locked_reading_id | Only word pairs in context_words |
| Multi pronunciation char with NULL locked_reading_id | Accept all word pairs (legacy behavior) |
| Word pair where only non-hero has locked reading | Eligible - non-hero doesn't filter |
| Both chars saved, only one matches | Eligible via the matching hero |
| Zero word pairs after filtering | Drill C disabled (existing error handling) |
| <5 word pairs after filtering | Drill C disabled (existing threshold) |

---

## Implementation Checklist

### Database
- [ ] Migration: Update `get_eligible_word_pairs` RPC with hero-centric filtering

### Testing
- [ ] Test: Single-pronunciation character returns all pairs
- [ ] Test: Multi-pronunciation with locked reading filters correctly
- [ ] Test: NULL locked_reading_id accepts all pairs
- [ ] Test: Non-hero pronunciation conflict still returns pair
- [ ] Test: Insufficient pairs triggers existing error
- [ ] Manual QA: Practice Demo mode with multi-pronunciation chars

### Documentation
- [ ] Update `TECH_AND_LOGIC.md` with hero-centric filtering explanation
- [ ] Add changelog entry

---

## Dependencies

- PR #33 (Drill C Word Match) must be merged first
- `readings.context_words` must be populated for multi-pronunciation characters
  - Already done for 160+ dictionary entries (Epic 8 Phase 1-2)

---

## Data Quality Note

**Prerequisite check:** Before deploying, verify context_words alignment:

```sql
-- Find saved characters where context_words don't match any word_pairs
SELECT e.trad, r.context_words,
  ARRAY(SELECT cw FROM unnest(r.context_words) cw
        WHERE NOT EXISTS (SELECT 1 FROM word_pairs wp WHERE wp.word = cw))
  AS missing_from_word_pairs
FROM entries e
JOIN readings r ON r.id = e.locked_reading_id
WHERE r.context_words IS NOT NULL
AND EXISTS (
  SELECT 1 FROM unnest(r.context_words) cw
  WHERE NOT EXISTS (SELECT 1 FROM word_pairs wp WHERE wp.word = cw)
);
```

If significant gaps exist, expand word_pairs coverage before deploying filtering.

---

## References

- `supabase/migrations/20260110000002_drill_c_word_match.sql` - Current RPC
- `src/lib/wordPairService.ts` - Existing error handling (5 pair minimum)
- `docs/TECH_AND_LOGIC.md` - Pattern A structure for multi-pronunciation
- PR #33: Drill C Word Match (has known limitation note about this feature)
