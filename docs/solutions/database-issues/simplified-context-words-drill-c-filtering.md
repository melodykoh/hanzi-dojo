---
title: "Simplified Chinese Context Words Cause Drill C Word Pair Filtering Failures"
slug: simplified-context-words-drill-c-filtering
category: database-issues
component: drill-c-word-pairs
severity: medium
date_solved: 2026-01-18
symptoms:
  - "Word pairs not appearing in Drill C for characters with locked pronunciations"
  - "Expected word pairs like 到處, 因為, 什麼 missing from practice"
  - "RPC query returns empty results despite valid word_pairs in database"
keywords:
  - simplified-chinese
  - traditional-chinese
  - context_words
  - pronunciation-filtering
  - word-pairs
  - drill-c
  - readings-table
  - migration-order
related_issues:
  - "#36"
  - "#35"
related_migrations:
  - "015c_context_words_traditional.sql"
  - "20260117000002_fix_readings_context_words_simplified.sql"
  - "20260118000002_fix_dictionary_bingzhou_simplified.sql"
related_prs:
  - "#35"
  - "#41"
---

# Simplified Chinese Context Words Cause Drill C Word Pair Filtering Failures

## Problem Symptom

Word pairs like 到處, 因為, 什麼, 怎麼 were not appearing in Drill C for characters with locked pronunciations. The drill showed fewer word pairs than expected, or none at all.

**Observable behavior:**
- Drill C "19 word pairs ready" but specific words missing
- Characters like 處, 著, 為, 什, 麼 showed no eligible word pairs
- RPC `get_eligible_word_pairs` returned empty results for affected characters

## Root Cause

The `readings.context_words` contained simplified Chinese while `word_pairs.word` used traditional Chinese. String comparison failed:

```sql
-- RPC comparison that fails:
wp.word = ANY(r.context_words)

-- When:
-- wp.word = '到處' (traditional)
-- r.context_words = ['到处'] (simplified)
-- Result: '到處' = ANY('{"到处"}') → false
```

**Why this happened:**

1. User added character with locked pronunciation
2. `readings.context_words` populated from `dictionary_entries.zhuyin_variants[].context_words`
3. At copy time, dictionary still had simplified words (e.g., '到处')
4. Migration 015c later converted `dictionary_entries` to traditional ('到處')
5. `readings` table not updated - still had simplified values
6. RPC comparison failed

**Data inheritance diagram:**
```
dictionary_entries.zhuyin_variants[].context_words
    ↓ (copied at add time via AddItemForm.tsx)
readings.context_words
    ↓ (compared at query time via RPC)
word_pairs.word (always traditional)
```

## Investigation Steps

### Step 1: Identify Affected Words (Regex-based - INCOMPLETE)

Initial discovery query:
```sql
SELECT DISTINCT word as simplified_word
FROM readings r, unnest(r.context_words) as word
WHERE word ~ '处|着|说|为|与|当|传|车|辆|这|么'
ORDER BY word;
```

Result: Found 11 words.

**Problem:** This regex-based approach missed characters not in the pattern.

### Step 2: Exhaustive Verification (JOIN-based - COMPLETE)

Better discovery query:
```sql
WITH simplified_chars AS (
  SELECT simp, trad FROM dictionary_entries WHERE simp != trad
)
SELECT word, sc.simp || '→' || sc.trad as mapping
FROM readings r, unnest(r.context_words) as word
CROSS JOIN simplified_chars sc
WHERE word LIKE '%' || sc.simp || '%';
```

This found the same 11 words, but when run against `dictionary_entries`, it found an additional word: `并州` (should be `並州`).

## Solution

### Migration 1: Fix `readings` Table

File: `supabase/migrations/20260117000002_fix_readings_context_words_simplified.sql`

