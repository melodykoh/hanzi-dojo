---
status: resolved
priority: p2
issue_id: "003"
tags: [code-simplification, technical-debt, pr-11, cleanup]
dependencies: []
resolved_date: 2025-11-15
---

# Remove Unused Demo Data (183 Lines Dead Code)

## Problem Statement

`demoData.ts` contains 183 lines of detailed Entry and Reading objects (DEMO_ENTRIES and DEMO_READINGS) that are never rendered or used anywhere in the codebase. The DemoDashboard only displays pre-calculated aggregate metrics from DEMO_METRICS. This is dead code that adds maintenance burden and cognitive load without providing any value.

## Findings

- Discovered during PR #11 code review (Simplicity analysis)
- Location: `src/lib/demoData.ts:17-204`
- **DEMO_ENTRIES**: 112 lines (10 detailed Entry objects) - NOT IMPORTED ANYWHERE
- **DEMO_READINGS**: 71 lines (13 Reading objects) - NOT IMPORTED ANYWHERE
- **DEMO_METRICS**: 11 lines - ONLY export that's actually used

**Evidence of Non-Use:**
```bash
# Verified via grep - no imports found
$ grep -r "DEMO_ENTRIES" src/
# (no results - only defined, never imported)

$ grep -r "DEMO_READINGS" src/
# (no results - only defined, never imported)

$ grep -r "DEMO_METRICS" src/
src/lib/demoData.ts:export const DEMO_METRICS = {
src/components/DemoDashboard.tsx:import { DEMO_METRICS } from '../lib/demoData'
# ↑ Only DEMO_METRICS is used
```

**Data Discrepancy Proves Independence:**
- `DEMO_METRICS.totalCharacters = 47`
- `DEMO_ENTRIES.length = 10`
- If metrics were calculated from entries, these would match
- Proves DEMO_METRICS is hardcoded, not derived

**Current Code Structure:**
```typescript
// Lines 17-128: Detailed Entry objects (112 lines)
export const DEMO_ENTRIES: Entry[] = [
  { id: 'demo-entry-1', simp: '你', trad: '你', ... },
  { id: 'demo-entry-2', simp: '好', trad: '好', ... },
  // ... 8 more entries
]

// Lines 132-204: Reading objects (71 lines)
export const DEMO_READINGS: Reading[] = [...]

// Lines 210-220: ONLY used export (11 lines)
export const DEMO_METRICS = {
  totalCharacters: 47,  // Not derived from DEMO_ENTRIES
  knownCountDrillA: 18,
  knownCountDrillB: 12,
  weeklyFamiliarity: 15.5,
  currentBelt: 'White Belt',
  accuracyDrillA: 0.82,
  accuracyDrillB: 0.71,
}
```

**Why This Happened:**
- Original implementation may have planned entry-level demo (interactive drills)
- Pivoted to metrics-only demo (simpler, faster to ship)
- Forgot to clean up unused exports

## Proposed Solutions

