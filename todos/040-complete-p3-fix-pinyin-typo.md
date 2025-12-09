---
status: complete
priority: p3
issue_id: "040"
tags: [code-review, bug, pr-27]
dependencies: ["037"]
---

# Typo in PINYIN_TO_ZHUYIN Mapping

## Problem Statement

The PINYIN_TO_ZHUYIN mapping contains a known typo entry `nBné` that should be removed or fixed.

## Findings

**File:** `scripts/generate-migration-011f-v2.cjs:295`

**Current code:**
```javascript
'nBné': { parts: ['ㄋ', 'ㄜ', 'ˊ'] }, // Typo in source data
```

**Issue:** `nBné` is clearly malformed pinyin. This entry came from source data with a typo.

## Proposed Solutions

### Option A: Remove the entry (Recommended)
**Pros:** Simple, eliminates bad data
**Cons:** None
**Effort:** Small (5 min)
**Risk:** Low

### Option B: Fix to correct pinyin (if known)
**Pros:** Preserves intended mapping
**Cons:** Unknown what it should be
**Effort:** Small (research needed)

## Recommended Action
Remove the entry. If a valid `né` mapping is needed, add it correctly.

## Technical Details

**Affected file:**
- `scripts/generate-migration-011f-v2.cjs`

## Acceptance Criteria
- [ ] Remove `nBné` entry from mapping
- [ ] Add correct `né` mapping if needed: `'né': { parts: ['ㄋ', 'ㄜ', 'ˊ'] }`

## Work Log
| Date | Action | Notes |
|------|--------|-------|
| 2025-12-08 | Created | PR #27 code review finding |
| 2025-12-08 | Approved | Triage: marked ready for work |

## Resources
- PR #27: https://github.com/melodykoh/hanzi-dojo/pull/27
