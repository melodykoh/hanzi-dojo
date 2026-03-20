---
title: "Supabase Migration Drift: Dashboard SQL Editor vs CLI Timestamp Mismatch"
slug: dashboard-to-cli-migration-drift
category: database-issues
tags:
  - supabase
  - migrations
  - supabase-cli
  - drift
severity: moderate
component: supabase/migrations
date_solved: 2026-03-19
---

# Supabase Migration Drift: Dashboard SQL Editor vs CLI Timestamp Mismatch

## Problem Symptom

**Observable Behavior:**
- `supabase db push` fails with migration drift errors
- Remote database has migration history entries that don't correspond to any local files

**Error Context:**
- Occurs when transitioning from "paste SQL in Supabase Dashboard" workflow to `supabase db push` CLI workflow
- The drift is silent — it accumulates without warning and only surfaces when you first attempt `db push`

## Root Cause

Two deployment methods create migration records with **different timestamp formats**:

| Method | Timestamp Format | Example |
|--------|-----------------|---------|
| Supabase Dashboard SQL Editor | Real clock time (YYYYMMDDHHMMSS) | `20260117211707` (9:17:07 PM) |
| Local migration files (hand-numbered) | Sequential per day (YYYYMMDD000NNN) | `20260117000001` |

When migrations were applied via Dashboard, Supabase recorded them in its `supabase_migrations.schema_migrations` table using clock timestamps. The local files for the same logical migrations use sequential timestamps. The CLI sees 4 remote records with no matching local files = drift.

## Fix

Mark the Dashboard-created records as reverted, then push the local files:

```sql
-- Step 1: Identify the drifted timestamps (remote-only, no local file match)
supabase migration list
-- Look for remote entries with clock-style timestamps that don't appear in local files

-- Step 2: Mark them as reverted
supabase migration repair --status reverted <timestamp1> <timestamp2> ...

-- Step 3: Re-push (local files are now the source of truth)
supabase db push
```

In this case:
```bash
supabase migration repair --status reverted 20260117211707 20260118150805 20260118192258 20260118200307
supabase db push  # Applied 10 migrations cleanly
```

## Prevention

- Use `supabase db push` consistently (now that CLI is installed locally)
- If you must run SQL directly in Dashboard, use `supabase migration new` to create the local file first — this uses clock timestamps that will match
- The sequential `000001` naming convention for local files is fine as long as all deployments go through `db push`

## How to Detect

- `supabase migration list` shows a table with Local vs Remote columns
- Drift = remote entries with no local match (or vice versa)
- Clock-format timestamps (e.g., `211707`) in remote history are a sign of Dashboard-applied migrations
