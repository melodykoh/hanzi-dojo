---
status: complete
priority: p2
issue_id: "039"
tags: [code-review, data-integrity, pr-27]
dependencies: []
---

# No JSONB Structure Validation Before Database Insert

## Problem Statement

The migration generators create JSONB data structures that are inserted into the database without validation. Malformed entries could corrupt dictionary queries and break the drill system.

## Findings

**Files affected:**
- `scripts/generate-migration-011f-v2.cjs:380-381`
- `scripts/generate-migration-011g.cjs:208`

**Issue:** Generated JSONB is never validated against expected schema:
```javascript
const variantsJson = JSON.stringify(variants);
// No validation happens here
```

**Evidence of structural inconsistencies found in generated SQL:**
- Some entries have empty `zhuyin` middle component: `[["ㄕ","","ˊ"]]`
- Some entries have empty `context_words: []`
- Some entries have empty `meanings: []`

**Risk:** If `pinyinToZhuyinArray()` returns malformed data (like `['TODO', pinyin, 'TODO']`), it gets written to production.

## Proposed Solutions

### Option A: Runtime validation in generator (Recommended)
**Pros:** Catches errors before SQL is generated
**Cons:** Adds code complexity
**Effort:** Medium (30 min)
**Risk:** Low

```javascript
function validateVariant(variant) {
  if (!variant.pinyin || typeof variant.pinyin !== 'string')
    throw new Error('Invalid pinyin');
  if (!Array.isArray(variant.zhuyin) || variant.zhuyin.length === 0)
    throw new Error('Invalid zhuyin structure');
  if (!Array.isArray(variant.context_words))
    throw new Error('context_words must be array');
  // Check for TODO placeholders
  if (JSON.stringify(variant.zhuyin).includes('TODO'))
    throw new Error(`Incomplete zhuyin for ${variant.pinyin}`);
  return true;
}

variants.forEach(validateVariant);
```

### Option B: PostgreSQL validation function
**Pros:** Database-level protection
**Cons:** More complex, requires migration
**Effort:** Large (1 hour)

## Recommended Action
Apply Option A to both generator scripts.

## Technical Details

**Affected files:**
- `scripts/generate-migration-011f-v2.cjs`
- `scripts/generate-migration-011g.cjs`

## Acceptance Criteria
- [ ] Add `validateVariant()` function to generators
- [ ] Validate all variants before JSON.stringify()
- [ ] Throw error on TODO placeholders (fail fast)
- [ ] Document expected JSONB structure

## Work Log
| Date | Action | Notes |
|------|--------|-------|
| 2025-12-08 | Created | PR #27 code review finding |
| 2025-12-08 | Approved | Triage: marked ready for work |

## Resources
- PR #27: https://github.com/melodykoh/hanzi-dojo/pull/27
- Data integrity guardian, security sentinel reviews
