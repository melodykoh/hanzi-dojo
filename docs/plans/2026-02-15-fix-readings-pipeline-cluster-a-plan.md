---
title: "Fix Readings Pipeline (Cluster A: #36, #46, #34)"
type: fix
status: implementing
date: 2026-02-15
issues: [36, 46, 34]
---

# Fix Readings Pipeline — Holistic Plan for Issues #36, #46, #34

## Overview

Three open bugs share a single data pipeline: the flow from `dictionary_entries.zhuyin_variants[].context_words` through `readings.context_words` to the `get_eligible_word_pairs` RPC that powers Drill C. Fixing them in isolation risks incomplete solutions and regressions. This plan treats them as one coordinated fix.

```
dictionary_entries.zhuyin_variants[].context_words
        │
        │ (copied once at add-time in AddItemForm)
        ▼
readings.context_words ─── #36: some values are simplified Chinese
        │                  #46: empty arrays → NULL → no filtering
        │
        ▼
get_eligible_word_pairs RPC ─── filters word pairs for Drill C
        │
        ▼
generateRound() ─── #34: ambiguous pairs appear (symptom of #46)
        │
        ▼
Drill C UI
```

**Why holistic:** Issue #34 (ambiguous pairs in rounds) was "fixed" in PR #44 — the code IS present and tested in `wordPairService.ts`. The re-opening is almost certainly a symptom of #46: ineligible word pairs enter the pool because NULL context_words means "accept all," and those extra pairs create unexpected cross-column ambiguity that `hasConflict()` can't anticipate because those pairs shouldn't be in the pool at all.

---

## The Three Bugs

### Issue #36 — Simplified context_words (Data Quality)

**Problem:** Some `readings.context_words` and `dictionary_entries.zhuyin_variants[].context_words` contain simplified Chinese (e.g., `到处`), but `word_pairs.word` is always traditional (`到處`). The RPC comparison `wp.word = ANY(r.context_words)` silently fails.

