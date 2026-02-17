---
status: complete
priority: p2
issue_id: "050"
tags: [data-integrity, migration-safety, sql, zhuyin-variants]
dependencies: ["049"]
---

# Array Element Ordering Not Guaranteed (zhuyin_variants Position Matters)

## Problem Statement
Step 1 uses `jsonb_agg(...)` over `jsonb_array_elements(de.zhuyin_variants)` without explicit ordering. Step 2 uses `unnest(r.context_words)` with a LEFT JOIN. Without `WITH ORDINALITY` and `ORDER BY`, Postgres does not guarantee element order is preserved. Per CLAUDE.md: "Default pronunciation included as FIRST element in zhuyin_variants array" — reordering would break drill behavior.

## Findings
- Location: `supabase/migrations/20260216000001_fix_simplified_context_words.sql:550-565, 700-704`
- Step 1: `jsonb_array_elements` → `jsonb_agg` without ORDER BY
- Step 2: `unnest` → LEFT JOIN → ARRAY constructor without ORDER BY
- In practice Postgres usually preserves order, but it's not spec-guaranteed
- Risk is highest for `zhuyin_variants` where position determines default pronunciation

## Proposed Solutions

### Option 1: Add WITH ORDINALITY + ORDER BY to both steps
- **Pros**: Deterministic ordering, zero risk of reordering
- **Cons**: Slightly more verbose SQL
- **Effort**: Small (< 30 minutes)
- **Risk**: Low

```sql
-- Step 1
FROM jsonb_array_elements(de.zhuyin_variants) WITH ORDINALITY AS v(value, idx)
-- use ORDER BY idx inside jsonb_agg

-- Step 2
FROM unnest(r.context_words) WITH ORDINALITY AS w(val, idx)
-- ORDER BY idx inside the ARRAY subquery
```

## Recommended Action
Add `WITH ORDINALITY` and explicit `ORDER BY` to both Step 1 and Step 2 array reconstruction queries. Can be done in the same pass as Issue #049 (dedup fix).

## Technical Details
- **Affected Files**: `supabase/migrations/20260216000001_fix_simplified_context_words.sql`
- **Related Components**: dictionary_entries.zhuyin_variants, readings.context_words
- **Database Changes**: Yes — migration file correction (already deployed, repo record fix)

## Resources
- Original finding: PR #52 review — data-integrity-guardian, data-migration-expert, kieran-typescript-reviewer
- Related issues: #36
- CLAUDE.md: "Default pronunciation included as FIRST element in zhuyin_variants array"

## Acceptance Criteria
- [ ] Step 1 `jsonb_agg` uses `WITH ORDINALITY` and `ORDER BY`
- [ ] Step 2 ARRAY constructor uses `WITH ORDINALITY` and `ORDER BY`
- [ ] Verify array order matches pre-migration state on a sample character

## Work Log

### 2026-02-17 - Approved for Work
**By:** Claude Triage System
**Actions:**
- Issue approved during triage session
- Status: ready
- Depends on #049 (same file, combine in one pass)

**Learnings:**
- Postgres `jsonb_array_elements` and `unnest` preserve order in practice but not by spec
- `zhuyin_variants` array position is semantically meaningful in this project

## Notes
Source: Triage session on 2026-02-17 (PR #52 simple-pr-review)
