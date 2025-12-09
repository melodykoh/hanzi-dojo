---
status: complete
priority: p3
issue_id: "043"
tags: [code-review, documentation, pr-27]
dependencies: []
---

# Missing Scripts Directory in REPO_STRUCTURE.md

## Problem Statement

The `/scripts` directory has grown to 9 files but is not documented in `REPO_STRUCTURE.md`. No guidance exists for where to place new scripts or how to organize shared code.

## Findings

**Current state:**
- 9 scripts in `/scripts/` directory
- No mention of `/scripts` in `REPO_STRUCTURE.md`
- No `/scripts/lib/` convention established
- Duplicate code accumulating across scripts

## Proposed Solutions

### Option A: Add scripts section to REPO_STRUCTURE.md (Recommended)
**Pros:** Documents convention, guides future work
**Cons:** None
**Effort:** Small (15 min)
**Risk:** Low

Add to `REPO_STRUCTURE.md`:
```markdown
## /scripts — Build & Migration Tooling

```
/scripts
├── /lib                        # Shared utilities and modules
│   ├── pinyinToZhuyinMapping.cjs  # Pinyin→Zhuyin conversion table
│   ├── sqlUtils.cjs               # SQL escaping and formatting
│   └── dictionaryLoader.cjs       # Common dictionary loading logic
├── analyze-*.cjs               # Analysis scripts (read-only)
├── compile-*.cjs               # Data compilation scripts
└── generate-migration-*.cjs    # SQL migration generators
```

### Scripts Guidelines
- **Shared code**: Extract to `/scripts/lib` when function used in 2+ files
- **Naming**: `{verb}-{noun}.cjs` (e.g., `analyze-polyphone-gap.cjs`)
- **Shebang**: All scripts must start with `#!/usr/bin/env node`
- **Single responsibility**: Each script does one thing well
```

## Recommended Action
Apply Option A when implementing todo #037 (shared lib directory).

## Technical Details

**Affected file:**
- `REPO_STRUCTURE.md`

## Acceptance Criteria
- [ ] Add `/scripts` section to REPO_STRUCTURE.md
- [ ] Document `/scripts/lib/` convention
- [ ] Include naming and organization guidelines

## Work Log
| Date | Action | Notes |
|------|--------|-------|
| 2025-12-08 | Created | PR #27 code review finding |
| 2025-12-08 | Approved | Triage: marked ready for work |

## Resources
- PR #27: https://github.com/melodykoh/hanzi-dojo/pull/27
- Architecture strategist review
