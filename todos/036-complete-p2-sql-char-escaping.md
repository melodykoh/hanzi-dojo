---
status: complete
priority: p2
issue_id: "036"
tags: [code-review, security, pr-27]
dependencies: []
---

# SQL Character Variable Not Escaped

## Problem Statement

In the migration generator scripts, the `char` variable is inserted directly into SQL without escaping. While `escapeSql()` is used for `variantsJson` and `dictEntry.trad`, the single character `char` is not escaped, creating a potential SQL injection vector.

## Findings

**Files affected:**
- `scripts/generate-migration-011f-v2.cjs:395` - `WHERE simp = '${char}'`
- `scripts/generate-migration-011g.cjs:214` - `WHERE simp = '${char}'`

**Current code:**
```javascript
return `-- Character: ${char} (${dictEntry.trad}) - ${contextNote}
UPDATE dictionary_entries
SET
  zhuyin_variants = '${escapeSql(variantsJson)}'::jsonb
WHERE simp = '${char}'  // <-- NOT ESCAPED
  AND trad = '${escapeSql(dictEntry.trad)}';
`;
```

**Risk:** If source JSON data is tampered with, malicious characters could be injected.

## Proposed Solutions

### Option A: Escape char variable (Recommended)
**Pros:** Minimal change, consistent with existing pattern
**Cons:** None
**Effort:** Small (5 min)
**Risk:** Low

```javascript
WHERE simp = '${escapeSql(char)}'
  AND trad = '${escapeSql(dictEntry.trad)}';
```

### Option B: Add character validation
**Pros:** Fails fast on invalid input
**Cons:** More code
**Effort:** Small (15 min)

```javascript
if (!/^[\u4e00-\u9fff]$/.test(char)) {
  throw new Error(`Invalid character: ${char}`);
}
```

## Recommended Action
Apply Option A to both scripts.

## Technical Details

**Affected files:**
- `scripts/generate-migration-011f-v2.cjs`
- `scripts/generate-migration-011g.cjs`

## Acceptance Criteria
- [ ] `char` variable is escaped with `escapeSql()` in both files
- [ ] Generated SQL output is identical (no functional change)

## Work Log
| Date | Action | Notes |
|------|--------|-------|
| 2025-12-08 | Created | PR #27 code review finding |
| 2025-12-08 | Approved | Triage: marked ready for work |

## Resources
- PR #27: https://github.com/melodykoh/hanzi-dojo/pull/27
- Security sentinel agent review
