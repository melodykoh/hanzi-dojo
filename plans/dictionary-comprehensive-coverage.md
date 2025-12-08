# Comprehensive Multi-Pronunciation Dictionary Coverage

**Date:** 2025-12-08
**Status:** Ready for Implementation
**Priority:** HIGH
**Type:** Data Quality + Enhancement

---

## Problem Statement

The Hanzi Dojo dictionary has **incomplete multi-pronunciation coverage**:

| Issue | Count | Impact |
|-------|-------|--------|
| Malformed zhuyin | **22** | Drill A crashes or shows merged pronunciations |
| Empty context_words | **23** | Modal can't help parent distinguish pronunciations |
| Missing zhuyin_variants | **~77** | Characters SHOULD have variants but don't |
| **Total gaps** | **~122** | Incomplete learning experience |

**Why ~77 missing?**
- Research shows ~20% of Chinese characters are multi-pronunciation (多音字)
- 20% of 1,067 dictionary characters = ~213 should have variants
- Currently only 136 have zhuyin_variants
- Gap: 213 - 136 = **~77 characters silently incomplete**

**Root Cause:** No systematic cross-reference against canonical multi-pronunciation list.

---

## Goal

Ensure **comprehensive multi-pronunciation coverage** for all 1,067 dictionary characters by:

1. Fixing known malformed/incomplete data (22 + 23 = 45 chars)
2. Identifying and adding missing zhuyin_variants (~77 chars)
3. Validating existing 136 zhuyin_variants for accuracy

**Success Metric:** Zero characters in HSK 1-4 missing multi-pronunciation support where applicable.

---

## Current State (Dec 8, 2025)

```
Total dictionary entries:           1,067
Characters with zhuyin_variants:      136  (12.7%)
  - Fully curated (Pattern A):         81  ✅
  - Empty context_words:               23  ⚠️
  - Needs validation:                  32  ?
Malformed multi-syllable zhuyin:       22  🔴
Missing zhuyin_variants (estimated):  ~77  ❓
```

**Verification queries run after 011e applied:**
- Malformed: `SELECT COUNT(*) ... jsonb_array_length(zhuyin) > 1` → 22
- Empty context: `SELECT COUNT(DISTINCT simp) ... context_words IS NULL` → 23

---

## Canonical Reference Source

**Taiwan MOE "一字多音審訂表"** (Review Table of Multiple Pronunciations)

