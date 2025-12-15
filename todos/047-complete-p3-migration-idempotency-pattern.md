---
status: complete
priority: p3
issue_id: "047"
tags: [code-quality, migrations, best-practices]
dependencies: []
---

# IF NOT EXISTS Inappropriate for One-Time Migrations

## Problem Statement
Backup tables in Migration 016 use `CREATE TABLE IF NOT EXISTS`. Migrations should run exactly once - if run twice, something is broken and should fail loudly, not silently skip.

## Findings
- Location: `supabase/migrations/016_fix_remaining_malformed_zhuyin.sql:15,19`
- Pattern: `CREATE TABLE IF NOT EXISTS dictionary_entries_backup_016 AS ...`
- Risk: If migration runs twice, backup contains already-fixed data (useless for rollback)
- Error masked instead of surfaced

## Proposed Solutions

### Option 1: Document Best Practice for Future Migrations
- **Pros**: Prevents future occurrences, establishes standard
- **Cons**: Doesn't fix deployed migration (acceptable)
- **Effort**: Small (30 minutes)
- **Risk**: Low

Add to DICTIONARY_MIGRATION_GUIDE.md:
```markdown
## Migration Best Practices

### Backup Table Creation
Use `CREATE TABLE` (NOT `IF NOT EXISTS`) for backup tables:
- Migrations should run exactly once
- Re-running indicates an error that should fail loudly
- `IF NOT EXISTS` masks problems (backup would contain already-fixed data)

❌ Wrong:
CREATE TABLE IF NOT EXISTS backup_016 AS SELECT * FROM ...;

✅ Correct:
CREATE TABLE backup_016 AS SELECT * FROM ...;
```

## Recommended Action
Document in DICTIONARY_MIGRATION_GUIDE.md as best practice for future migrations. Current migration already deployed - no changes needed.

## Technical Details
- **Affected Files**: `docs/operational/DICTIONARY_MIGRATION_GUIDE.md`
- **Related Components**: All future migrations
- **Database Changes**: No

## Resources
- Original finding: PR #30 Code Review (code-simplicity-reviewer)

## Acceptance Criteria
- [x] Best practice documented in DICTIONARY_MIGRATION_GUIDE.md
- [x] Explains why `IF NOT EXISTS` is inappropriate for one-time migrations

## Work Log

### 2025-12-15 - Resolved
**By:** Claude Code
**Actions:**
- Added "Backup Table Creation" section to DICTIONARY_MIGRATION_GUIDE.md
- Documented why IF NOT EXISTS is inappropriate for backup tables
- Included correct vs incorrect SQL examples

**Files Changed:**
- `docs/operational/DICTIONARY_MIGRATION_GUIDE.md` (updated)

### 2025-12-15 - Approved for Work
**By:** Claude Triage System
**Actions:**
- Issue approved during triage session
- Status: ready

**Learnings:**
- Migrations should fail fast on re-run, not silently skip steps

## Notes
Source: PR #30 Code Review Triage - 2025-12-15
