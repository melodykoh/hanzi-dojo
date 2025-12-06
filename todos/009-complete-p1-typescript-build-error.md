---
status: complete
priority: p1
issue_id: "009"
tags: [bug, typescript, build-failure, pr-19]
dependencies: []
---

# TypeScript Build Error - Wrong Argument Order in PracticeCard

## Problem Statement
The `buildDrillAOptions` function call in PracticeCard.tsx passes arguments in the wrong order, causing a TypeScript type error that blocks all builds and deployments.

## Findings
- **Location:** `src/components/PracticeCard.tsx:69-72`
- **Error:** `TS2559: Type 'ZhuyinSyllable[][]' has no properties in common with type 'ConfusionData'`
- **Root Cause:** Function signature is `(correctZhuyin, allValidPronunciations, confusionData)` but code passes `(correctZhuyin, undefined, allValidPronunciations)`
- **Impact:** Build fails - cannot deploy to production

## Proposed Solutions

### Option 1: Fix argument order (Recommended)
Change the function call to pass arguments in correct order:
```typescript
// FROM:
buildDrillAOptions(queueEntry.reading.zhuyin, undefined, allValidPronunciations)
// TO:
buildDrillAOptions(queueEntry.reading.zhuyin, allValidPronunciations)
```
- **Pros**: Simple fix, matches function signature, removes unnecessary `undefined`
- **Cons**: None
- **Effort**: Small (< 15 minutes)
- **Risk**: Low

## Recommended Action
Fix the argument order in PracticeCard.tsx line 69-72. The `allValidPronunciations` should be the 2nd parameter, not the 3rd.

## Technical Details
- **Affected Files**: `src/components/PracticeCard.tsx`
- **Related Components**: DrillA options generation, buildDrillAOptions function
- **Database Changes**: No

## Resources
- Original finding: PR #19 code review (Session 17)
- Function signature: `src/lib/drillBuilders.ts:376-379`

## Acceptance Criteria
- [ ] `npx tsc --noEmit` passes with no errors
- [ ] Drill A correctly excludes alternate pronunciations from distractors
- [ ] Build succeeds on Vercel

## Work Log

### 2025-12-06 - Approved for Work
**By:** Claude Triage System
**Actions:**
- Issue discovered during PR #19 code review
- TypeScript compilation revealed argument order mismatch
- Status set to ready - critical build blocker

**Learnings:**
- PR #17 changed buildDrillAOptions signature but this call site wasn't updated correctly
- Always run `npx tsc --noEmit` before committing

## Notes
Source: Triage session on 2025-12-06
PR: #19 (fix/issue18-chu-pronunciation)
