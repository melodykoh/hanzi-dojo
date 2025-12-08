# Fix Remaining Dictionary Multi-Pronunciation Issues

**Date:** 2025-12-08
**Status:** Phase 1 Complete, Ready for Phase 2

---

## Current State (Verified Dec 8, 2025)

Migration 011e applied successfully. Remaining issues:

| Issue | Exact Count | Query |
|-------|-------------|-------|
| Malformed zhuyin | **22** | `SELECT COUNT(*) FROM dictionary_entries WHERE length(simp)=1 AND jsonb_array_length(zhuyin)>1` |
| Empty context_words | **23** | See audit query below |

---

## Task

Create and apply ONE migration (`011f`) that fixes all 22 malformed characters AND adds context words for all 23 empty-context characters.

**Why one migration?** (Per DHH review)
- Same root problem: incomplete multi-pronunciation data
- Single backup, single transaction, single verification
- Avoids "forgot to apply" issue that happened with 011e

---

## Steps

### 1. Research (Do First)

Get the exact character lists:

```sql
-- Malformed zhuyin (22 chars)
SELECT simp, trad, zhuyin
FROM dictionary_entries
WHERE length(simp) = 1 AND jsonb_array_length(zhuyin) > 1
ORDER BY simp;

-- Empty context_words (23 chars)
SELECT DISTINCT de.simp
FROM dictionary_entries de,
     jsonb_array_elements(de.zhuyin_variants) AS variant
WHERE length(de.simp) = 1
  AND (variant->'context_words' IS NULL
       OR jsonb_array_length(variant->'context_words') = 0)
ORDER BY de.simp;
```

For each character, research via MDBG + Taiwan MOE Dictionary:
- Correct single-syllable zhuyin (default pronunciation)
- All pronunciation variants with pinyin
- 2-3 Traditional Chinese context words per variant

### 2. Write Migration

Create `supabase/migrations/011f_complete_multi_pronunciation_fixes.sql`:

```sql
BEGIN;

-- Part 1: Fix all 22 malformed zhuyin
UPDATE dictionary_entries SET
  zhuyin = '...',
  zhuyin_variants = '...'
WHERE simp = '...';
-- (repeat for all 22)

-- Part 2: Add context words for 23 empty-context chars
UPDATE dictionary_entries SET
  zhuyin_variants = '...'
WHERE simp = '...';
-- (repeat for all 23)

-- Part 3: Self-verification (fails transaction if violated)
DO $$
DECLARE
  malformed_count INT;
  empty_context_count INT;
BEGIN
  -- Check no malformed zhuyin remains
  SELECT COUNT(*) INTO malformed_count
  FROM dictionary_entries
  WHERE length(simp) = 1 AND jsonb_array_length(zhuyin) > 1;

  IF malformed_count > 0 THEN
    RAISE EXCEPTION 'FAILED: % chars still have malformed zhuyin', malformed_count;
  END IF;

  -- Check all variants have context_words
  SELECT COUNT(DISTINCT de.simp) INTO empty_context_count
  FROM dictionary_entries de,
       jsonb_array_elements(de.zhuyin_variants) AS variant
  WHERE length(de.simp) = 1
    AND (variant->'context_words' IS NULL
         OR jsonb_array_length(variant->'context_words') = 0);

  IF empty_context_count > 0 THEN
    RAISE EXCEPTION 'FAILED: % chars still have empty context_words', empty_context_count;
  END IF;

  RAISE NOTICE 'SUCCESS: All characters fixed';
END $$;

COMMIT;
```

### 3. Apply Migration

```sql
-- Backup first (reuse existing if recent, or create new)
CREATE TABLE IF NOT EXISTS dictionary_entries_backup_011f AS
SELECT * FROM dictionary_entries;

-- Verify backup
SELECT COUNT(*) as backup_count FROM dictionary_entries_backup_011f;
-- Should match dictionary_entries count

-- Apply migration (paste 011f contents)
-- Migration is self-verifying - will ROLLBACK on failure
```

---

## Rollback Procedure

**If migration fails mid-execution:** Transaction auto-rolls back (BEGIN/COMMIT wrapper)

**If migration completes but app behaves wrong:**
```sql
-- Restore from backup
DELETE FROM dictionary_entries WHERE simp IN (...affected chars...);
INSERT INTO dictionary_entries
SELECT * FROM dictionary_entries_backup_011f
WHERE simp IN (...affected chars...);
```

---

## Done When

Migration runs without errors. Self-verification passes (no EXCEPTION raised).

**Functional check:** Add character '同' in app → modal shows both "tóng (同學)" and "tòng (胡同)" with context words.

---

## Context Word Quality Bar

A good context word:
- Uses Traditional Chinese characters
- Is a common 2-3 character word/phrase
- Clearly demonstrates THIS pronunciation (not ambiguous)
- Ideally familiar to elementary learners

Example for 長 (cháng/zhǎng):
- cháng: 長度 (length), 很長 (very long)
- zhǎng: 長大 (grow up), 校長 (principal)

---

## Files

- `supabase/migrations/011f_complete_multi_pronunciation_fixes.sql` — To be created
- Backup: `dictionary_entries_backup_011e` (exists), `dictionary_entries_backup_011f` (create before applying)

---

## Completed Work

- [x] Migration 011e applied (Dec 8, 2025) — Fixed 81 characters
- [x] Escaping fix committed (b871342)
