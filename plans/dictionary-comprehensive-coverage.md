# Comprehensive Multi-Pronunciation Dictionary Coverage

**Date:** 2025-12-08
**Status:** Ready for Implementation
**Priority:** HIGH
**Type:** Data Quality (Critical)

---

## User Context (Why This Matters)

> "My son uses the app on his own and I don't sit next to him to supervise. The challenge for not handling multi-pronunciation in a comprehensive way is that there is no exclusion logic for characters that actually have multi-pronunciations, and he will mistakenly select what is today deemed to be the wrong pronunciation even though this is technically a right pronunciation in a different context.
>
> It's less about him getting penalized for that selection, but more that he is implicitly learning that there might be additional pronunciation that is technically correct, but he thought it is wrong because the app tells him that it's wrong. And I want to have a mechanism for knowing that without sitting next to him and looking at the options."

**The Real Problem: Silent Miseducation**

When a character is missing `zhuyin_variants`:
1. Drill A generates distractors from the pronunciation pool
2. A **valid alternate pronunciation** appears as a "wrong" answer
3. Child selects it (correctly, in another context)
4. App marks it wrong
5. **Child learns that a correct pronunciation is "wrong"**

This is worse than a crash. It's a bug that **actively teaches wrong information** while appearing to work correctly.

**Why "Fix As Reported" Fails:**
- The child doesn't know a valid alternate was marked wrong
- The child trusts the app
- The parent has no visibility into these silent failures
- No one reports the bug because no one knows it happened

**The Only Solution:** Ensure ALL multi-pronunciation characters have proper `zhuyin_variants` so the drill guardrails can exclude valid alternates from distractors.

---

## Problem Statement

The dictionary has three categories of issues:

| Category | Count | Status | Risk |
|----------|-------|--------|------|
| Malformed zhuyin | 22 | **Known** | High - visibly broken |
| Empty context_words | 23 | **Known** | Medium - works but no context for parent |
| Missing zhuyin_variants | **?** | **Unknown** | **Critical - silent miseducation** |

**We don't know how many characters are missing `zhuyin_variants`.**

The ~77 estimate (from earlier) was rough math:
- ~20% of Chinese characters are multi-pronunciation
- 20% × 1,067 = ~213 should have variants
- Currently 136 have variants
- Gap: ~77

**This estimate could be wildly off.** We need actual data.

---

## Goal

**Guarantee** that Drill A never uses a valid alternate pronunciation as a "wrong" distractor.

This requires:
1. **Knowing** which characters have multiple pronunciations (canonical list)
2. **Having** `zhuyin_variants` for all of them (so guardrails work)

---

## Implementation Plan

### Phase 1: Discovery (2-3 hours)

**Objective:** Determine the exact scope of work.

#### Step 1.1: Get Taiwan MOE multi-pronunciation list

