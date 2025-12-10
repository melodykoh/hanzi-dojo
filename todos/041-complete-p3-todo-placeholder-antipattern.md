---
status: complete
priority: p3
issue_id: "041"
tags: [code-review, architecture, pr-27]
dependencies: []
---

# TODO Placeholder Anti-Pattern in Zhuyin Generation

## Problem Statement

When pinyin-to-zhuyin mapping is missing, the scripts use `['TODO', pinyin, 'TODO']` as a fallback. This writes broken data to the database rather than failing loudly.

## Findings

**Files affected:**
- `scripts/generate-migration-011f-v2.cjs:313`
- `scripts/generate-migration-011g.cjs:164`

**Current code:**
```javascript
function pinyinToZhuyinArray(pinyin) {
  const mapping = PINYIN_TO_ZHUYIN[pinyin];
  if (mapping) {
    return [mapping.parts];
  }
  // Fallback: return placeholder
  console.warn(`  Warning: No zhuyin mapping for pinyin: ${pinyin}`);
  return [['TODO', pinyin, 'TODO']];  // <-- Anti-pattern
}
```

**Why this is bad:**
- Writing "TODO" strings to production database is dangerous
- Silent data corruption
- Drill system may crash or behave unexpectedly
- Better to fail generation than silently corrupt

## Proposed Solutions

### Option A: Throw error instead (Recommended)
**Pros:** Fail fast, forces mapping to be complete
**Cons:** Blocks migration until all mappings added
**Effort:** Small (10 min)
**Risk:** Low

```javascript
if (!mapping) {
  throw new Error(`Missing zhuyin mapping for pinyin: ${pinyin}. Add to PINYIN_TO_ZHUYIN.`);
}
```

### Option B: Skip character and log to file
**Pros:** Allows partial migration
**Cons:** May miss characters silently
**Effort:** Medium (20 min)

### Option C: Add validation that rejects TODO before write
**Pros:** Catches at write time
**Cons:** Still generates broken JSON first
**Effort:** Small (10 min)

## Recommended Action
Apply Option A - fail fast when mapping is missing.

## Technical Details

**Affected files:**
- `scripts/generate-migration-011f-v2.cjs`
- `scripts/generate-migration-011g.cjs`

## Acceptance Criteria
- [ ] Replace TODO fallback with thrown error
- [ ] Error message includes pinyin value and instructions to fix
- [ ] Verify all current migrations don't have TODO values

## Work Log
| Date | Action | Notes |
|------|--------|-------|
| 2025-12-08 | Created | PR #27 code review finding |
| 2025-12-08 | Approved | Triage: marked ready for work |

## Resources
- PR #27: https://github.com/melodykoh/hanzi-dojo/pull/27
- Pattern recognition, simplicity reviews
