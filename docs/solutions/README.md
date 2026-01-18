# Solutions & Learnings

**Purpose:** Document solved problems and prevention strategies so future sessions don't repeat mistakes.

> **⚠️ CHECK THIS DIRECTORY** before writing migrations, modifying RPC functions, or implementing drill features.

---

## Directory Structure

### `database-issues/`
SQL and Supabase gotchas that have caused production bugs.

| File | Issue | Key Takeaway |
|------|-------|--------------|
| `plpgsql-ambiguous-column-reference.md` | #40 | RETURNS TABLE creates OUT params that conflict with bare column names. Always use table aliases (`k.id` not `id`). |
| `incomplete-data-fix-scope-discovery-20251215.md` | - | Migration scope discovery patterns. |

### `process-learnings/`
Development process insights from significant sessions.

| File | Session | Key Takeaway |
|------|---------|--------------|
| `drill-c-session-learnings-20260112.md` | 23 | Playwright MCP cannot catch state stability, visual consistency, or mobile rendering. Manual QA required. |

---

## When to Add Documentation Here

Add a new solution document when:
1. A bug was introduced that could have been prevented with prior knowledge
2. A pattern or gotcha is non-obvious and likely to recur
3. The fix required significant investigation (hypothesis validation, not just code change)

## Document Template

```markdown
---
title: "Descriptive Title"
slug: kebab-case-slug
category: database-issues | process-learnings | frontend-issues
tags: [relevant, tags]
severity: critical | high | medium | low
component: affected-component
date_solved: YYYY-MM-DD
related_issues: ["#XX"]
related_migrations: ["migration_name.sql"]
---

# Title

## Problem Symptom
What the user/developer observed.

## Investigation Steps
How the root cause was discovered.

## Root Cause
Technical explanation of why it happened.

## Solution
The fix applied.

## Prevention Strategies
How to avoid this in the future (checklists, code patterns, etc.)
```

---

## Quick Reference: Common Gotchas

### Database/SQL
- **RETURNS TABLE + bare column names** → Use explicit table aliases (`k.id` not `id`)
- **SECURITY DEFINER without auth check** → Always verify `auth.uid()` owns the data
- **Migration modifying existing RPC** → Review why existing patterns exist before changing

### Frontend/React
- **useEffect with function deps** → Stabilize with useRef or useCallback
- **Math.random() in render** → Memoize with useMemo
- **Promise.all cascading failure** → Individual try/catch for non-critical calls

### Process
- **Playwright MCP passes but UI broken** → Manual QA for state stability, visual consistency
- **Data queries work but RPC fails** → Test RPC functions directly with real IDs
