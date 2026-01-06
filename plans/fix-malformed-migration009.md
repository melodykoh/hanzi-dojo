# Fix Malformed Migration 009 Dictionary Data + Context Word Curation

**Date:** 2025-12-06
**Type:** Bug Fix + Enhancement
**Priority:** HIGH
**Effort:** 15-18 hours (3-4 days)
**GitHub Issue:** #23

---

## Problem

### Issue 1: Malformed zhuyin arrays (43+ chars)
Migration 009 stores multi-pronunciation characters incorrectly - ALL pronunciations merged into the main `zhuyin` array instead of using `zhuyin_variants`.

```sql
-- WRONG (current state):
('只', '隻', '[["ㄓ","","ˉ"],["ㄓ","","ˇ"]]'::jsonb)
--            ^--- Two pronunciations merged

-- CORRECT:
zhuyin: '[["ㄓ","","ˉ"]]'::jsonb,           -- Primary only
zhuyin_variants: '[{"pinyin":"zhī",...}, {"pinyin":"zhǐ",...}]'::jsonb
```

**User impact:** Drill A shows "ㄓ ㄓˇ" merged options instead of single pronunciations.

### Issue 2: Empty context words (17 overlapping chars)
17 of the malformed characters also have `zhuyin_variants` from Migration 011c but with empty `context_words` arrays. This scope includes curating context words for these.

---

## Scope

### Part A: Fix Malformed Data (43+ chars)

```
同, 号, 呢, 旁, 洗, 冒, 乘, 难, 价, 饮, 丽, 队, 降, 期, 间, 且, 只,
干, 阿, 鲜, 几, 刷, 可, 拉, 系, 调, 都, 重, 量, 觉, 角, 还, 行,
结, 给, 相, 省, 种, 没, 正, 更, 教, 担
```

**Sub-categories:**
- ~19 chars already have curated `zhuyin_variants` from 011b → only fix main `zhuyin`
- ~17 chars have empty-context `zhuyin_variants` from 011c → fix `zhuyin` + add context words
- Remaining chars need full Pattern A structure created

### Part B: Curate Context Words (17 overlapping chars)

These characters have `zhuyin_variants` from Migration 011c but with empty `context_words`:
```
干, 且, 丽, 乘, 冒, 价, 号, 同, 呢, 刷, 可, 旁, 洗, 降, 间, 期, 难
```

**Current state:**
```sql
zhuyin_variants = '[
  {"pinyin":"gān", "context_words":[], ...},  -- Empty!
  {"pinyin":"gàn", "context_words":[], ...}   -- Empty!
]'
```

**Fix:** Add 2-3 context words per pronunciation variant while fixing malformed data.

### Context Words Format Decision

**Store context words in Traditional Chinese** (decided 2025-12-06)

**Rationale:**
- App is Taiwan-focused (Zhuyin-based learning)
- Most future-proof for adding user preferences (simplified/traditional display) later
- Aligns with goal of teaching traditional characters alongside simplified
- Taiwan MOE dictionary is primary research source

**Example:**
```
干 gān → 乾淨, 乾燥, 乾杯  (not 干净, 干燥, 干杯)
干 gàn → 幹活, 能幹, 幹部  (not 干活, 能干, 干部)
```

---

## Solution

### Single Atomic PR (No Workaround Code)

Combine PR #21 regression tests with database fix. Do NOT merge runtime workaround.

```
PR Contents:
├── supabase/migrations/011e_fix_malformed_zhuyin.sql  (database fix)
├── src/lib/drillBuilders.test.ts                      (regression tests from PR #21)
└── NO runtime workaround code in practiceQueueService.ts
```

**Rationale:** Fix the data instead of adding runtime complexity that becomes tech debt.

---

## Tasks

### Day 1-2: Research (6-8 hours)

1. Run diagnostic to confirm all affected characters:
   ```sql
   SELECT simp, jsonb_array_length(zhuyin) as syllables,
          zhuyin_variants IS NOT NULL as has_variants,
          CASE WHEN zhuyin_variants IS NOT NULL
               THEN zhuyin_variants->0->>'context_words' = '[]'
               ELSE false END as empty_context
   FROM dictionary_entries
   WHERE length(simp) = 1 AND jsonb_array_length(zhuyin) > 1;
   ```

2. Categorize each character:
   - **Category 1:** Has curated 011b variants → only fix main zhuyin
   - **Category 2:** Has empty-context 011c variants → fix zhuyin + add context words
   - **Category 3:** No variants → create full Pattern A structure

