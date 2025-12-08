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
```bash
# Download the spreadsheet
# Extract simplified characters with multiple pronunciations
# Save as data/moe_multi_pronunciation_list.json
```

#### Step 1.2: Cross-reference with our dictionary

```sql
-- Get all single-character entries from our dictionary
SELECT simp FROM dictionary_entries WHERE length(simp) = 1;
-- Returns 1,067 characters (approximately)
```

**Cross-reference logic:**
```javascript
const moeMultiPronunciation = loadMOEList();  // From Step 1.1
const ourDictionary = loadOurCharacters();     // 1,067 chars
const alreadyHaveVariants = loadCharsWithVariants(); // 136 chars

const needsVariants = ourDictionary.filter(char =>
  moeMultiPronunciation.includes(char) &&
  !alreadyHaveVariants.includes(char)
);

console.log(`Missing zhuyin_variants: ${needsVariants.length}`);
// This gives us the ACTUAL number, not an estimate
```

#### Step 1.3: Output exact scope

**Deliverable:** `data/phase1_discovery_results.json`
```json
{
  "total_dictionary_chars": 1067,
  "moe_multi_pronunciation_in_dictionary": 215,
  "already_have_variants": 136,
  "missing_variants": 79,
  "malformed_variants": 22,
  "empty_context_words": 23,
  "chars_needing_work": ["干", "长", "好", "看", ...]
}
```

**This tells us exactly what to fix.**

---

### Phase 2: Fix Everything (Time depends on Phase 1 results)

**Objective:** Add correct `zhuyin_variants` to ALL characters identified in Phase 1.

#### Step 2.1: Research each character

For each character in `chars_needing_work`:

1. Look up in Taiwan MOE dictionary (canonical)
2. Cross-reference with MDBG (context words)
3. Document all pronunciations

**Research template:**
```json
{
  "char": "长",
  "sources": ["MOE", "MDBG"],
  "default_pronunciation": "cháng",
  "pronunciations": [
    {
      "pinyin": "cháng",
      "zhuyin": [["ㄔ", "ㄤ", "ˊ"]],
      "context_words": ["長度", "很長", "長短"],
      "meanings": ["long", "length"]
    },
    {
      "pinyin": "zhǎng",
      "zhuyin": [["ㄓ", "ㄤ", "ˇ"]],
      "context_words": ["長大", "校長", "成長"],
      "meanings": ["to grow", "chief", "elder"]
    }
  ]
}
```

**Time estimate:** ~10 minutes per character
- If Phase 1 finds 80 chars: ~13 hours research
- If Phase 1 finds 50 chars: ~8 hours research
- If Phase 1 finds 120 chars: ~20 hours research

#### Step 2.2: Generate migration

Create `supabase/migrations/011f_comprehensive_multi_pronunciation.sql`:

```sql
BEGIN;

-- =============================================
-- Fix ALL multi-pronunciation characters
-- Based on Phase 1 Discovery results
-- =============================================

-- Example: 长 (cháng/zhǎng)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄔ","ㄤ","ˊ"]]'::jsonb,
  zhuyin_variants = '[
    {"pinyin":"cháng","zhuyin":[["ㄔ","ㄤ","ˊ"]],"context_words":["長度","很長"],"meanings":["long","length"]},
    {"pinyin":"zhǎng","zhuyin":[["ㄓ","ㄤ","ˇ"]],"context_words":["長大","校長"],"meanings":["to grow","chief"]}
  ]'::jsonb
WHERE simp = '长';

-- (repeat for ALL characters from Phase 1)

-- =============================================
-- Self-verification (auto-rollback on failure)
-- =============================================

DO $$
DECLARE
  malformed_count INT;
  missing_variants_count INT;
BEGIN
  -- Check no malformed zhuyin remains
  SELECT COUNT(*) INTO malformed_count
  FROM dictionary_entries
  WHERE length(simp) = 1 AND jsonb_array_length(zhuyin) > 1;

  IF malformed_count > 0 THEN
    RAISE EXCEPTION 'FAILED: % characters still have malformed zhuyin', malformed_count;
  END IF;

  -- Check all MOE multi-pronunciation chars have variants
  -- (This list comes from Phase 1 discovery)
  SELECT COUNT(*) INTO missing_variants_count
  FROM dictionary_entries
  WHERE simp IN ('长','干','好','看', ...) -- All chars from Phase 1
    AND zhuyin_variants IS NULL;

  IF missing_variants_count > 0 THEN
    RAISE EXCEPTION 'FAILED: % characters still missing zhuyin_variants', missing_variants_count;
  END IF;

  RAISE NOTICE 'SUCCESS: All multi-pronunciation characters fixed';
END $$;

COMMIT;
```

#### Step 2.3: Apply and verify

```sql
-- Create backup
CREATE TABLE dictionary_entries_backup_011f AS
SELECT * FROM dictionary_entries;

-- Verify backup succeeded
SELECT
  (SELECT COUNT(*) FROM dictionary_entries) as original,
  (SELECT COUNT(*) FROM dictionary_entries_backup_011f) as backup;
-- Must match

-- Apply migration (paste 011f contents)
-- Self-verifying: will ROLLBACK automatically on failure
```

#### Step 2.4: Functional test

Test sample characters in the app:

| Character | Test | Expected |
|-----------|------|----------|
| 长 | Add Item modal | Shows "cháng (長度)" and "zhǎng (長大)" options |
| 干 | Add Item modal | Shows "gān (乾淨)" and "gàn (幹活)" options |
| 还 | Drill A | Distractors exclude ㄏㄨㄢˊ if answer is ㄏㄞˊ |

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
| 2 | Research (depends on Phase 1 results) | 8-20 |
| 2 | Migration + Testing | 2-3 |
| **Total** | | **12-26** |

**Note:** Effort for Phase 2 research depends entirely on Phase 1 results. Could be 50 chars or 120 chars - we don't know until we do discovery.

---

## Files

**To Create:**
- `data/moe_multi_pronunciation_list.json` - Canonical MOE reference
- `data/phase1_discovery_results.json` - Cross-reference results
- `data/phase2_research.json` - Researched pronunciation data
- `supabase/migrations/011f_comprehensive_multi_pronunciation.sql` - The fix

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
- [x] Plan reviewed twice, revised with user context