```sql
WITH word_mappings(simp, trad) AS (VALUES
  ('因为', '因為'),
  ('为了', '為了'),
  ('为什么', '為什麼'),
  ('什么', '什麼'),
  ('怎么', '怎麼'),
  ('处所', '處所'),
  ('办事处', '辦事處'),
  ('好处', '好處'),
  ('到处', '到處'),
  ('跟着', '跟著'),
  ('看着', '看著')
)
UPDATE readings r
SET context_words = (
  SELECT ARRAY(
    SELECT COALESCE(wm.trad, w)
    FROM unnest(r.context_words) AS w
    LEFT JOIN word_mappings wm ON wm.simp = w
  )
)
WHERE context_words IS NOT NULL
  AND array_length(context_words, 1) > 0
  AND EXISTS (
    SELECT 1 FROM unnest(r.context_words) AS w
    WHERE w IN (SELECT simp FROM word_mappings)
  );
```

### Migration 2: Fix `dictionary_entries` Table

File: `supabase/migrations/20260118000002_fix_dictionary_bingzhou_simplified.sql`

```sql
UPDATE dictionary_entries
SET zhuyin_variants = REPLACE(zhuyin_variants::TEXT, '并州', '並州')::JSONB
WHERE simp = '并'
  AND zhuyin_variants::TEXT LIKE '%并州%';
```

### Exhaustive Verification Query

Run after any migration touching context_words:

```sql
WITH simplified_chars AS (
  SELECT simp, trad FROM dictionary_entries WHERE simp != trad
),
readings_check AS (
  SELECT 'readings' as tbl, word
  FROM readings r, unnest(r.context_words) as word
  WHERE EXISTS (SELECT 1 FROM simplified_chars sc WHERE word LIKE '%' || sc.simp || '%')
),
dict_check AS (
  SELECT 'dictionary_entries' as tbl, cw as word
  FROM dictionary_entries de,
       jsonb_array_elements(de.zhuyin_variants) as v,
       jsonb_array_elements_text(v->'context_words') as cw
  WHERE EXISTS (SELECT 1 FROM simplified_chars sc WHERE cw LIKE '%' || sc.simp || '%')
)
SELECT * FROM readings_check UNION ALL SELECT * FROM dict_check;
-- Should return 0 rows
```

## Prevention Strategies

### 1. Use Exhaustive Verification, Not Regex

| Method | Coverage | Maintenance |
|--------|----------|-------------|
| Regex `word ~ '处\|着\|...'` | Only listed chars | Must update pattern |
| JOIN against `simp != trad` | All mappings | Self-updating |

### 2. Update Downstream Tables When Dictionary Changes

When modifying `dictionary_entries`, also update:
- `readings.context_words` (inherits from dictionary at add time)

Consider adding a database trigger or companion migration checklist.

### 3. Code Review Checklist

Add to migration reviews:
- [ ] Does this modify `dictionary_entries` data?
- [ ] If yes: Does companion migration exist for `readings`?
- [ ] If yes: Is exhaustive verification query included?

### 4. Scheduled Data Quality Audit

Run monthly:
```sql
-- Should return 0 rows
WITH simplified_chars AS (
  SELECT simp FROM dictionary_entries WHERE simp != trad
)
SELECT * FROM readings r, unnest(r.context_words) as word
WHERE EXISTS (SELECT 1 FROM simplified_chars WHERE word LIKE '%' || simp || '%');
```

## Key Learnings

1. **Regex-based discovery is not exhaustive** - Always use JOIN-based verification against actual data
2. **User data tables inherit from reference data** - Fixing the source doesn't fix existing copies
3. **Hardcoded mappings beat complex conversion functions** - For known finite sets, explicit is better
4. **Multi-agent plan review catches over-engineering** - DHH/Kieran/Simplicity reviewers recommended simpler approach

## Cross-References

- **Related solution:** [PL/pgSQL Ambiguous Column Reference](./plpgsql-ambiguous-column-reference.md) - Similar "missed in migration" pattern
- **Related solution:** [Incomplete Data Fix Scope Discovery](./incomplete-data-fix-scope-discovery-20251215.md) - Query database before writing fixes
- **Session log:** SESSION_LOG.md - Session 27