**History:** Migrations 015c and 021b partially fixed this. Migration 015c converted dictionary entries; 021b fixed 11 known words in readings. But the issue scope doc (GitHub #36) identifies 30+ affected context_word arrays across multiple characters that remain unfixed.

**Impact:** Valid word pairs don't appear in Drill C (false negatives). No incorrect pairs shown.

### Issue #46 — NULL context_words = Accept All (Logic Flaw)

**Problem:** When a pronunciation variant has `context_words: []` (e.g., 的's common `de` reading), `AddItemForm.tsx:399` skips setting context_words:

```typescript
// src/components/AddItemForm.tsx:399
if (contextToUse && contextToUse.length > 0) {
  readingPayload.context_words = contextToUse  // NEVER REACHED for empty arrays
}
```

The database receives NULL. The RPC treats NULL as "accept all word pairs":

```sql
-- supabase/migrations/20260118000001:54
OR r.context_words IS NULL  -- BUG: this accepts ALL pairs, even wrong pronunciations
```

**Example:** 的's saved reading is ㄉㄜ˙ (`de`), but word pair 的確 is only valid for ㄉㄧˊ (`dí`). Because `de` has `context_words: []` → NULL → RPC accepts everything → 的確 appears incorrectly.

**Impact:** Word pairs from wrong pronunciations appear in Drill C (false positives). This is the likely cause of #34's re-opening.

### Issue #34 — Ambiguous Word Pairs in Rounds (Symptom)

**Problem:** Re-opened despite PR #44 fix being present. The `hasConflict()` function in `wordPairService.ts` correctly prevents cross-column ambiguity within the eligible pool, but it can't account for pairs that shouldn't be in the pool at all.

**Hypothesis:** Once #36 and #46 are fixed (the pool is properly filtered), the existing `hasConflict()` code should handle genuine ambiguity. This issue likely resolves itself.

**Validation:** After deploying #36 + #46 fixes, play 10+ Drill C rounds with multi-pronunciation characters and verify no ambiguous pairings appear.

---

## Central Design Decision: What Happens When context_words Is Empty?

This is the crux of the fix. When a pronunciation is locked but `context_words` is empty, what should the RPC do?

### The Four States

| State | `locked_reading_id` | `context_words` | Meaning |
|-------|---------------------|-----------------|---------|
| **A** | NULL | NULL | No pronunciation chosen → accept all pairs |
| **B** | Set | Has values (e.g., `['到處','到底']`) | Pronunciation locked, filter by these words |
| **C** | Set | NULL (current bug) | Bug — should be empty array, not NULL |
| **D** | Set | `'{}'` (empty array) | Pronunciation locked, but no context words defined |

States A and B are correct today. State C is the bug being fixed. **State D is the design question.**

### Options for State D

| Option | Behavior | Pros | Cons |
|--------|----------|------|------|
| **D1: Accept no pairs** | Character excluded from Drill C | Safest; no wrong pairs shown | May reduce Drill C availability |
| **D2: Accept all pairs** | Same as current NULL behavior | Maximum availability | Reintroduces #46 |
| **D3: Backfill first** | Populate context_words from dictionary before changing RPC | No availability loss, no wrong pairs | Requires investigation per character |

**Recommended: D3 (Backfill) with D1 as fallback.**

Before changing the RPC logic, backfill `context_words` for all readings where the matching dictionary variant NOW has context_words. For any readings where the dictionary variant genuinely has no context_words (rare), State D1 (accept no pairs) applies — the character simply isn't eligible for Drill C until context_words are populated.

This avoids both reintroducing the bug AND unnecessarily reducing Drill C availability.

---

## Implementation: Single Migration + Code Change

### Why a Single Migration

The three data operations have ordering dependencies:
1. Simplified→traditional conversion MUST happen before NULL→empty-array conversion (otherwise we'd overwrite corrected values)
2. NULL→empty-array conversion MUST happen before RPC update (otherwise existing NULL rows hit new stricter logic)
3. Backfill from dictionary MUST happen before NULL→empty-array (fills in what we can)

A single migration file ensures atomicity and correct ordering. If any step fails, the whole migration rolls back.

### Migration Structure

**File:** `supabase/migrations/20260215000001_fix_readings_pipeline.sql`

```sql
-- Migration: Fix Readings Pipeline (Issues #36, #46, #34)
-- Date: 2026-02-15
--
-- This migration fixes the entire context_words data flow:
--   Step 1: Convert simplified context_words to traditional (#36)
--   Step 2: Backfill context_words from dictionary for readings that have NULL
--   Step 3: Convert remaining NULL context_words to empty arrays for locked readings
--   Step 4: Update RPC to properly handle empty arrays (#46)
--
-- IMPORTANT: Steps must execute in this exact order.
-- IMPORTANT: Run via `supabase db push` or `supabase migration up` ONLY.
--            Do NOT paste into the SQL Editor (no implicit transaction there).
-- Read docs/solutions/database-issues/ before modifying.
```

#### Step 1: Simplified → Traditional (Issue #36)

**Approach:** Hardcoded word-level mapping (per existing plan at `plans/fix-context-words-simplified-to-traditional.md`).

**MANDATORY pre-step:** Run discovery queries against production BEFORE writing the final mapping. The existing plan has 20 mappings from Dec 2025 — new entries may have been added since. Migration 015c itself introduced simplified characters (华仔, 仔猪, 熟谙, 當铺, 和诗, 和谐, 差劲) that a simple regex would miss.

**Use exhaustive JOIN-based discovery, NOT regex** (per `docs/solutions/database-issues/incomplete-data-fix-scope-discovery-20251215.md`):

```sql
-- Discovery: Find ALL simplified words in readings.context_words
-- Uses dictionary_entries as the authoritative simplified-to-traditional mapping
WITH simplified_chars AS (
  SELECT simp, trad FROM dictionary_entries WHERE simp != trad
)
SELECT DISTINCT word as simplified_word
FROM readings r, unnest(r.context_words) as word
WHERE context_words IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM simplified_chars sc
    WHERE word LIKE '%' || sc.simp || '%'
      AND word != REPLACE(word, sc.simp, sc.trad)
  )
ORDER BY word;

-- Same for dictionary_entries context_words
WITH simplified_chars AS (
  SELECT simp, trad FROM dictionary_entries WHERE simp != trad
)
SELECT DISTINCT cw as simplified_word
FROM dictionary_entries de,
     jsonb_array_elements(de.zhuyin_variants) as v,
     jsonb_array_elements_text(v->'context_words') as cw
WHERE zhuyin_variants IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM simplified_chars sc
    WHERE cw LIKE '%' || sc.simp || '%'
      AND cw != REPLACE(cw, sc.simp, sc.trad)
  )
ORDER BY cw;
```

**Migration pattern for `readings` (TEXT[] column):** CTE with `word_mappings(simp, trad)` values + UPDATE using `unnest` + `LEFT JOIN` + `ARRAY()` rebuild (same pattern as migration `20260117000002`).

**Migration pattern for `dictionary_entries` (JSONB column):** Extract each variant's context_words individually, replace, and rebuild — NOT a text-level REPLACE chain on serialized JSON (which risks substring false positives in non-context-word fields like meanings or pinyin).

**Verification:** Use the same JOIN-based queries above — both should return 0 rows after migration.

#### Step 2: Backfill context_words from Dictionary

For readings where:
- `context_words IS NULL`
- `locked_reading_id` is set (pronunciation was chosen)
- The matching dictionary variant NOW has non-empty context_words

**MANDATORY pre-step:** Before running the backfill, verify two things:

```sql
-- Pre-check 1: How many readings even need backfilling?
-- If this returns 0, skip Step 2 entirely.
SELECT COUNT(*) FROM readings r
JOIN entries e ON e.locked_reading_id = r.id
WHERE r.context_words IS NULL;

-- Pre-check 2: Verify zero zhuyin collisions in dictionary
-- (If >0 rows, the LIMIT 1 in the backfill could match the wrong variant)
SELECT de.trad, v.val->'zhuyin' as zhuyin, COUNT(*)
FROM dictionary_entries de,
     jsonb_array_elements(de.zhuyin_variants) AS v(val)
GROUP BY de.trad, v.val->'zhuyin'
HAVING COUNT(*) > 1;
-- Expected: 0 rows

-- Pre-check 3: Preview which readings WILL be backfilled
-- (Verify the zhuyin JSONB comparison actually matches)
SELECT r.id, e.trad, r.zhuyin, v.val->'context_words' as dict_context
FROM readings r
JOIN entries e ON e.locked_reading_id = r.id
JOIN dictionary_entries de ON de.trad = e.trad,
     jsonb_array_elements(de.zhuyin_variants) AS v(val)
WHERE r.context_words IS NULL
  AND v.val->'zhuyin' = r.zhuyin  -- JSONB-to-JSONB comparison
  AND jsonb_array_length(COALESCE(v.val->'context_words', '[]'::jsonb)) > 0;
-- Review: these are the rows that will be backfilled
```

**If Pre-check 1 returns 0:** Skip Step 2 entirely — no backfill needed.

```sql
-- Backfill context_words from dictionary for readings with locked pronunciation
-- that were saved before the dictionary had context_words populated
-- NOTE: Uses -> (JSONB-to-JSONB), NOT ->> (TEXT), for zhuyin comparison
UPDATE readings r
SET context_words = matched_context.cw_array
FROM (
  SELECT r2.id AS reading_id,
    (SELECT ARRAY(
      SELECT jsonb_array_elements_text(v.val->'context_words')
      FROM jsonb_array_elements(de.zhuyin_variants) AS v(val)
      WHERE v.val->'zhuyin' = r2.zhuyin  -- JSONB comparison (NOT ->> TEXT)
        AND jsonb_array_length(COALESCE(v.val->'context_words', '[]'::jsonb)) > 0
      LIMIT 1
    )) AS cw_array
  FROM readings r2
  JOIN entries e ON e.locked_reading_id = r2.id
  JOIN dictionary_entries de ON de.trad = e.trad
  WHERE r2.context_words IS NULL
) AS matched_context
WHERE r.id = matched_context.reading_id
  AND matched_context.cw_array IS NOT NULL
  AND array_length(matched_context.cw_array, 1) > 0;
```

**Note:** Uses `v.val->'zhuyin'` (returns JSONB) for comparison against `r2.zhuyin` (JSONB column). Do NOT use `->>'zhuyin'` (returns TEXT) — this would silently match zero rows and cause Step 3 to incorrectly convert everything to empty arrays.

**Zhuyin format risk:** Some dictionary entries have inconsistent zhuyin formatting (null values in arrays, empty strings). If Pre-check 3 returns fewer rows than expected, inspect for format mismatches and consider a looser matching strategy.

#### Step 3: NULL → Empty Array for Remaining Locked Readings

After Steps 1 and 2, any readings that STILL have NULL context_words with a locked pronunciation genuinely have no context words defined. Convert these to empty arrays so the RPC can distinguish them.

```sql
-- Convert remaining NULL context_words to empty arrays for locked readings
-- These are readings where the dictionary variant has no context_words
UPDATE readings r
SET context_words = '{}'
FROM entries e
WHERE e.locked_reading_id = r.id
  AND r.context_words IS NULL;
```

#### Step 4: Update RPC (Issue #46)

Update `get_eligible_word_pairs` to properly handle the four states:

```sql
-- IMPORTANT: Base this on the LATEST version in 20260118000001
-- Preserve all existing aliases (k.id, wp.id AS id, etc.)
-- See docs/solutions/database-issues/plpgsql-ambiguous-column-reference.md
-- See docs/solutions/database-issues/migration-regression-pattern.md

DROP FUNCTION IF EXISTS get_eligible_word_pairs(uuid);

CREATE FUNCTION get_eligible_word_pairs(p_kid_id uuid)
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
  -- Verify caller owns this kid
  -- FIX (Migration 021d): Use table alias 'k.id' to avoid ambiguity. See Issue #40.
  IF NOT EXISTS (
    SELECT 1 FROM kids k
    WHERE k.id = p_kid_id
    AND k.owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: kid not owned by caller';
  END IF;

  RETURN QUERY
  SELECT DISTINCT
    wp.id AS id,
    wp.word AS word,
    wp.char1 AS char1,
    d1.zhuyin AS char1_zhuyin,
    wp.char2 AS char2,
    d2.zhuyin AS char2_zhuyin,
    wp.category AS category
  FROM word_pairs wp
  JOIN dictionary_entries d1 ON d1.trad = wp.char1
  JOIN dictionary_entries d2 ON d2.trad = wp.char2
  -- Filter: char1 must be a saved/learned character (Issue #37)
  WHERE EXISTS (
    SELECT 1 FROM entries e
    LEFT JOIN readings r ON r.id = e.locked_reading_id
    WHERE e.kid_id = p_kid_id
    AND e.trad = wp.char1  -- char1-only filter (preserves Issue #37)
    AND (
      -- State A: No pronunciation lock = accept all word pairs for this char
      e.locked_reading_id IS NULL
      -- State B: Has context words = filter by those words
      -- FIX (Issue #46): Removed "r.context_words IS NULL" catch-all.
      -- After migration steps 1-3, NULL no longer exists for locked readings.
      -- Empty array '{}' means "no context words defined" = exclude from Drill C.
      OR wp.word = ANY(r.context_words)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

COMMENT ON FUNCTION get_eligible_word_pairs IS
  'Returns word pairs where char1 is in the kid''s learned set.
   Filters by pronunciation context when locked_reading_id exists.
   Issue #37: Only char1 must be learned (not char2).
   Issue #40: Fixed ambiguous column reference in auth check.
   Issue #46: Removed NULL context_words catch-all. Empty array = no Drill C.
   Issue #36: Requires context_words in traditional Chinese.';
```

**Key change:** The `OR r.context_words IS NULL` line is REMOVED. After Steps 1-3:
- State A (`locked_reading_id IS NULL`): Handled by first branch — accept all
- State B (`context_words` has values): Handled by `wp.word = ANY(r.context_words)` — filter correctly
- State D (`context_words = '{}'`): `ANY('{}')` always returns false — character excluded from Drill C (correct)
- State C (NULL): No longer exists after Step 3

### Code Change: AddItemForm.tsx

**File:** `src/components/AddItemForm.tsx`
**Line:** 399

```typescript
// BEFORE (bug: empty arrays become NULL in database)
if (contextToUse && contextToUse.length > 0) {
  readingPayload.context_words = contextToUse
}

// AFTER (fix: always include context_words, defaulting to empty array)
readingPayload.context_words = contextToUse ?? []
```

This ensures:
- Variant with `context_words: ['到處']` → saves `['到處']` (filtered)
- Variant with `context_words: []` → saves `[]` (empty array, excluded from Drill C)
- Variant with `undefined` context_words → saves `[]` (empty array — pronunciation was selected but no context words exist)
- `selectedVariant` is `null` (no variants at all) AND `formData.contextWords` is `undefined` → saves `[]`

**Note on single-pronunciation characters:** For characters with no `zhuyin_variants` in the dictionary, `contextToUse` will be `undefined` (falling through both `selectedVariant?.context_words` and `formData.contextWords`). The `?? []` ensures these save `[]`. Since `locked_reading_id` IS NULL for these characters (line 420: `shouldLockReading` requires `hasConfirmedPronunciation`), the RPC's State A branch (`e.locked_reading_id IS NULL` → accept all) handles them correctly regardless of context_words value.

### Code Change: EntryCatalog.tsx

**File:** `src/components/EntryCatalog.tsx` (around lines 291-295, 307-312)

The EntryCatalog has a separate code path for locking pronunciation on existing entries. Apply the same `?? []` pattern:

```typescript
// In the pronunciation-locking flow, ensure context_words defaults to empty array
context_words: pronunciationData.context_words ?? []
```

This prevents `undefined` context_words from becoming NULL in the database when a parent locks a pronunciation on an existing entry.

---

## Verification Plan

### Automated (Post-Migration SQL)

```sql
-- V1: Zero simplified context_words in readings (JOIN-based, not regex)
WITH simplified_chars AS (
  SELECT simp, trad FROM dictionary_entries WHERE simp != trad
)
SELECT COUNT(*) FROM readings r, unnest(r.context_words) as word
WHERE EXISTS (
  SELECT 1 FROM simplified_chars sc
  WHERE word LIKE '%' || sc.simp || '%'
    AND word != REPLACE(word, sc.simp, sc.trad)
);
-- Expected: 0

-- V2: Zero simplified context_words in dictionary_entries (JOIN-based)
WITH simplified_chars AS (
  SELECT simp, trad FROM dictionary_entries WHERE simp != trad
)
SELECT COUNT(*) FROM dictionary_entries de,
  jsonb_array_elements(de.zhuyin_variants) as v,
  jsonb_array_elements_text(v->'context_words') as cw
WHERE EXISTS (
  SELECT 1 FROM simplified_chars sc
  WHERE cw LIKE '%' || sc.simp || '%'
    AND cw != REPLACE(cw, sc.simp, sc.trad)
);
-- Expected: 0

-- V3: Zero NULL context_words for locked readings
SELECT COUNT(*) FROM readings r
JOIN entries e ON e.locked_reading_id = r.id
WHERE r.context_words IS NULL;
-- Expected: 0

-- V4: RPC still returns results
SELECT COUNT(*) FROM get_eligible_word_pairs('<real-kid-uuid>');
-- Expected: > 0 (exact count may decrease due to proper filtering)

-- V5: Spot-check 的 (de reading should NOT return 的確)
SELECT * FROM get_eligible_word_pairs('<real-kid-uuid>')
WHERE word = '的確';
-- Expected: 0 rows (if 的 is saved with de pronunciation)
```

### Manual QA (Browser-Based)

| Test | Steps | Expected |
|------|-------|----------|
| Multi-pron filtering | Play Drill C with 的 (de reading) | 的確 should NOT appear |
| Single-pron unchanged | Play Drill C with single-pron chars | Word pairs appear normally |
| No ambiguity | Play 10+ rounds with chars like 太/長/陽 | No round has char matching multiple options |
| Drill A/B regression | Play Drill A and Drill B | No changes in behavior |
| New character add | Add a multi-pron character, select variant | Correct context_words saved (check DB) |

### Impact Assessment (Run Before Deploying)

```sql
-- How many characters will lose Drill C eligibility?
-- (Characters with locked reading + NULL context_words that won't be backfilled)
SELECT e.trad, r.zhuyin, r.context_words
FROM entries e
JOIN readings r ON r.id = e.locked_reading_id
WHERE r.context_words IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM dictionary_entries de,
      jsonb_array_elements(de.zhuyin_variants) AS v(val)
    WHERE de.trad = e.trad
      AND v.val->'zhuyin' = r.zhuyin  -- JSONB comparison (NOT ->>)
      AND jsonb_array_length(COALESCE(v.val->'context_words', '[]'::jsonb)) > 0
  );
-- These characters will have context_words = '{}' after migration
-- and will be excluded from Drill C until context_words are populated
```

Share this count with user before deploying. If the number is high, consider expanding dictionary context_words first.

### Pre-Migration State Capture

Before running the migration, capture current state for rollback reference:

```sql
-- Save this output before migration
SELECT r.id, e.trad, r.context_words, r.zhuyin
FROM readings r
JOIN entries e ON e.locked_reading_id = r.id
ORDER BY e.trad;
```

---

## Acceptance Criteria

### Issue #36 (Simplified Context Words)
- [x] Discovery queries run against production, full mapping populated
- [x] All simplified context_words in `readings` converted to traditional — **SKIPPED: 0 rows found (already fixed by migrations 015c, 021b)**
- [x] All simplified context_words in `dictionary_entries` converted to traditional — **SKIPPED: 0 rows found**
- [x] Verification queries return 0 rows — **confirmed via production query**

### Issue #46 (NULL Context Words Logic)
- [x] `AddItemForm.tsx` saves `[]` instead of omitting `context_words` for empty arrays
- [x] `EntryCatalog.tsx` pronunciation-locking flow checked and fixed (both update + insert paths)
- [x] Existing NULL context_words backfilled from dictionary where possible (migration Step 2 — 13 chars via exact + tone-match)
- [x] Single-pron characters unlocked (migration Step 3 — 49 chars moved to State A)
- [x] Remaining NULLs converted to empty arrays for locked readings (migration Step 4)
- [x] RPC updated: `r.context_words IS NULL` catch-all removed (migration Step 5)
- [ ] 的 with `de` reading does NOT show 的確 in Drill C — **requires post-deploy verification**

### Issue #34 (Ambiguous Pairs — Validation)
- [ ] After #36 + #46 deployed, play 10+ Drill C rounds
- [ ] No round has a character that can validly pair with multiple options
- [ ] If ambiguity still occurs, investigate further (separate issue)
- [ ] If no ambiguity, close #34 with explanation

### Non-Regression
- [ ] Drill A works unchanged — **requires post-deploy verification**
- [ ] Drill B works unchanged — **requires post-deploy verification**
- [ ] Single-pronunciation characters work unchanged in Drill C — **requires post-deploy verification**
- [ ] RPC latency remains < 250ms — **requires post-deploy verification**
- [x] `npm test` passes (63/63 drill-related tests pass; 3 pre-existing failures unrelated)

### Documentation
- [x] `public/CHANGELOG.md` updated
- [ ] `TECH_AND_LOGIC.md` updated with four-state context_words explanation

---

## Execution Sequence

```
Phase 1: Discovery & Impact Assessment (no code changes)
├── Run simplified-detection queries against production
├── Run impact assessment query (how many chars lose eligibility)
├── Run backfill-preview query (how many chars can be backfilled)
└── Share results with user for go/no-go

Phase 2: Implementation (single branch)
├── Write migration file (Steps 1-4 in order)
├── Fix AddItemForm.tsx:399 (context_words ?? [])
├── Fix EntryCatalog.tsx pronunciation-locking path
├── Run npm test
└── Create PR

Phase 3: Verification (on Vercel preview)
├── Run verification queries V1-V5
├── Manual QA per checklist above
├── Browser-verify Drill C with multi-pron chars
└── Browser-verify Drill A/B unchanged

Phase 4: Deploy & Validate
├── User approves merge
├── IMPORTANT: Code deploys via Vercel, migration runs via `supabase db push`
│   Code change should deploy FIRST (or simultaneously). If migration
│   runs before new code is live, any character added in between will
│   still get NULL context_words from old code + strict RPC = excluded.
├── Run migration via CLI (NOT SQL Editor)
├── Verify production
├── Close issues #36, #46
├── Test #34 scenario — close if resolved, escalate if not
└── Update SESSION_LOG.md
```

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Discovery finds more simplified words than mapped | Medium | Low | Use exhaustive JOIN-based query (not regex) BEFORE writing migration |
| Zhuyin JSONB format inconsistencies prevent backfill matches | Medium | Medium | Run Pre-check 3 preview query; inspect match count vs expected |
| Backfill matches wrong variant (zhuyin collision) | Low | Medium | Run Pre-check 2 collision query; manual spot-check backfilled rows |
| Drill C availability drops significantly | Medium | Medium | Run impact assessment first; expand dictionary context_words if needed |
| RPC regression (ambiguous column, missing alias) | Low | High | Base on LATEST migration; use DROP+CREATE; preserve all aliases |
| EntryCatalog has same bug | High | Low | Check during implementation, apply `?? []` fix |
| Migration run via SQL Editor (no transaction) | Low | High | Header comment warns CLI-only; document in execution sequence |
| Code deploys after migration (window for new NULLs) | Low | Medium | Deploy code first, then run migration |
| JSONB REPLACE chain corrupts non-context-word fields | Low | High | Use extract/rebuild pattern, not text-level REPLACE on serialized JSON |

---

## Gotchas from Solution Docs (MUST READ)

These are documented mistakes that have happened before on this exact codebase:

1. **Ambiguous column reference** (`docs/solutions/database-issues/plpgsql-ambiguous-column-reference.md`): Always use `k.id`, `wp.id AS id` in RETURNS TABLE functions. This bug was introduced TWICE.

2. **Migration regression** (`docs/solutions/database-issues/migration-regression-pattern.md`): When modifying `get_eligible_word_pairs`, base on the LATEST migration (`20260118000001`), not an earlier version. Read ALL migrations touching this function first.

3. **Incomplete scope discovery** (`docs/solutions/database-issues/incomplete-data-fix-scope-discovery-20251215.md`): Documentation-based research found 11 chars; actual database had 68 (6x undercount). Always run diagnostic queries against production.

4. **Data inheritance chain** (`docs/solutions/database-issues/simplified-context-words-drill-c-filtering.md`): Fixing `dictionary_entries` does NOT fix existing `readings` rows — they inherited stale data at add-time. Both tables need companion fixes.

---

## References

### Issues
- [#36](https://github.com/melodykoh/hanzi-dojo/issues/36) — Simplified context_words
- [#46](https://github.com/melodykoh/hanzi-dojo/issues/46) — Word pair not respecting reading
- [#34](https://github.com/melodykoh/hanzi-dojo/issues/34) — Ambiguous word pairs

### Existing Plans (Superseded by This Plan)
- `plans/fix-context-words-simplified-to-traditional.md` — Issue #36 only
- `plans/feat-pronunciation-filtering-for-drill-c-word-pairs.md` — Pronunciation filtering design
- `plans/fix-drill-c-ambiguous-word-pairs.md` — Issue #34 only

### Key Source Files
- `src/components/AddItemForm.tsx:399` — The NULL-producing guard
- `src/components/EntryCatalog.tsx:~321` — Secondary pronunciation-locking path
- `src/lib/wordPairService.ts` — Client-side round generation (hasConflict)
- `supabase/migrations/20260118000001_fix_rpc_ambiguous_column_again.sql` — Current RPC (LATEST)

### Solution Docs (MUST READ Before Implementing)
- `docs/solutions/database-issues/plpgsql-ambiguous-column-reference.md`
- `docs/solutions/database-issues/migration-regression-pattern.md`
- `docs/solutions/database-issues/incomplete-data-fix-scope-discovery-20251215.md`
- `docs/solutions/database-issues/simplified-context-words-drill-c-filtering.md`
- `docs/solutions/process-learnings/drill-c-session-learnings-20260112.md`

---

## Review Feedback Applied

| Reviewer | Finding | Severity | Resolution |
|----------|---------|----------|------------|
| Data Integrity | Step 2 uses `-->>` (TEXT) vs JSONB column — backfill matches zero rows | CRITICAL | Changed to `->` (JSONB-to-JSONB comparison) |
| Data Integrity + Migration Expert | Discovery queries use regex (misses chars like 华, 猪, 谙) | CRITICAL | Replaced with exhaustive JOIN-based approach |
| Data Integrity | Migration must run via CLI, not SQL Editor | HIGH | Added warning comment in migration header |
| Migration Expert | REPLACE chain on JSONB risks substring false positives | HIGH | Changed to extract/rebuild pattern for dictionary_entries |
| Data Integrity | Code must deploy before migration | HIGH | Documented deployment order in Phase 4 |
| Migration Expert | EntryCatalog needs `?? []`, not just undefined check | MEDIUM | Updated both AddItemForm and EntryCatalog to use `?? []` |
| Data Integrity | Verify zero zhuyin collisions before LIMIT 1 | MEDIUM | Added Pre-check 2 diagnostic query |
| Simplicity | Check actual data counts before building backfill | VALID | Added Pre-check 1: skip Step 2 if zero rows need backfilling |
| Migration Expert | Capture pre-migration state for rollback | LOW | Added state capture query |
| Simplicity | Plan is long for a single-user app | ACKNOWLEDGED | Plan includes complexity because this pipeline has been broken 3 times; the ceremony is earned by the codebase history |
