# Dictionary Data Quality Audit Plan

## Problem Statement

The dictionary data has accumulated quality issues through multiple migrations:
1. **Meanings incorrectly duplicated** across pronunciation variants
2. **Empty fields** that may or may not be intentional
3. **No systematic validation** of JSONB structure consistency
4. **Potential pinyin/zhuyin mismatches** from automated generation

We need a systematic audit to identify all issues and produce one comprehensive fix migration.

---

## Phase 1: Audit Queries

### 1.1 Meanings Quality Issues

```sql
-- Find variants where all pronunciations have identical meanings (likely bug)
SELECT simp, trad, zhuyin_variants
FROM dictionary_entries
WHERE zhuyin_variants IS NOT NULL
  AND jsonb_array_length(zhuyin_variants) > 1
  AND (
    SELECT COUNT(DISTINCT v->>'meanings')
    FROM jsonb_array_elements(zhuyin_variants) v
  ) = 1;
```

```sql
-- Find variants with empty meanings arrays
SELECT simp, trad,
       jsonb_path_query(zhuyin_variants, '$[*].pinyin') as pinyins,
       jsonb_path_query(zhuyin_variants, '$[*].meanings') as meanings
FROM dictionary_entries
WHERE zhuyin_variants IS NOT NULL
  AND zhuyin_variants::text LIKE '%"meanings":[]%';
```

### 1.2 Context Words Quality Issues

```sql
-- Find non-default pronunciations with empty context_words (likely bug)
-- Default is first element, others should have context
SELECT simp, trad,
       v->>'pinyin' as pinyin,
       v->'context_words' as context_words
FROM dictionary_entries,
     jsonb_array_elements(zhuyin_variants) WITH ORDINALITY arr(v, idx)
WHERE zhuyin_variants IS NOT NULL
  AND idx > 1  -- Skip first (default) pronunciation
  AND jsonb_array_length(v->'context_words') = 0;
```

```sql
-- Count characters with empty context_words by position
SELECT
  CASE WHEN idx = 1 THEN 'default' ELSE 'alternate' END as position,
  COUNT(*) as empty_context_count
FROM dictionary_entries,
     jsonb_array_elements(zhuyin_variants) WITH ORDINALITY arr(v, idx)
WHERE zhuyin_variants IS NOT NULL
  AND jsonb_array_length(v->'context_words') = 0
GROUP BY CASE WHEN idx = 1 THEN 'default' ELSE 'alternate' END;
```

### 1.3 Zhuyin Structure Issues

```sql
-- Find zhuyin arrays with empty middle component (potential bug)
SELECT simp, trad, v->>'pinyin' as pinyin, v->'zhuyin' as zhuyin
FROM dictionary_entries,
     jsonb_array_elements(zhuyin_variants) v
WHERE zhuyin_variants IS NOT NULL
  AND v->'zhuyin'->0->>1 = '';
```

```sql
-- Find any TODO placeholders that slipped through
SELECT simp, trad, zhuyin_variants
FROM dictionary_entries
WHERE zhuyin_variants::text LIKE '%TODO%';
```

### 1.4 Cross-Reference Validation

```sql
-- Characters with zhuyin_variants that might be missing from our polyphone list
SELECT simp, trad,
       jsonb_array_length(zhuyin_variants) as variant_count
FROM dictionary_entries
WHERE zhuyin_variants IS NOT NULL
ORDER BY variant_count DESC;
```

```sql
-- Characters that SHOULD have variants but don't (known polyphones)
-- This requires a reference list of known polyphones
SELECT simp, trad, pinyin, zhuyin
FROM dictionary_entries
WHERE simp IN ('行', '乐', '发', '给', '种', '干', '系', '相', '弹', '重')
  AND zhuyin_variants IS NULL;
```

---

## Phase 2: Audit Script

Create `scripts/audit-dictionary-quality.cjs` that:

1. **Connects to Supabase** and runs all audit queries
2. **Categorizes findings** by severity:
   - P1: Data corruption (TODO placeholders, malformed zhuyin)
   - P2: Incorrect data (wrong meanings, missing context)
   - P3: Missing data (empty fields that should have values)
3. **Outputs report** as JSON and markdown summary
4. **Generates fix candidates** for review

### Script Structure

```javascript
const AUDITS = [
  {
    name: 'duplicate-meanings',
    severity: 'P2',
    description: 'Variants with identical meanings across all pronunciations',
    query: `...`,
    fix_strategy: 'research_and_differentiate'
  },
  {
    name: 'empty-alternate-context',
    severity: 'P2',
    description: 'Non-default pronunciations missing context words',
    query: `...`,
    fix_strategy: 'research_context_words'
  },
  // ... more audits
];
```

---

## Phase 3: Data Research

For each finding category, we need authoritative sources:

### 3.1 Meanings Differentiation