3. Research context words for Category 2 + 3 chars using **Taiwan MOE dictionary** (primary) and MDBG
   - **IMPORTANT:** Store all context words in **Traditional Chinese**
   - Use Taiwan-style vocabulary and phrasing where applicable

4. Output: `data/malformed_chars_fix.json`

**Format (Traditional Chinese context words):**
```json
{
  "char": "只",
  "category": 3,
  "primary_zhuyin": [["ㄓ","","ˉ"]],
  "variants": [
    {"pinyin": "zhī", "zhuyin": [["ㄓ","","ˉ"]], "context_words": ["一隻貓", "兩隻手"], "meanings": ["measure word"]},
    {"pinyin": "zhǐ", "zhuyin": [["ㄓ","","ˇ"]], "context_words": ["只是", "只有"], "meanings": ["only"]}
  ]
}
```

**For Category 2 chars (empty context):**
```json
{
  "char": "干",
  "category": 2,
  "context_words_only": true,
  "variants": [
    {"pinyin": "gān", "context_words": ["乾淨", "乾燥", "乾杯"]},
    {"pinyin": "gàn", "context_words": ["幹活", "能幹", "幹部"]}
  ]
}
```

### Day 3: Migration + Local Testing (4-5 hours)

1. Generate `supabase/migrations/011e_fix_malformed_zhuyin.sql`

2. Migration structure:
   ```sql
   BEGIN;

   -- Fix each character (43+ UPDATE statements)
   UPDATE dictionary_entries
   SET zhuyin = '[["ㄓ","","ˉ"]]'::jsonb,
       zhuyin_variants = '[...]'::jsonb
   WHERE simp = '只';

   -- Auto-fix ALL affected user readings (not just 5)
   UPDATE readings r
   SET zhuyin = d.zhuyin
   FROM entries e
   JOIN dictionary_entries d ON e.simp = d.simp
   WHERE r.entry_id = e.id
     AND d.simp IN (/* all 43+ characters */);

   -- Verify fix
   DO $$ BEGIN
     IF EXISTS (
       SELECT 1 FROM dictionary_entries
       WHERE length(simp) = 1 AND jsonb_array_length(zhuyin) > 1
     ) THEN RAISE EXCEPTION 'Malformed entries remain';
     END IF;
   END $$;

   COMMIT;
   ```

3. Test locally with `supabase db reset`

### Day 4: QA + Deploy (2-3 hours)

1. Create PR with migration + PR #21 regression tests (no workaround code)
2. QA in Vercel preview:
   - Add Item shows multi-pronunciation selection for fixed characters
   - Drill A displays single pronunciation per button
3. Merge to production
4. Monitor error logs for 24 hours

---

## Success Criteria

### Part A: Malformed Data Fix
- [ ] All 43+ characters have single-syllable `zhuyin` array
- [ ] All characters have `zhuyin_variants` with Pattern A structure
- [ ] ALL affected user readings auto-updated (query to find count first)
- [ ] Add Item shows "Multiple Pronunciations Detected" for fixed chars
- [ ] Drill A displays single pronunciation per button

### Part B: Context Word Curation
- [ ] All 17 overlapping characters have non-empty `context_words` arrays
- [ ] Each pronunciation variant has 2-3 context words
- [ ] **Context words are in Traditional Chinese** (Taiwan MOE sourced)
- [ ] Context words are HSK 1-4 level where possible

### Quality
- [ ] 4 regression tests pass (from PR #21)
- [ ] Zero production errors for 24 hours
- [ ] Migration includes verification queries

---

## What NOT To Do

1. **Don't merge PR #21's runtime workaround** - Fix the data instead
2. **Don't plan Phase 3 expansion here** - See `docs/operational/EPIC_8_PHASE_3_EXPANSION.md`
3. **Don't hardcode 5 user readings** - Fix ALL affected users
4. **Don't create week-by-week timeline** - This is 2-3 days of work

---

## References

- Migration 011b: Pattern A structure reference (35 curated chars)
- Issue #20: Bug report with diagnostic details
- PR #21: Regression tests to include (discard workaround code)
- `scripts/check-affected-readings.cjs`: Diagnostic script

---

## Post-Fix Cleanup

After verifying production is stable:
1. Close PR #21 (tests merged, workaround not needed)
2. Update Issue #20 with resolution
3. Update `docs/PROJECT_PLAN.md` to mark Phase 4 complete
