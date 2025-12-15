---
status: complete
priority: p2
issue_id: "044"
tags: [code-quality, patterns, migrations, tooling]
dependencies: []
---

# DRY Violation - Migration Generation Tooling

## Problem Statement
Migration 016 contains 68 nearly identical UPDATE statements with only 3 values changing per statement. This represents ~70% code duplication (200+ lines of repetitive code). Not sustainable for larger datasets.

## Findings
- Location: `supabase/migrations/016_fix_remaining_malformed_zhuyin.sql:44-244`
- 68 UPDATE statements all follow the same pattern
- Each differs only in character, pronunciation data, and comment
- Error-prone to write/review (easy to miss typos in pronunciation data)
- Migration 009 had 912 characters - manual approach doesn't scale

## Proposed Solutions

### Option 1: Create Migration Generation Tooling
- **Pros**: Reusable for future migrations, validates data programmatically, DRY
- **Cons**: Requires upfront investment, current migration already deployed
- **Effort**: Medium (4-6 hours)
- **Risk**: Low

Implementation:
1. Create `/data/malformed_chars_016.json` with structured pronunciation data
2. Create `scripts/generate-migration-016.cjs` following existing patterns (011c, 011f)
3. Document in DICTIONARY_MIGRATION_GUIDE.md

## Recommended Action
Create tooling for FUTURE migrations. Document current migration's data source retroactively. Don't modify deployed migration 016.

## Technical Details
- **Affected Files**: New files to create
- **Related Components**: scripts/, data/, docs/operational/
- **Database Changes**: No

## Resources
- Original finding: PR #30 Code Review (pattern-recognition-specialist)
- Related patterns: scripts/generate-migration-011c.cjs, scripts/generate-migration-011f.cjs

## Acceptance Criteria
- [x] Data file created: `/data/migration_016_pronunciation_choices.json`
- [x] Generation script template documented
- [x] DICTIONARY_MIGRATION_GUIDE.md updated with "batch migration" pattern

## Work Log

### 2025-12-15 - Resolved
**By:** Claude Code
**Actions:**
- Created `/data/migration_016_pronunciation_choices.json` with all 68 character decisions
- Added "Batch Migrations with Many Rows" section to DICTIONARY_MIGRATION_GUIDE.md
- Documented generation script pattern with references to 011c, 011f

**Files Changed:**
- `data/migration_016_pronunciation_choices.json` (new)
- `docs/operational/DICTIONARY_MIGRATION_GUIDE.md` (updated)

### 2025-12-15 - Approved for Work
**By:** Claude Triage System
**Actions:**
- Issue approved during triage session
- Status: ready
- Ready to be picked up and worked on

**Learnings:**
- Manual SQL for >20 rows should use generation scripts
- Follows established pattern from migrations 011c, 011f

## Notes
Source: PR #30 Code Review Triage - 2025-12-15