**Source:** MDBG Chinese Dictionary (cc-cedict)
- Each pronunciation has distinct definitions
- We can parse entries like: `长 [cháng] /long/` vs `长 [zhǎng] /to grow/chief/`

**Script:** `scripts/research-meanings-by-pronunciation.cjs`
- Input: List of characters with duplicate meanings
- Output: Correct meanings per pronunciation from MDBG

### 3.2 Context Words Research

**Source:**
- MDBG compound word search
- Educational word lists (HSK, TOCFL)

**Script:** `scripts/research-context-words.cjs`
- Input: Characters with empty context_words
- Output: Common compound words for each pronunciation

---

## Phase 4: Comprehensive Fix Migration

### 4.1 Migration Structure

```sql
-- Migration 011h: Dictionary Data Quality Fixes
-- Generated by: scripts/generate-migration-011h.cjs
-- Audit date: YYYY-MM-DD

BEGIN;

-- ============================================================================
-- SECTION 1: Fix duplicate/incorrect meanings (X characters)
-- ============================================================================

UPDATE dictionary_entries
SET zhuyin_variants = '...'::jsonb
WHERE simp = '长' AND trad = '長';

-- ============================================================================
-- SECTION 2: Fill missing context_words (X characters)
-- ============================================================================

-- ============================================================================
-- SECTION 3: Fix structural issues (X characters)
-- ============================================================================

COMMIT;
```

### 4.2 Validation Before Apply

```sql
-- Pre-migration validation
DO $$
DECLARE
  issue_count INTEGER;
BEGIN
  -- Check no TODO placeholders
  SELECT COUNT(*) INTO issue_count
  FROM dictionary_entries
  WHERE zhuyin_variants::text LIKE '%TODO%';

  IF issue_count > 0 THEN
    RAISE EXCEPTION 'Found % TODO placeholders', issue_count;
  END IF;

  RAISE NOTICE 'Pre-migration validation passed';
END $$;
```

---

## Phase 5: Ongoing Quality Assurance

### 5.1 Validation in Generator Scripts

Already implemented in Todo #039:
- `scripts/lib/validation.cjs` validates structure before SQL generation

### 5.2 Add Semantic Validation

Extend validation to check:
- Meanings array not empty for any variant
- Context words not empty for non-default variants
- No duplicate meanings across variants

### 5.3 Database Constraints (Future)

Consider adding PostgreSQL check constraints:
```sql
ALTER TABLE dictionary_entries
ADD CONSTRAINT valid_zhuyin_variants CHECK (
  zhuyin_variants IS NULL OR (
    jsonb_typeof(zhuyin_variants) = 'array' AND
    jsonb_array_length(zhuyin_variants) > 0
  )
);
```

---

## Execution Timeline

| Phase | Task | Output |
|-------|------|--------|
| 1 | Run audit queries | `data/audit-results-YYYY-MM-DD.json` |
| 2 | Create audit script | `scripts/audit-dictionary-quality.cjs` |
| 3 | Research correct data | `data/meanings-research.json`, `data/context-research.json` |
| 4 | Generate fix migration | `supabase/migrations/011h_dictionary_quality_fixes.sql` |
| 5 | Add ongoing validation | Updates to `scripts/lib/validation.cjs` |

---

## Decision Points for User

Before proceeding, need decisions on:

1. **Meanings field strategy:**
   - Option A: Remove `meanings` from variants entirely (use main `definitions` column)
   - Option B: Research and populate correct meanings per pronunciation
   - Option C: Keep empty `meanings: []` as placeholder for future

2. **Empty context_words for defaults:**
   - Option A: Keep empty (grammatical particles like 着/zhe apply to any verb)
   - Option B: Add example patterns (看着, 穿着, etc.)

3. **Scope of fix:**
   - Option A: Fix only P1/P2 issues (data corruption + incorrect data)
   - Option B: Fix all issues including P3 (comprehensive)

4. **Source priority:**
   - Primary: MDBG/CC-CEDICT
   - Secondary: Educational word lists
   - Tertiary: Manual research

---

## Files to Create

```
scripts/
├── audit-dictionary-quality.cjs      # Run all audit queries
├── research-meanings-mdbg.cjs        # Fetch meanings from MDBG
├── research-context-words.cjs        # Research context words
└── generate-migration-011h.cjs       # Generate fix migration

data/
├── audit-results-YYYY-MM-DD.json     # Audit findings
├── meanings-research.json            # Researched meanings
└── context-words-research.json       # Researched context words

supabase/migrations/
└── 011h_dictionary_quality_fixes.sql # Comprehensive fix
```

---

## Next Steps

1. [ ] Review and approve this plan
2. [ ] Make decisions on the 4 decision points above
3. [ ] Run Phase 1 audit queries to assess scope
4. [ ] Proceed with implementation
