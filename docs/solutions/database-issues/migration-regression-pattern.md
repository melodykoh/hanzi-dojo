---
title: "Migration Regression Pattern: Fixes Accidentally Reverted"
slug: migration-regression-pattern
category: database-issues
tags:
  - supabase
  - migrations
  - rpc
  - regression
severity: high
date_documented: 2026-01-18
related_issues:
  - "#42"
  - "#40"
related_migrations:
  - "007_fix_trad_lookup.sql"
  - "017_security_advisor_fixes.sql"
  - "20260118200212_restore_trad_lookup.sql"
---

# Migration Regression Pattern: Fixes Accidentally Reverted

## The Pattern

When modifying existing functions for a **secondary purpose** (security hardening, refactoring, cleanup), the entire function body gets copy-pasted and **previous bug fixes get silently lost**.

## Real Examples

### Example 1: Issue #42 - Traditional Character Lookup

| Migration | Purpose | Outcome |
|-----------|---------|---------|
| 007_fix_trad_lookup | Add `OR trad = search_char` | ✅ Fixed traditional lookup |
| 017_security_advisor_fixes | Add `SET search_path` for security | ❌ Reverted to `WHERE simp = search_char` only |
| 20260118200212_restore_trad_lookup | Restore the fix | ✅ Fixed again |

**Gap between fix and regression:** ~7 weeks (Nov 5 → Dec 24)
**Gap between regression and re-discovery:** ~4 weeks (Dec 24 → Jan 18)

### Example 2: Issue #40 - Ambiguous Column Reference

| Migration | Purpose | Outcome |
|-----------|---------|---------|
| 20260112000002_fix_rpc_ambiguous_column | Add `k.id` alias to avoid ambiguity | ✅ Fixed RPC |
| 20260117000001_drill_c_char1_required | Modify filtering logic | ❌ Reverted to bare `id` |
| 20260118000001_fix_rpc_ambiguous_column_again | Restore the alias | ✅ Fixed again |

**Gap between fix and regression:** 5 days

## Why This Happens

1. **Copy-paste from earlier version**: When adding `SET search_path`, the function body was copied from migration 005, not 007
2. **No awareness of intermediate fixes**: The modifier doesn't know a bug was fixed between original and current
3. **No regression testing**: The secondary change (security) was tested, not the primary functionality
4. **Function bodies are opaque**: Unlike code diffs, CREATE OR REPLACE doesn't show what changed

## Prevention Strategies

### 1. Check Git History Before Modifying Functions

```bash
# Before modifying lookup_dictionary_entry:
git log --oneline -- supabase/migrations/*lookup*.sql
```

### 2. Read ALL Migrations That Touch the Function

If migration 017 modifies `lookup_dictionary_entry`, first read:
- 005 (original)
- 007 (any intermediate changes)
- Then write 017 based on 007, not 005

### 3. Add Comments Explaining Non-Obvious Clauses

```sql
-- FIX (Migration 007): Search both simp AND trad columns
-- Without this, traditional character lookups fail. See Issue #42.
WHERE simp = search_char OR trad = search_char;
```

### 4. Test Primary Functionality After Secondary Changes

After adding `SET search_path`, also test:
```sql
-- Does traditional lookup still work?
SELECT lookup_dictionary_entry('處');  -- Should find 处
SELECT lookup_dictionary_entry('為');  -- Should find 为
```

### 5. Consider a Migration Review Checklist

Before applying any migration that modifies an existing function:
- [ ] Listed all previous migrations touching this function
- [ ] Read each to understand the evolution
- [ ] New migration is based on LATEST version, not original
- [ ] Tested all primary use cases, not just the new change

## Code Smell: When to Suspect This Pattern

If you see a bug report where:
- Feature "used to work"
- No obvious code change broke it
- Recent migrations touched the function for "unrelated" reasons

**Check if a fix was accidentally reverted.**

## Related Documentation

- [PL/pgSQL Ambiguous Column Reference](./plpgsql-ambiguous-column-reference.md) - Another instance of this pattern
- Migration 007: First fix for traditional lookup
- Migration 017: Security fix that accidentally reverted 007