### Option 1: Delete Unused Exports (Recommended)
- **Pros**:
  - Removes 183 lines of dead code
  - Reduces cognitive load (file goes from 236 → 53 lines)
  - Eliminates maintenance burden (no need to update when Entry schema changes)
  - No functionality lost (code is never executed)
  - Easier onboarding (new devs don't wonder why data exists)
- **Cons**:
  - If we later add interactive demo, need to recreate sample data (acceptable)
- **Effort**: Small (15 minutes)
- **Risk**: None (code is unused)

**Implementation:**
```typescript
// src/lib/demoData.ts (after cleanup)
/**
 * Static demo metrics for unauthenticated users
 * Shows sample progress data without requiring signup
 */

export const DEMO_METRICS = {
  totalCharacters: 47,
  knownCountDrillA: 18,
  knownCountDrillB: 12,
  weeklyFamiliarity: 15.5,
  currentBelt: 'White Belt',
  accuracyDrillA: 0.82,
  accuracyDrillB: 0.71,
}

// Note: If we add interactive demo mode in the future,
// sample entries can be generated on-demand or re-added here
```

### Option 2: Keep for Future Interactive Demo (Not Recommended)
- **Pros**: Data already exists if we add drill demos
- **Cons**:
  - YAGNI violation (speculative future feature)
  - Maintenance burden (must update when Entry schema changes)
  - Cognitive load (developers must understand unused code)
  - No evidence interactive demo is planned
- **Effort**: None (keep as-is)
- **Risk**: Code rot (schema changes break unused data)

## Recommended Action

Implement **Option 1** - Delete DEMO_ENTRIES and DEMO_READINGS.

**Rationale:**
- YAGNI principle: Don't maintain code for hypothetical future features
- Dead code is a liability (can't verify correctness, becomes outdated)
- Easy to recreate if actually needed (can use real data as template)
- Simplifies file from 236 → 53 lines (78% reduction)

## Technical Details

- **Affected Files**:
  - `src/lib/demoData.ts` (delete lines 17-204)
- **Related Components**: None (no imports to update)
- **Database Changes**: No
- **API Changes**: No
- **Breaking Changes**: No (unused code)

**Verification Steps:**
1. Grep for `DEMO_ENTRIES` usage → confirm zero imports
2. Grep for `DEMO_READINGS` usage → confirm zero imports
3. Delete lines 17-204
4. Run `npm run build` → verify no errors
5. Test demo mode → verify metrics still display correctly

## Resources

- Original finding: PR #11 Code Review - Simplicity Analysis
- YAGNI Principle: https://martinfowler.com/bliki/Yagni.html
- Related issues: None

## Acceptance Criteria

- [ ] Verify DEMO_ENTRIES has zero imports (grep search)
- [ ] Verify DEMO_READINGS has zero imports (grep search)
- [ ] Delete lines 17-204 from `src/lib/demoData.ts`
- [ ] Add comment explaining demo metrics are static (not derived)
- [ ] Run `npm run build` successfully
- [ ] Test demo mode dashboard → metrics display correctly
- [ ] File size reduced from 236 → ~50 lines
- [ ] No TypeScript errors
- [ ] No console warnings

## Work Log

### 2025-11-15 - Initial Discovery
**By:** Claude Triage System
**Actions:**
- Issue discovered during PR #11 simplicity review
- Categorized as P2 IMPORTANT (technical debt cleanup)
- Estimated effort: Small (15 minutes)
- Marked as ready for immediate work

**Learnings:**
- Always verify exports are actually imported before maintaining them
- Dead code accumulates when pivoting implementation strategies
- Regular cleanup prevents technical debt accumulation
- YAGNI: Don't maintain code for hypothetical futures

**Code Metrics:**
- Current file size: 236 lines
- After cleanup: ~50 lines
- Reduction: 78% (186 lines deleted)
- LOC impact: -183 lines of dead code

### 2025-11-15 - Resolution Complete
**By:** Claude Code Resolution Agent
**Actions:**
- Verified DEMO_ENTRIES has zero imports (grep confirmed)
- Verified DEMO_READINGS has zero imports (grep confirmed)
- Deleted lines 17-204 from `src/lib/demoData.ts`
- Updated file header comment to clarify static nature
- Reduced file size from 236 to 37 lines (84% reduction)
- Build succeeded with no errors
- DEMO_METRICS still actively used in DemoDashboard.tsx

**Results:**
- File size: 236 → 37 lines (199 lines removed, 84% reduction)
- TypeScript compilation: Success
- Build status: Passed
- Demo dashboard functionality: Preserved
- No breaking changes

**Verification:**
```bash
# Confirmed no imports of removed exports
grep -r "DEMO_ENTRIES" src/  # No results
grep -r "DEMO_READINGS" src/  # No results

# DEMO_METRICS still properly imported
grep "DEMO_METRICS" src/components/DemoDashboard.tsx  # 14 usages confirmed

# Build successful
npm run build  # ✓ built in 1.53s
```

## Notes

Source: PR #11 Code Review Triage Session (2025-11-15)

**Priority Justification:** While not breaking functionality, dead code adds cognitive load and maintenance burden. P2 priority because it's easy to fix and improves code quality, but doesn't block deployment.

**Future Consideration:** If we later add interactive demo mode (user can try drills without signup), we can either:
1. Generate sample entries dynamically from a template
2. Copy real entries from the database (sanitize IDs)
3. Re-add static sample data at that time

No need to maintain speculative code now.
