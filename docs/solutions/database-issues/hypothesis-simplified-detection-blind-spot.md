# Hypothesis: Simplified Detection Query Had a Blind Spot

**Status:** CONFIRMED — verified Feb 16, 2026 via internet-sourced character analysis
**Date:** Feb 16, 2026
**Confirmed:** Feb 16, 2026 (Session 29)
**Related:** Issue #36, PR #48 plan, Migration `20260216000001_fix_simplified_context_words.sql`

## What happened

During PR #48 planning (Feb 15, 2026), Phase 0 diagnostic queries checked for simplified characters in `dictionary_entries.zhuyin_variants[].context_words` and `readings.context_words`. Both returned **0 rows**. The plan concluded #36 was "already fixed" and skipped the simplified→traditional conversion entirely.

**But:** The user saw simplified context_words on the Vercel preview that same day (screenshot in issue #36 comments). The diagnostic said clean; production said otherwise.

## The hypothesis

The detection query self-joined against the dictionary's own simp/trad mapping:

```sql
WITH simplified_chars AS (
  SELECT simp, trad FROM dictionary_entries WHERE simp != trad
)
SELECT ... FROM dictionary_entries de,
  jsonb_array_elements(de.zhuyin_variants) as v,
  jsonb_array_elements_text(v->'context_words') as cw
WHERE EXISTS (
  SELECT 1 FROM simplified_chars sc
  WHERE cw LIKE '%' || sc.simp || '%'
    AND cw != REPLACE(cw, sc.simp, sc.trad)
);
```

**Potential flaw:** The dictionary only has ~1,067 characters. If a context_word contains a simplified form of a character NOT in `dictionary_entries`, the JOIN produces no match. For example:

- Context word "教学" (simplified) where 學/学 mapping isn't in the dictionary → missed
- Context word "说话" (simplified) where 話/话 mapping isn't in the dictionary → missed

This would produce a **false negative** — the query reports 0 but simplified characters actually exist.

## Alternative hypotheses

1. **The query was correct** and the user saw something other than simplified characters (unlikely given screenshot)
2. **The query was correct** but new data was added between migration and preview test
3. **The migration (015c/21b) wasn't actually run** on production, so the data was never fixed
4. **The LIKE matching had edge cases** — character boundaries, multi-byte matching issues

## How to verify

Run a different query that doesn't depend on the dictionary's own simp/trad coverage:
- Extract ALL unique context_words and manually inspect
- Or use a comprehensive external simp→trad mapping (not limited to 1,067 chars)

## Confirmation (Feb 16, 2026)

**CONFIRMED.** Internet-verified analysis (MDBG/CC-CEDICT) found ~370 simplified context_words that the self-referential query missed. Examples of characters NOT in the dictionary's simp/trad mapping:

- 劲/勁 (差劲→差勁) — not in dictionary_entries
- 铺/鋪 (当铺→當鋪) — not in dictionary_entries
- 谙/諳 (熟谙→熟諳) — not in dictionary_entries
- 禅/禪 (禅那→禪那) — not in dictionary_entries

Additionally found 10 partially converted hybrids, 8 wrong traditional selections, and 6 over-conversions from previous character-level REPLACE migrations.

**Fix:** Migration `20260216000001_fix_simplified_context_words.sql` — word-level CTE mapping verified against authoritative external databases, not the dictionary's own coverage.

## Compoundable learning

- **Pattern:** Self-referential validation (using the same data source to verify itself) creates blind spots
- **Principle:** Validation queries should use an independent reference, not the data being validated
- **Impact:** Caused us to skip the #36 fix entirely in PR #48, leading to another "fix that didn't fix" cycle
- **Prevention:** When verifying data completeness, always cross-reference against an external authority — never against the dataset being validated
