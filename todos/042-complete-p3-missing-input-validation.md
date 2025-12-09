---
status: complete
priority: p3
issue_id: "042"
tags: [code-review, security, pr-27]
dependencies: []
---

# No Input Validation for Required JSON Files

## Problem Statement

The migration generator scripts load JSON files without validating they exist or contain valid structure. Missing files cause cryptic errors.

## Findings

**Files affected:**
- `scripts/generate-migration-011f-v2.cjs:22-27`
- `scripts/generate-migration-011g.cjs:17`
- `scripts/analyze-polyphone-gap.cjs:19-26`

**Current code (example):**
```javascript
const contextResearch = JSON.parse(fs.readFileSync(path.join(dataDir, 'context_words_011c_remaining.json'), 'utf-8'));
// No try-catch, will throw obscure error if file missing
```

**Risk:** If JSON files are missing or corrupted:
- Cryptic error messages
- Partial migrations may be generated
- No way to know which file caused the issue

## Proposed Solutions

### Option A: Add file existence validation (Recommended)
**Pros:** Clear error messages, fast
**Cons:** Adds boilerplate
**Effort:** Small (15 min)
**Risk:** Low

```javascript
const REQUIRED_FILES = [
  'context_words_011c_remaining.json',
  'dictionary_expansion_v2.json',
  'dictionary_seed_v1.json'
];

REQUIRED_FILES.forEach(file => {
  const filePath = path.join(dataDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`ERROR: Required file not found: ${filePath}`);
    process.exit(1);
  }
});
```

### Option B: Add JSON schema validation
**Pros:** Catches structure errors too
**Cons:** More complex, needs schema definition
**Effort:** Medium (1 hour)

## Recommended Action
Apply Option A for immediate improvement. Consider Option B for future robustness.

## Technical Details

**Affected files:**
- All 3 migration scripts

## Acceptance Criteria
- [ ] Add file existence check at start of each script
- [ ] Clear error message includes full file path
- [ ] Script exits with non-zero code on missing file

## Work Log
| Date | Action | Notes |
|------|--------|-------|
| 2025-12-08 | Created | PR #27 code review finding |
| 2025-12-08 | Approved | Triage: marked ready for work |

## Resources
- PR #27: https://github.com/melodykoh/hanzi-dojo/pull/27
- Security sentinel, architecture strategist reviews