**Source:** Taiwan MOE "一字多音審訂表" (Review Table of Multiple Pronunciations)
- Official Taiwan government standard
- Covers 6,600+ characters with pronunciation data
- Available as ODS spreadsheet: [Ian Ho's reproduction](https://sites.google.com/site/ianho7979/roctwmoepolyphone_unofficial_third-party_reproduction)

**Action:**
1. Download the ODS spreadsheet
2. Convert to CSV (using LibreOffice or `ssconvert`)
3. Extract characters with multiple pronunciations
4. Load into Supabase temp table for cross-reference

#### Step 1.2: Cross-reference with our dictionary (via SQL)

Run directly in Supabase SQL Editor:

```sql
-- Step 1: Create temp table with our dictionary chars
CREATE TEMP TABLE our_chars AS
SELECT DISTINCT simp FROM dictionary_entries WHERE length(simp) = 1;

-- Step 2: Load MOE list into temp table (after CSV conversion)
CREATE TEMP TABLE moe_multi_pronunciation (char TEXT);
COPY moe_multi_pronunciation FROM '/path/to/moe_list.csv';
-- OR insert manually if small enough

-- Step 3: Get summary counts
SELECT
  (SELECT COUNT(*) FROM our_chars) as total_chars,
  (SELECT COUNT(*) FROM our_chars
   WHERE simp IN (SELECT char FROM moe_multi_pronunciation)) as moe_multi_in_dict,
  (SELECT COUNT(*) FROM dictionary_entries
   WHERE zhuyin_variants IS NOT NULL AND length(simp) = 1) as already_have_variants;

-- Step 4: Get the actual list of chars needing work
SELECT simp
FROM our_chars
WHERE simp IN (SELECT char FROM moe_multi_pronunciation)
  AND simp NOT IN (
    SELECT simp FROM dictionary_entries WHERE zhuyin_variants IS NOT NULL
  )
ORDER BY simp;
```

#### Step 1.3: Document exact scope

**Output:** Console log or simple JSON with exact counts:
```
Total dictionary chars: 1,067
MOE multi-pronunciation in our dictionary: 215
Already have zhuyin_variants: 136
Missing zhuyin_variants: 79
Malformed (to fix): 22
Empty context_words (to fix): 23
```

**This tells us exactly what to fix and how long Phase 2 will take.**

---

### Phase 2: Fix Everything (Time depends on Phase 1 results)

**Objective:** Add correct `zhuyin_variants` to ALL characters identified in Phase 1, plus fix existing issues.

#### Step 2.1: Research each character

For each character needing work:
1. Look up in Taiwan MOE dictionary (canonical for pronunciation)
2. Cross-reference with MDBG (for context words)
3. Document all pronunciations

**Research template:**
```json
{
  "char": "长",
  "default": "cháng",
  "variants": [
    { "pinyin": "cháng", "zhuyin": [["ㄔ","ㄤ","ˊ"]], "context": ["長度","很長"], "meanings": ["long"] },
    { "pinyin": "zhǎng", "zhuyin": [["ㄓ","ㄤ","ˇ"]], "context": ["長大","校長"], "meanings": ["grow","chief"] }
  ]
}
```

**Conflict Resolution (when MOE and MDBG disagree):**

| Conflict Type | Resolution |
|---------------|------------|
| MOE has pronunciation MDBG doesn't | **Trust MOE** - government standard |
| MDBG has pronunciation MOE doesn't | **Skip it** - stick to canonical set |
| Context words differ | **Prefer MDBG** - better learner examples |
| Default pronunciation differs | **Prefer MOE** - aligns with Taiwan education |

**Time estimate:** ~10 minutes per character
- If Phase 1 finds 80 chars: ~13 hours research
- If Phase 1 finds 50 chars: ~8 hours research
- If Phase 1 finds 120 chars: ~20 hours research

#### Step 2.2: Generate migration (in batches)

Split into manageable migrations for easier review:

```
supabase/migrations/011f_multi_pronunciation_batch1.sql  (25-30 chars)
supabase/migrations/011f_multi_pronunciation_batch2.sql  (25-30 chars)
supabase/migrations/011f_multi_pronunciation_batch3.sql  (remaining chars)
```

**Migration template:**
```sql
BEGIN;

-- =============================================
-- Batch 1: High-frequency characters (HSK 1-2)
-- =============================================

-- Example: 长 (cháng/zhǎng)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄔ","ㄤ","ˊ"]]'::jsonb,
  zhuyin_variants = '[
    {"pinyin":"cháng","zhuyin":[["ㄔ","ㄤ","ˊ"]],"context_words":["長度","很長"],"meanings":["long","length"]},
    {"pinyin":"zhǎng","zhuyin":[["ㄓ","ㄤ","ˇ"]],"context_words":["長大","校長"],"meanings":["to grow","chief"]}
  ]'::jsonb
WHERE simp = '长';

-- (repeat for all characters in this batch)

-- =============================================
-- Self-verification (count-based)
-- =============================================

DO $$
DECLARE
  malformed_count INT;
  total_with_variants INT;
  expected_variants INT := 215; -- Update based on Phase 1 results
BEGIN
  -- Check no malformed zhuyin remains
  SELECT COUNT(*) INTO malformed_count
  FROM dictionary_entries
  WHERE length(simp) = 1 AND jsonb_array_length(zhuyin) > 1;

  IF malformed_count > 0 THEN
    RAISE EXCEPTION 'FAILED: % characters still have malformed zhuyin', malformed_count;
  END IF;

  -- Check total count of chars with variants matches expected
  SELECT COUNT(*) INTO total_with_variants
  FROM dictionary_entries
  WHERE length(simp) = 1 AND zhuyin_variants IS NOT NULL;

  RAISE NOTICE 'Characters with zhuyin_variants: % (expected: %)',
    total_with_variants, expected_variants;
END $$;

COMMIT;
```

#### Step 2.3: Apply and verify

```sql
-- Use existing backup from 011e (created earlier today)
-- OR create new backup if 011e backup is stale:
CREATE TABLE dictionary_entries_backup_011f AS
SELECT * FROM dictionary_entries;

-- Apply each batch migration
-- Self-verifying: will ROLLBACK automatically on failure
```

#### Step 2.4: Functional test

Test sample characters in the app:

| Character | Test | Expected |
|-----------|------|----------|
| 长 | Add Item modal | Shows "cháng (長度)" and "zhǎng (長大)" options |
| 干 | Add Item modal | Shows "gān (乾淨)" and "gàn (幹活)" options |
| 还 | Drill A | Distractors exclude ㄏㄨㄢˊ if answer is ㄏㄞˊ |

#### Step 2.5: Manual spot checks (quality assurance)

**Objective:** Verify data quality beyond automated structure checks.

**Sample 10 random characters:**
```sql
SELECT simp, zhuyin, zhuyin_variants
FROM dictionary_entries
WHERE zhuyin_variants IS NOT NULL AND length(simp) = 1
ORDER BY RANDOM()
LIMIT 10;
```

**For each character, verify:**
1. Default pronunciation matches MDBG primary listing
2. All variants are real (check MDBG/MOE)
3. Context words use Traditional characters
4. Context words clearly demonstrate this pronunciation (not ambiguous)

**Red flags:**
- Context word uses simplified instead of traditional
- Context word is obscure (not common usage)
- Context word could apply to multiple pronunciations

#### Step 2.6: Fill empty context words

**Objective:** Fix 23 characters that have `zhuyin_variants` but empty context_words.

```sql
-- Find them
SELECT simp, zhuyin_variants
FROM dictionary_entries
WHERE zhuyin_variants IS NOT NULL
  AND length(simp) = 1
  AND EXISTS (
    SELECT 1 FROM jsonb_array_elements(zhuyin_variants) v
    WHERE v->'context_words' IS NULL
       OR jsonb_array_length(v->'context_words') = 0
  );
```

**For each character:**
1. Research in MDBG
2. Add 2-3 context words per pronunciation
3. Verify Traditional characters
4. Include in batch migrations

**Time:** ~10 min per character = ~4 hours

---

## Context Word Quality Bar

A good context word:
- Uses **Traditional Chinese** characters
- Is a **common 2-3 character** word/phrase
- **Clearly demonstrates this specific pronunciation** (not ambiguous)
- Ideally **HSK 1-4 level** (familiar to learners)

**Examples:**

| Character | Pronunciation | Good Context | Why |
|-----------|---------------|--------------|-----|
| 长 | cháng | 長度, 很長 | Common, clearly "long" meaning |
| 长 | zhǎng | 長大, 校長 | Common, clearly "grow/leader" meaning |
| 还 | hái | 還有, 還是 | HSK 1-2, adverb usage |
| 还 | huán | 還錢, 歸還 | Clear "return" meaning |

**Handling rare pronunciations:**
- If MOE lists >3 pronunciations, prioritize by usage frequency
- Only add pronunciations with common (HSK 1-6) context words available
- Example: 了 → Add le/liǎo (common), defer liào/la (rare literary)

---

## Rollback Procedure

**If migration fails mid-execution:**
- Transaction auto-rolls back (BEGIN/COMMIT wrapper)
- No action needed

**If migration succeeds but app behaves wrong:**
```sql
-- Restore from backup
DROP TABLE dictionary_entries;
ALTER TABLE dictionary_entries_backup_011f RENAME TO dictionary_entries;

-- Verify restoration
SELECT COUNT(*) FROM dictionary_entries;
```

---

## Success Criteria

**Data Quality:**
- [ ] Zero characters with malformed multi-syllable zhuyin
- [ ] All MOE-listed multi-pronunciation chars have `zhuyin_variants`
- [ ] All `zhuyin_variants` have non-empty `context_words`
- [ ] Manual spot check passes (10 random chars verified)

**Functional:**
- [ ] Add Item modal shows all pronunciation options for multi-pronunciation chars
- [ ] Drill A never uses a valid alternate pronunciation as a "wrong" distractor

**User Outcome:**
- [ ] Child cannot be silently miseducated by seeing correct pronunciations marked wrong

---

## Effort Estimate

| Phase | Task | Hours |
|-------|------|-------|
| 1 | Discovery (MOE cross-reference) | 2-3 |
| 2.1-2.2 | Research + Generate migrations | 8-20 |
| 2.3-2.4 | Apply + Functional test | 2-3 |
| 2.5 | Manual spot checks | 1-2 |
| 2.6 | Fill empty context words | 3-4 |
| **Total** | | **16-32** |

**Note:** Research time depends on Phase 1 results. Could be 50 chars or 120 chars.

---

## Files

**To Create:**
- `data/moe_multi_pronunciation_list.csv` - Canonical MOE reference (from ODS)
- `supabase/migrations/011f_multi_pronunciation_batch1.sql`
- `supabase/migrations/011f_multi_pronunciation_batch2.sql`
- `supabase/migrations/011f_multi_pronunciation_batch3.sql`

**Existing:**
- `dictionary_entries_backup_011e` - Backup from earlier today

---

## References

- **Taiwan MOE:** [一字多音審訂表](https://sites.google.com/site/ianho7979/roctwmoepolyphone_unofficial_third-party_reproduction)
- **MDBG:** [Chinese Dictionary](https://www.mdbg.net/chinese/dictionary)
- **Migration Guide:** `docs/operational/DICTIONARY_MIGRATION_GUIDE.md`

---

## Completed Work

- [x] Migration 011e applied (Dec 8, 2025) - Fixed 81 malformed characters
- [x] Escaping fix committed (b871342)
- [x] Plan reviewed 3 times, revised with user context and reviewer feedback
