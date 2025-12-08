---
status: ready
priority: p3
issue_id: "035"
tags: [code-review, simplification, cleanup, pr-24]
dependencies: []
---

# P3: Delete Diagnostic Script and Research JSON After Merge

## Problem Statement

PR #24 includes a one-time diagnostic script (`scripts/categorize-malformed-chars.cjs`, 140 lines) and research data (`data/malformed_chars_fix.json`, 408 lines) that were used to analyze and plan the migration. These artifacts are no longer needed after the migration runs and add 548 lines to the repository.

**Why it matters:** Repository hygiene. These files cannot be reused (the migration fixes the data they analyze) and increase repo size without runtime benefit.

## Findings

**Files to Consider Removing:**

| File | Lines | Purpose | Post-Merge Use |
|------|-------|---------|----------------|
| `scripts/categorize-malformed-chars.cjs` | 140 | Analyze malformed chars | None (migration fixes them) |
| `data/malformed_chars_fix.json` | 408 | Research data for migration | None (duplicates SQL comments) |

**Arguments for Keeping:**
- Historical reference for future similar issues
- Understanding why migration decisions were made

**Arguments for Deleting:**
- Migration SQL has inline comments with same information
- Script would fail to find data after migration runs
- Git history preserves deleted files if needed

**Agent:** code-simplicity-reviewer

## Proposed Solutions

### Option 1: Delete both files after merge (Recommended)
**Pros:** 548 LOC removed, cleaner repo
**Cons:** Need to check git history for reference
**Effort:** Minimal (5 min follow-up PR)
**Risk:** Low

### Option 2: Move to /docs/historical/ or /data/backups/
**Pros:** Preserves in repo for reference
**Cons:** Still adds size, unclear lifecycle
**Effort:** Small (10 min)
**Risk:** Low

### Option 3: Keep as-is
**Pros:** No additional work
**Cons:** Repo clutter
**Effort:** None
**Risk:** Low (just clutter)

## Recommended Action

Use Option 1: Delete both files after PR #24 merge and production verification. Git history preserves them if needed later.

## Technical Details

**Files to Delete:**
- `scripts/categorize-malformed-chars.cjs`
- `data/malformed_chars_fix.json`

**Impact:**
- 548 LOC removed from repo
- No runtime changes
- No functional impact

**When to Execute:**
- After PR #24 is merged and migration verified in production
- Can be done as cleanup commit or separate PR

## Acceptance Criteria

- [ ] PR #24 merged successfully
- [ ] Migration 011e verified in production
- [ ] Delete files in follow-up cleanup
- [ ] Verify git history still accessible if needed

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2025-12-07 | Created from PR #24 code review | code-simplicity-reviewer identified research artifacts |
| 2025-12-07 | **Approved for work** | Triage approved - P3 cleanup, execute after merge |

## Resources

- PR #24: https://github.com/melodykoh/hanzi-dojo/pull/24
- Git history access: `git log --all --full-history -- data/malformed_chars_fix.json`