| Attribute | Value |
|-----------|-------|
| Authority | Official Taiwan government standard |
| Coverage | 6,600+ characters with pronunciation data |
| Format | ODS spreadsheet (LibreOffice Calc) |
| Access | [Ian Ho's reproduction](https://sites.google.com/site/ianho7979/roctwmoepolyphone_unofficial_third-party_reproduction) |
| Relevance | Hanzi Dojo uses Taiwan Zhuyin - this is THE canonical source |

**Secondary sources for context words:**
- [MDBG Dictionary](https://www.mdbg.net/chinese/dictionary) - Quick lookups, example compounds
- [CC-CEDICT](https://cc-cedict.org/wiki/) - Open-source dictionary data

---

## Implementation Plan

### Phase 1: Discovery & Audit (2-3 hours)

**Objective:** Identify exactly which characters need work.

#### Step 1.1: Get canonical multi-pronunciation list

```bash
# Download Taiwan MOE spreadsheet
# Extract list of multi-pronunciation characters
# Cross-reference against our 1,067 characters
```

**Output:** `data/moe_multi_pronunciation_chars.json`
```json
{
  "total_moe_chars": 600,
  "in_our_dictionary": 213,
  "already_have_variants": 136,
  "missing_variants": 77,
  "chars": ["干", "长", "好", "看", ...]
}
```

#### Step 1.2: Categorize all gaps

```sql
-- Full audit query
WITH audit AS (
  SELECT
    simp,
    CASE
      WHEN jsonb_array_length(zhuyin) > 1 THEN 'malformed'
      WHEN zhuyin_variants IS NOT NULL
           AND EXISTS (
             SELECT 1 FROM jsonb_array_elements(zhuyin_variants) v
             WHERE v->'context_words' IS NULL
                OR jsonb_array_length(v->'context_words') = 0
           ) THEN 'empty_context'
      WHEN zhuyin_variants IS NOT NULL THEN 'complete'
      ELSE 'single_pronunciation'
    END as status
  FROM dictionary_entries
  WHERE length(simp) = 1
)
SELECT status, COUNT(*), array_agg(simp ORDER BY simp) as chars
FROM audit
GROUP BY status;
```

**Output:** Exact character lists for each category.

#### Step 1.3: Prioritize by HSK level

| Priority | HSK Level | Est. Multi-Pronunciation Chars | Effort |
|----------|-----------|-------------------------------|--------|
| P1 | HSK 1-2 | ~40 chars | 4-6 hours |
| P2 | HSK 3-4 | ~80 chars | 8-12 hours |
| P3 | HSK 5-6 | ~90 chars | Deferred |

---

### Phase 2: Fix Known Issues (4-6 hours)

**Objective:** Fix the 22 malformed + 23 empty context characters.

#### Step 2.1: Research each character

For each of the 45 characters:
1. Look up in Taiwan MOE dictionary
2. Cross-reference with MDBG
3. Document all pronunciations with pinyin + zhuyin
4. Find 2-3 Traditional Chinese context words per pronunciation

**Research template:**
```json
{
  "char": "干",
  "sources": ["MOE", "MDBG"],
  "pronunciations": [
    {
      "pinyin": "gān",
      "zhuyin": [["ㄍ", "ㄢ", "ˉ"]],
      "context_words": ["乾淨", "乾燥", "干涉"],
      "meanings": ["dry", "clean", "to interfere"]
    },
    {
      "pinyin": "gàn",
      "zhuyin": [["ㄍ", "ㄢ", "ˋ"]],
      "context_words": ["幹活", "幹部", "樹幹"],
      "meanings": ["to do", "cadre", "trunk"]
    }
  ]
}
```

#### Step 2.2: Generate migration

Create `supabase/migrations/011f_complete_multi_pronunciation_fixes.sql`:

```sql
BEGIN;

-- ============================================
-- Part 1: Fix 22 malformed zhuyin characters
-- ============================================

UPDATE dictionary_entries SET
  zhuyin = '[["ㄍ","ㄢ","ˉ"]]'::jsonb,
  zhuyin_variants = '[
    {"pinyin":"gān","zhuyin":[["ㄍ","ㄢ","ˉ"]],"context_words":["乾淨","乾燥"],"meanings":["dry","clean"]},
    {"pinyin":"gàn","zhuyin":[["ㄍ","ㄢ","ˋ"]],"context_words":["幹活","幹部"],"meanings":["to do","cadre"]}
  ]'::jsonb
WHERE simp = '干';

-- (repeat for all 22 malformed)

-- ============================================
-- Part 2: Add context words to 23 empty chars
-- ============================================

UPDATE dictionary_entries SET
  zhuyin_variants = jsonb_set(
    zhuyin_variants,
    '{0,context_words}',
    '["context1","context2"]'::jsonb
  )
WHERE simp = '...';

-- (repeat for all 23 empty context)

-- ============================================
-- Part 3: Self-verification (auto-rollback on fail)
-- ============================================

DO $$
DECLARE
  malformed_count INT;
  empty_context_count INT;
BEGIN
  SELECT COUNT(*) INTO malformed_count
  FROM dictionary_entries
  WHERE length(simp) = 1 AND jsonb_array_length(zhuyin) > 1;

  IF malformed_count > 0 THEN
    RAISE EXCEPTION 'FAILED: % characters still malformed', malformed_count;
  END IF;

  SELECT COUNT(DISTINCT de.simp) INTO empty_context_count
  FROM dictionary_entries de,
       jsonb_array_elements(de.zhuyin_variants) AS v
  WHERE length(de.simp) = 1
    AND (v->'context_words' IS NULL OR jsonb_array_length(v->'context_words') = 0);

  IF empty_context_count > 0 THEN
    RAISE EXCEPTION 'FAILED: % characters have empty context_words', empty_context_count;
  END IF;

  RAISE NOTICE 'SUCCESS: All 45 characters fixed';
END $$;

COMMIT;
```

#### Step 2.3: Apply and verify

```sql
-- Create backup
CREATE TABLE dictionary_entries_backup_011f AS
SELECT * FROM dictionary_entries;

-- Verify backup
SELECT
  (SELECT COUNT(*) FROM dictionary_entries) as original,
  (SELECT COUNT(*) FROM dictionary_entries_backup_011f) as backup;

-- Apply migration (self-verifying, auto-rollback on failure)
-- Paste 011f contents into Supabase SQL Editor
```

---

### Phase 3: Add Missing Variants (8-12 hours)

**Objective:** Add zhuyin_variants for ~77 characters missing them.

#### Step 3.1: Cross-reference with MOE list

After Phase 1 discovery, we'll have exact list of characters that:
- Are in our dictionary (1,067)
- Are in MOE multi-pronunciation list
- Don't have zhuyin_variants

#### Step 3.2: Prioritize HSK 1-2 first

**Tier 1 (Must Have):** HSK 1-2 multi-pronunciation chars (~40)
- These are highest-frequency, most impactful
- Complete research + migration in one session

**Tier 2 (Should Have):** HSK 3-4 multi-pronunciation chars (~40)
- Medium frequency, important for progression
- Can be phased over 2-3 sessions

**Tier 3 (Nice to Have):** Remaining chars (~37)
- Lower frequency or edge cases
- Address based on user feedback

#### Step 3.3: Generate migration for each tier

```sql
-- supabase/migrations/011g_add_missing_variants_tier1.sql
-- supabase/migrations/011h_add_missing_variants_tier2.sql
-- etc.
```

---

### Phase 4: Validation (2-3 hours)

**Objective:** Verify all 213+ multi-pronunciation characters are correct.

#### Step 4.1: Automated validation

```sql
-- Check Pattern A compliance (default = first in variants)
SELECT simp
FROM dictionary_entries
WHERE zhuyin_variants IS NOT NULL
  AND zhuyin != (zhuyin_variants->0->'zhuyin');
-- Should return 0 rows

-- Check all variants have context_words
SELECT simp
FROM dictionary_entries de,
     jsonb_array_elements(de.zhuyin_variants) AS v
WHERE v->'context_words' IS NULL
   OR jsonb_array_length(v->'context_words') = 0;
-- Should return 0 rows

-- Check pronunciation count matches expectations
SELECT simp, jsonb_array_length(zhuyin_variants) as variant_count
FROM dictionary_entries
WHERE zhuyin_variants IS NOT NULL
ORDER BY variant_count DESC;
-- Review any with 4+ variants
```

#### Step 4.2: Functional testing

For sample characters from each category:

| Character | Test | Expected |
|-----------|------|----------|
| 干 | Add Item modal | Shows "gān (乾淨)" and "gàn (幹活)" |
| 同 | Drill A | Distractors exclude valid alternate ㄊㄨㄥˋ |
| 长 | Add Item modal | Shows "cháng (長度)" and "zhǎng (長大)" |

---

## Context Word Quality Bar

A good context word:
- Uses **Traditional Chinese** characters
- Is a **common 2-3 character** word/phrase
- Clearly demonstrates **this specific pronunciation** (not ambiguous)
- Ideally **HSK 1-4 level** (familiar to learners)
- **Not a proper noun** unless commonly known

**Examples:**

| Character | Pronunciation | Good Context | Why |
|-----------|---------------|--------------|-----|
| 长 | cháng | 長度, 很長 | Common, clearly "long" meaning |
| 长 | zhǎng | 長大, 校長 | Common, clearly "grow/leader" meaning |
| 还 | hái | 還有, 還是 | HSK 1-2, common usage |
| 还 | huán | 還錢, 歸還 | Clear "return" meaning |

---

## Rollback Procedure

**If migration fails mid-execution:**
```sql
-- Transaction auto-rolls back (BEGIN/COMMIT wrapper)
-- No action needed
```

**If migration succeeds but app behaves wrong:**
```sql
-- Identify affected characters
SELECT simp FROM dictionary_entries
WHERE simp IN ('干','长','好',...);

-- Restore from backup
DELETE FROM dictionary_entries WHERE simp IN (...);
INSERT INTO dictionary_entries
SELECT * FROM dictionary_entries_backup_011f
WHERE simp IN (...);

-- Verify restoration
SELECT simp, zhuyin, zhuyin_variants
FROM dictionary_entries
WHERE simp IN (...);
```

---

## Success Criteria

**Data Quality (Automated Checks):**
- [ ] `SELECT COUNT(*) ... jsonb_array_length(zhuyin) > 1` returns **0**
- [ ] All zhuyin_variants have non-empty context_words
- [ ] Pattern A compliance: default = first variant for all chars

**Functional Testing:**
- [ ] Add character '干' → modal shows both gān and gàn options with context
- [ ] Add character '长' → modal shows cháng and zhǎng options
- [ ] Drill A with '同' → distractors don't include valid alternate ㄊㄨㄥˋ
- [ ] Entry Catalog shows correct pronunciation for multi-pronunciation chars

**Coverage:**
- [ ] All HSK 1-2 multi-pronunciation chars have zhuyin_variants (Tier 1)
- [ ] All HSK 3-4 multi-pronunciation chars have zhuyin_variants (Tier 2)

---

## Files

**To Create:**
- `data/moe_multi_pronunciation_chars.json` - Canonical reference list
- `data/phase2_research_45_chars.json` - Research for 22 malformed + 23 empty
- `data/phase3_research_77_chars.json` - Research for missing variants
- `supabase/migrations/011f_complete_multi_pronunciation_fixes.sql` - Phase 2 migration
- `supabase/migrations/011g_add_missing_variants_tier1.sql` - Phase 3 Tier 1
- `supabase/migrations/011h_add_missing_variants_tier2.sql` - Phase 3 Tier 2

**Existing:**
- `dictionary_entries_backup_011e` - Backup from today's session

---

## Effort Estimate

| Phase | Task | Hours | Story Points |
|-------|------|-------|--------------|
| 1 | Discovery & Audit | 2-3 | 1 |
| 2 | Fix 45 known issues | 4-6 | 3 |
| 3 | Add ~77 missing (Tier 1+2) | 8-12 | 5 |
| 4 | Validation | 2-3 | 1 |
| **Total** | | **16-24** | **10** |

---

## References

- **PR #24:** Migration 011e (applied this session)
- **Taiwan MOE:** [一字多音審訂表](https://sites.google.com/site/ianho7979/roctwmoepolyphone_unofficial_third-party_reproduction)
- **MDBG:** [Chinese Dictionary](https://www.mdbg.net/chinese/dictionary)
- **Existing docs:** `docs/operational/DICTIONARY_MIGRATION_GUIDE.md`

---

## Completed Work

- [x] Migration 011e applied (Dec 8, 2025) - Fixed 81 characters
- [x] Escaping fix committed (b871342)
- [x] Plan reviewed by DHH/Kieran/Simplicity reviewers
- [x] Plan revised with comprehensive coverage goal
