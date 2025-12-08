---
status: complete
priority: p1
issue_id: "029"
tags: [code-review, data-integrity, migration, pr-24]
dependencies: []
---

# P1: Ambiguous JOIN May Corrupt User Pronunciation Data

## Problem Statement

Migration 011e updates user readings using a JOIN condition that only matches on `simp` (simplified character), not `trad` (traditional character). When a user has multiple entries with the same simplified character but different traditional forms (e.g., '干' → '乾' dry vs '幹' to do), ALL entries get the same pronunciation, corrupting user data.

**Why it matters:** Silent corruption of user pronunciation data. Users practicing different meanings of the same character will get the wrong pronunciation assigned.

## Findings

**Location:** `supabase/migrations/011e_fix_malformed_zhuyin.sql` (Lines 314-326)

**Current Code:**
```sql
UPDATE readings r
SET zhuyin = d.zhuyin
FROM entries e
JOIN dictionary_entries d ON e.simp = d.simp  -- ⚠️ Missing trad matching!
WHERE r.entry_id = e.id
  AND e.simp IN ('同', '号', ... '拉')
```

**Schema Evidence:**
```sql
-- entries table allows multiple entries with same simp but different trad
CONSTRAINT entries_unique_per_kid UNIQUE(kid_id, simp, trad)
```

**Corruption Scenario:**
```
User entries:
  entry_id=1: simp='干', trad='乾' (dry)    → Should get gān
  entry_id=2: simp='干', trad='幹' (to do)  → Should get gàn

Dictionary:
  simp='干' → zhuyin=[["ㄍ","ㄢ","ˉ"]] (gān as primary)

Current migration will:
  Set BOTH entries to gān pronunciation (WRONG!)
  entry_id=2 should keep gàn pronunciation
```

**Agent:** data-integrity-guardian

## Proposed Solutions

### Option 1: Add trad matching to JOIN (Recommended)
**Pros:** Direct fix, maintains data integrity
**Cons:** None significant
**Effort:** Small (10 min)
**Risk:** Low

```sql
UPDATE readings r
SET zhuyin = d.zhuyin
FROM entries e
JOIN dictionary_entries d ON e.simp = d.simp
  AND e.trad = d.trad  -- ✅ Match both simp AND trad
WHERE r.entry_id = e.id
  AND e.simp IN (...)
```

### Option 2: Use locked_reading_id with fallback
**Pros:** Respects user's explicit pronunciation choice
**Cons:** More complex, may not update some readings
**Effort:** Medium (30 min)
**Risk:** Medium

```sql
UPDATE readings r
SET zhuyin = COALESCE(
  (SELECT zhuyin FROM readings WHERE id = e.locked_reading_id),
  d.zhuyin
)
FROM entries e
JOIN dictionary_entries d ON e.simp = d.simp
WHERE r.entry_id = e.id
  AND e.simp IN (...);
```

### Option 3: Skip readings update entirely
**Pros:** Avoids corruption risk
**Cons:** Users keep seeing malformed pronunciations until manual fix
**Effort:** Minimal (5 min)
**Risk:** Low (but defers problem)

## Recommended Action

Use Option 1: Add `AND e.trad = d.trad` to the JOIN condition. Simple one-line fix that prevents data corruption.

## Technical Details

**Affected Files:**
- `supabase/migrations/011e_fix_malformed_zhuyin.sql`

**Components Affected:**
- User readings table
- Practice drills displaying pronunciation

**Database Changes:**
- UPDATE statement modification only

**Risk Assessment:**
- Current production data: Low risk (likely no users have multiple trad variants of same simp)
- Future data: High risk (as users add more characters)

## Acceptance Criteria

- [ ] JOIN includes trad matching: `AND e.trad = d.trad`
- [ ] Verify no orphaned readings after migration (all matched)
- [ ] Add post-update verification for skipped entries
- [ ] Document in migration comments why trad matching is required

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2025-12-07 | Created from PR #24 code review | data-integrity-guardian identified multi-trad risk |
| 2025-12-07 | **Approved for work** | Triage approved - P1 critical, must fix before merge |

## Resources

- PR #24: https://github.com/melodykoh/hanzi-dojo/pull/24
- Schema: `supabase/migrations/001_initial_schema.sql` (entries_unique_per_kid constraint)
- Character '干' has trad variants: 乾 (dry), 幹 (to do), 干 (shield - rare)
