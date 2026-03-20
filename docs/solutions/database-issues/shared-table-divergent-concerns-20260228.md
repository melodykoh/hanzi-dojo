# Shared Table, Divergent Concerns — MOE Word Pairs Flooding Drill C

**Date:** 2026-02-28
**Session:** drill-c-ambiguity-moe
**Severity:** User-facing (advanced vocabulary appeared in 7-year-old's practice)

## Problem

86,394 MOE dictionary word pairs were seeded into `word_pairs` table to enable comprehensive conflict detection for Drill C. But `get_eligible_word_pairs` RPC returns ALL rows from `word_pairs`, so the MOE reference data immediately became practice content — flooding Drill C with advanced vocabulary (臉, 進, 極, 潑, 短).

## Root Cause

The `word_pairs` table served dual purposes:
1. **Practice content source** — what the kid actually drills on
2. **Conflict detection reference** — what constitutes an ambiguous round

Adding data for purpose #2 broke purpose #1. Classic shared-table, divergent-concerns problem.

## Key Insights

### 1. Ambiguity is pedagogical, not linguistic
Initial approach: detect ALL possible Chinese word conflicts. User testing revealed: ambiguity only matters if the child would recognize the alternative word. A 7-year-old doesn't know 日晷 (sundial), so it can't create real confusion.

**Fix:** Scope conflict detection to the kid's known character set, not all Chinese vocabulary.

### 2. External reference data without metadata can't be used for age-appropriate content
The MOE dictionary has NO grade, level, or frequency metadata — it's a flat list of valid 2-character words. Without difficulty signals, there's no way to progressively introduce MOE pairs as practice content. The only usable filter is the kid's own learned character set.

### 3. "char2 can be unknown" doesn't scale
Original Drill C design only requires char1 (left column) to be a learned character. With a small curated table this was fine. With 87k MOE pairs, any learned char1 pulls in thousands of advanced char2 values.

## Prevention Pattern

When seeding reference/lookup data into a table that also serves as application content:
- **Ask:** "Will this data also appear in user-facing queries?"
- **If yes:** Either use a separate table, or add a filter column (e.g., `category IS NOT NULL` for practice-eligible pairs)
- **Test with real users** — 6 code review agents approved the migration; only Vercel preview testing caught the impact

## Status

Proposed fix (`category IS NOT NULL` filter) not yet tested on production data. Tracked as unresolved.
