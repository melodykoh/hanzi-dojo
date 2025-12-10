---
status: complete
priority: p2
issue_id: "037"
tags: [code-review, architecture, pr-27, technical-debt]
dependencies: []
---

# Massive Code Duplication: PINYIN_TO_ZHUYIN Mapping

## Problem Statement

The `PINYIN_TO_ZHUYIN` mapping object is duplicated across two migration generator scripts with ~70% overlap. This is 263 lines in one file and 128 lines in another - a major DRY violation that creates maintenance burden.

## Findings

**Files affected:**
- `scripts/generate-migration-011f-v2.cjs:41-303` (263 lines)
- `scripts/generate-migration-011g.cjs:29-156` (128 lines)

**Impact:**
- If a mapping is incorrect, it must be fixed in multiple places
- Already seeing inconsistencies and a known typo (`nBné` at line 295)
- Future scripts will likely copy-paste again

**Evidence of divergence:**
- 011f-v2 has 274 entries
- 011g has 128 entries (subset)
- Different edge cases covered in each

## Proposed Solutions

### Option A: Extract to shared module (Recommended)
**Pros:** Simple, immediate benefit, follows codebase patterns
**Cons:** Still hardcoded data
**Effort:** Medium (30 min)
**Risk:** Low

```javascript
// scripts/lib/pinyinToZhuyinMapping.cjs
module.exports = {
  PINYIN_TO_ZHUYIN: {
    'zhe': { parts: ['ㄓ', 'ㄜ', '˙'] },
    // ... consolidated mapping
  }
};

// Usage in both scripts:
const { PINYIN_TO_ZHUYIN } = require('./lib/pinyinToZhuyinMapping.cjs');
```

### Option B: Extract to JSON data file
**Pros:** Easier to maintain, can be edited without code changes
**Cons:** Loses inline documentation
**Effort:** Medium (30 min)

### Option C: Algorithmic generation
**Pros:** Handles all pinyin cases, no maintenance
**Cons:** More complex, requires research
**Effort:** Large (2-3 hours)

## Recommended Action
Start with Option A. Consider Option C for long-term if more scripts are added.

## Technical Details

**New file to create:**
- `scripts/lib/pinyinToZhuyinMapping.cjs`

**Files to update:**
- `scripts/generate-migration-011f-v2.cjs`
- `scripts/generate-migration-011g.cjs`

## Acceptance Criteria
- [ ] Create `scripts/lib/` directory
- [ ] Create shared `pinyinToZhuyinMapping.cjs` module
- [ ] Update both scripts to import shared module
- [ ] Remove duplicate code from both scripts
- [ ] Fix `nBné` typo in consolidated mapping
- [ ] Verify generated SQL output is identical

## Work Log
| Date | Action | Notes |
|------|--------|-------|
| 2025-12-08 | Created | PR #27 code review finding |
| 2025-12-08 | Approved | Triage: marked ready for work |

## Resources
- PR #27: https://github.com/melodykoh/hanzi-dojo/pull/27
- Architecture strategist, pattern recognition, simplicity reviews
