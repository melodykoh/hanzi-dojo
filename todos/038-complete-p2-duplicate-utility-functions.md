---
status: complete
priority: p2
issue_id: "038"
tags: [code-review, architecture, pr-27, technical-debt]
dependencies: ["037"]
---

# Duplicate Utility Functions Across Scripts

## Problem Statement

Multiple utility functions are copy-pasted verbatim across migration generator scripts: `escapeSql()`, `pinyinToZhuyinArray()`, and dictionary loading logic.

## Findings

**Duplicated functions:**

1. **escapeSql()** - 3 lines, identical in both:
   - `scripts/generate-migration-011f-v2.cjs:317-319`
   - `scripts/generate-migration-011g.cjs:167-169`

2. **pinyinToZhuyinArray()** - 9 lines, identical logic:
   - `scripts/generate-migration-011f-v2.cjs:306-314`
   - `scripts/generate-migration-011g.cjs:158-165`

3. **Dictionary loading pattern** - 15 lines each:
   - `scripts/analyze-polyphone-gap.cjs:19-37`
   - `scripts/generate-migration-011f-v2.cjs:22-38`
   - `scripts/generate-migration-011g.cjs:17-26`

**Total duplicated code:** ~60 lines across 3 files

## Proposed Solutions

### Option A: Create scripts/lib/ utilities (Recommended)
**Pros:** Clean separation, reusable, testable
**Cons:** Adds files
**Effort:** Medium (45 min)
**Risk:** Low

```javascript
// scripts/lib/sqlUtils.cjs
function escapeSql(str) {
  return str.replace(/'/g, "''");
}
module.exports = { escapeSql };

// scripts/lib/dictionaryLoader.cjs
function loadDictionaries() { /* ... */ }
function buildCharacterLookup(v1, v2) { /* ... */ }
module.exports = { loadDictionaries, buildCharacterLookup };
```

### Option B: Single combined utils file
**Pros:** Fewer files
**Cons:** Less organized
**Effort:** Small (30 min)

## Recommended Action
Apply Option A - create organized lib/ directory with separate modules.

## Technical Details

**New files to create:**
- `scripts/lib/sqlUtils.cjs`
- `scripts/lib/dictionaryLoader.cjs`

**Files to update:**
- All 3 migration scripts

## Acceptance Criteria
- [ ] Create `scripts/lib/sqlUtils.cjs` with `escapeSql()`
- [ ] Create `scripts/lib/dictionaryLoader.cjs` with loading utilities
- [ ] Update all 3 scripts to use shared utilities
- [ ] Remove duplicate code from scripts
- [ ] Verify scripts still produce same output

## Work Log
| Date | Action | Notes |
|------|--------|-------|
| 2025-12-08 | Created | PR #27 code review finding |
| 2025-12-08 | Approved | Triage: marked ready for work |

## Resources
- PR #27: https://github.com/melodykoh/hanzi-dojo/pull/27
